import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { RESERVED_SLUGS } from "@darbha/types";
import { PrismaService } from "../prisma/prisma.service";
import { TenantsService } from "../tenants/tenants.service";
import { InviteService } from "../invites/invite.service";
import type { CreateApplicationDto, ReviewApplicationDto } from "./dto";

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenants: TenantsService,
    private readonly invites: InviteService,
  ) {}

  async submit(dto: CreateApplicationDto) {
    if (RESERVED_SLUGS.includes(dto.requestedSlug)) {
      throw new ConflictException(`"${dto.requestedSlug}" is reserved, pick another subdomain`);
    }
    const taken = await this.prisma.client.tenant.findUnique({
      where: { slug: dto.requestedSlug },
    });
    if (taken) {
      throw new ConflictException(`${dto.requestedSlug}.darbha.info is already taken`);
    }
    const pending = await this.prisma.client.application.findFirst({
      where: { requestedSlug: dto.requestedSlug, status: "pending" },
    });
    if (pending) {
      throw new ConflictException(`An application for "${dto.requestedSlug}" is already pending`);
    }

    return this.prisma.client.application.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        requestedSlug: dto.requestedSlug,
        email: dto.email,
        phone: dto.phone,
        message: dto.message,
        genre: dto.genre,
      },
    });
  }

  list(status?: "pending" | "approved" | "rejected") {
    return this.prisma.client.application.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
    });
  }

  /** Approving creates the tenant so the subdomain goes live immediately. */
  async review(id: string, dto: ReviewApplicationDto) {
    const application = await this.prisma.client.application.findUnique({ where: { id } });
    if (!application) throw new NotFoundException("Application not found");
    if (application.status !== "pending") {
      throw new ConflictException("Application already reviewed");
    }

    if (dto.status === "rejected") {
      return this.prisma.client.application.update({
        where: { id },
        data: { status: "rejected" },
      });
    }

    // Tenant creation and the status flip commit together, so a crash can
    // never strand an approved-in-spirit application as un-approvable. If a
    // tenant with this slug already exists FOR THIS APPLICANT (a resumed
    // half-approval from before this was transactional), reuse it; a slug
    // taken by someone else still conflicts as before.
    const displayName = `${application.firstName} ${application.lastName}`;
    const { tenant, updated } = await this.prisma.client.$transaction(async (tx) => {
      const existing = await tx.tenant.findUnique({
        where: { slug: application.requestedSlug },
      });
      const tenant =
        existing && existing.displayName === displayName
          ? existing
          : await this.tenants.create(
              { slug: application.requestedSlug, displayName, genre: application.genre },
              tx,
            );
      const updated = await tx.application.update({
        where: { id },
        data: { status: "approved" },
      });
      return { tenant, updated };
    });

    // Best-effort, after the durable writes: the site is live even if the
    // invite email fails — the admin sees the outcome and can onboard manually.
    const invite = await this.invites.inviteWriter(application.email, tenant.id);

    return { application: updated, tenant, invite };
  }
}
