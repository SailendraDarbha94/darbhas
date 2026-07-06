import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { RESERVED_SLUGS } from "@darbha/types";
import type { Prisma } from "@darbha/db";
import { PrismaService } from "../prisma/prisma.service";
import type { AuthUser } from "../auth/supabase-auth.guard";
import type { CreateTenantDto, UpdateTenantDto } from "./dto";

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  listActive() {
    return this.prisma.client.tenant.findMany({
      where: { status: "active" },
      orderBy: { createdAt: "asc" },
    });
  }

  listAll() {
    return this.prisma.client.tenant.findMany({ orderBy: { createdAt: "asc" } });
  }

  async getBySlugWithWorks(slug: string) {
    const tenant = await this.prisma.client.tenant.findFirst({
      where: { slug, status: "active" },
      include: {
        works: {
          where: { published: true },
          orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
        },
      },
    });
    if (!tenant) throw new NotFoundException(`No tenant with slug "${slug}"`);
    return tenant;
  }

  async create(dto: CreateTenantDto) {
    if (RESERVED_SLUGS.includes(dto.slug)) {
      throw new ConflictException(`Slug "${dto.slug}" is reserved`);
    }
    const existing = await this.prisma.client.tenant.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException(`Slug "${dto.slug}" is already taken`);

    return this.prisma.client.tenant.create({
      data: {
        slug: dto.slug,
        displayName: dto.displayName,
        tagline: dto.tagline,
        genre: dto.genre,
        bio: dto.bio,
        theme: (dto.theme ?? { preset: "ivory" }) as Prisma.InputJsonValue,
        avatarUrl: dto.avatarUrl,
        ownerUserId: dto.ownerUserId,
      },
    });
  }

  async update(id: string, dto: UpdateTenantDto, user: AuthUser) {
    if (user.role !== "admin" && user.tenantId !== id) {
      throw new ForbiddenException("You can only edit your own site");
    }
    // Writers cannot reassign ownership or hide themselves via this route.
    const { ownerUserId, status, ...writerSafe } = dto;
    const data = user.role === "admin" ? dto : writerSafe;

    const tenant = await this.prisma.client.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException("Tenant not found");

    return this.prisma.client.tenant.update({
      where: { id },
      data: { ...data, theme: data.theme as Prisma.InputJsonValue | undefined },
    });
  }

  async remove(id: string) {
    await this.prisma.client.tenant.delete({ where: { id } });
    return { ok: true };
  }
}
