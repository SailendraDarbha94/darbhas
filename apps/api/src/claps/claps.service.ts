import { createHmac } from "node:crypto";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MAX_CLAPS_PER_READER, type ClapState } from "@darbha/types";
import { PrismaService } from "../prisma/prisma.service";

/**
 * Backstop for readers who clear storage to clap again: claps on one work from
 * one IP stop here, across every browser id. Generous on purpose — households
 * and mobile carriers put many real readers behind a single address.
 */
const MAX_CLAPS_PER_IP = MAX_CLAPS_PER_READER * 5;

@Injectable()
export class ClapsService {
  private readonly ipKey: string;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    // Any server-side secret works as the HMAC key; IP_HASH_SALT lets it be
    // rotated independently of the database password.
    this.ipKey = config.get<string>("IP_HASH_SALT") ?? config.get<string>("DATABASE_URL") ?? "";
  }

  async get(workId: string, ip: string, visitorId?: string): Promise<ClapState> {
    await this.assertClappable(workId);
    return this.state(workId, this.hashIp(ip), visitorId);
  }

  async clap(workId: string, visitorId: string, count: number, ip: string): Promise<ClapState> {
    await this.assertClappable(workId);
    const ipHash = this.hashIp(ip);
    const allowed = Math.min(count, await this.ipRoom(workId, ipHash, visitorId));

    if (allowed > 0) {
      // One atomic statement, so rapid parallel taps can't overshoot the
      // per-reader cap. The row moves to the network clapping now, so its
      // claps keep counting against whichever IP the reader is on.
      await this.prisma.client.$executeRaw`
        insert into claps (id, work_id, visitor_id, ip_hash, count, created_at, updated_at)
        values (gen_random_uuid(), ${workId}::uuid, ${visitorId}::uuid, ${ipHash},
                least(${allowed}::int, ${MAX_CLAPS_PER_READER}::int), now(), now())
        on conflict (work_id, visitor_id) do update
          set count = least(claps.count + excluded.count, ${MAX_CLAPS_PER_READER}::int),
              ip_hash = excluded.ip_hash,
              updated_at = now()`;
    }
    return this.state(workId, ipHash, visitorId);
  }

  private hashIp(ip: string): string {
    return createHmac("sha256", this.ipKey).update(ip).digest("hex");
  }

  /**
   * Claps this network may still add to a work. The caller's own row counts
   * too, wherever it was first filed, so hopping networks (wifi -> cellular,
   * a VPN) can't escape the backstop.
   */
  private async ipRoom(workId: string, ipHash: string, visitorId?: string): Promise<number> {
    const fromIp = await this.prisma.client.clap.aggregate({
      where: visitorId ? { workId, OR: [{ ipHash }, { visitorId }] } : { workId, ipHash },
      _sum: { count: true },
    });
    return MAX_CLAPS_PER_IP - (fromIp._sum.count ?? 0);
  }

  private async state(workId: string, ipHash: string, visitorId?: string): Promise<ClapState> {
    const [sum, mine, room] = await Promise.all([
      this.prisma.client.clap.aggregate({ where: { workId }, _sum: { count: true } }),
      visitorId
        ? this.prisma.client.clap.findUnique({
            where: { workId_visitorId: { workId, visitorId } },
            select: { count: true },
          })
        : null,
      this.ipRoom(workId, ipHash, visitorId),
    ]);
    const mineCount = mine?.count ?? 0;
    return {
      total: sum._sum.count ?? 0,
      mine: mineCount,
      max: MAX_CLAPS_PER_READER,
      limited: room <= 0 && mineCount < MAX_CLAPS_PER_READER,
    };
  }

  /** Only works a visitor can actually read: published, on a visible site. */
  private async assertClappable(workId: string) {
    const work = await this.prisma.client.work.findFirst({
      where: { id: workId, published: true, tenant: { status: "active" } },
      select: { id: true },
    });
    if (!work) throw new NotFoundException("Work not found");
  }
}
