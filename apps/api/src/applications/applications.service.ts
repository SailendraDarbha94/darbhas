import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { RESERVED_SLUGS } from "@darbha/types";
import { PrismaService } from "../prisma/prisma.service";
import { TenantsService } from "../tenants/tenants.service";
import type { CreateApplicationDto, ReviewApplicationDto } from "./dto";

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenants: TenantsService,
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

    const tenant = await this.tenants.create({
      slug: application.requestedSlug,
      displayName: `${application.firstName} ${application.lastName}`,
      genre: application.genre,
    });

    const updated = await this.prisma.client.application.update({
      where: { id },
      data: { status: "approved" },
    });

    return { application: updated, tenant };
  }
}
