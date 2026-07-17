import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { Prisma } from "@darbha/db";
import { PrismaService } from "../prisma/prisma.service";
import type { AuthUser } from "../auth/supabase-auth.guard";
import type { CreateWorkDto, UpdateWorkDto } from "./dto";

@Injectable()
export class WorksService {
  constructor(private readonly prisma: PrismaService) {}

  /** Works the caller can manage: own tenant for writers, everything for admins. */
  listMine(user: AuthUser) {
    if (user.role === "admin") {
      return this.prisma.client.work.findMany({
        orderBy: [{ tenantId: "asc" }, { sortOrder: "asc" }],
        include: { tenant: { select: { slug: true, displayName: true } } },
      });
    }
    if (!user.tenantId) return [];
    return this.prisma.client.work.findMany({
      where: { tenantId: user.tenantId },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    });
  }

  async getOne(id: string, user: AuthUser) {
    const work = await this.prisma.client.work.findUnique({ where: { id } });
    if (!work) throw new NotFoundException("Work not found");
    this.assertCanTouch(work.tenantId, user);
    return work;
  }

  async create(dto: CreateWorkDto, user: AuthUser) {
    const tenantId = user.role === "admin" ? (dto.tenantId ?? user.tenantId) : user.tenantId;
    if (!tenantId) throw new BadRequestException("No tenant to attach this work to");
    if (user.role !== "admin" && dto.tenantId && dto.tenantId !== user.tenantId) {
      throw new ForbiddenException("You can only add works to your own site");
    }

    return this.prisma.client.work.create({
      data: {
        tenantId,
        type: dto.type,
        title: dto.title,
        body: dto.body ?? "",
        lang: dto.lang ?? "en",
        excerpt: dto.excerpt,
        coverUrl: dto.coverUrl,
        media: (dto.media ?? {}) as Prisma.InputJsonValue,
        tags: dto.tags ?? [],
        published: dto.published ?? false,
        // An explicit date (when the piece was written) beats the upload date.
        publishedAt: dto.publishedAt
          ? new Date(dto.publishedAt)
          : dto.published
            ? new Date()
            : null,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async update(id: string, dto: UpdateWorkDto, user: AuthUser) {
    const work = await this.prisma.client.work.findUnique({ where: { id } });
    if (!work) throw new NotFoundException("Work not found");
    this.assertCanTouch(work.tenantId, user);

    const hasExplicitDate = dto.publishedAt !== undefined;
    return this.prisma.client.work.update({
      where: { id },
      data: {
        ...dto,
        media: dto.media as Prisma.InputJsonValue | undefined,
        // An explicit date wins; otherwise stamp on the pending -> published
        // transition and clear on unpublish, as before.
        ...(hasExplicitDate ? { publishedAt: new Date(dto.publishedAt!) } : {}),
        ...(!hasExplicitDate && dto.published === true && !work.published
          ? { publishedAt: new Date() }
          : {}),
        ...(!hasExplicitDate && dto.published === false ? { publishedAt: null } : {}),
      },
    });
  }

  async remove(id: string, user: AuthUser) {
    const work = await this.prisma.client.work.findUnique({ where: { id } });
    if (!work) throw new NotFoundException("Work not found");
    this.assertCanTouch(work.tenantId, user);
    await this.prisma.client.work.delete({ where: { id } });
    return { ok: true };
  }

  private assertCanTouch(tenantId: string, user: AuthUser) {
    if (user.role !== "admin" && user.tenantId !== tenantId) {
      throw new ForbiddenException("This work belongs to another site");
    }
  }
}
