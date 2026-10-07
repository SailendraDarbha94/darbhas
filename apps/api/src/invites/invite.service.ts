import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { InviteResult } from "@darbha/types";
import { PrismaService } from "../prisma/prisma.service";

/**
 * Sends the "set up your writer login" invite — on application approval, or
 * from the admin Sites page for sites that predate applications —
 * via Supabase Auth's admin invite endpoint (service-role key). Best-effort by
 * design: approval must create the site even when the invite cannot be sent —
 * the admin sees the outcome and can onboard manually.
 */
@Injectable()
export class InviteService {
  private readonly logger = new Logger(InviteService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async inviteWriter(email: string, tenantId: string): Promise<InviteResult> {
    const url = this.config.get<string>("SUPABASE_URL");
    const key = this.config.get<string>("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) {
      return { sent: false, reason: "invites not configured (SUPABASE_SERVICE_ROLE_KEY not set)" };
    }

    const domain = this.config.get<string>("SITE_DOMAIN") ?? "darbha.info";
    const redirectTo =
      this.config.get<string>("INVITE_REDIRECT_URL") ?? `https://${domain}/welcome`;
    const normalized = email.trim().toLowerCase();

    try {
      // Check ownership before Supabase: an existing account — confirmed, or
      // still pending its first invite — that already writes for another site
      // (or is an admin) must never be silently repointed. Pending accounts
      // matter most: Supabase happily re-invites them and returns 200.
      const existingId = await this.findUserId(normalized);
      if (existingId) {
        const conflict = await this.ownershipConflict(existingId, tenantId, normalized);
        if (conflict) return conflict;
      }

      const res = await fetch(
        `${url}/auth/v1/invite?redirect_to=${encodeURIComponent(redirectTo)}`,
        {
          method: "POST",
          headers: {
            apikey: key,
            authorization: `Bearer ${key}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({ email: normalized }),
          // A stalled Supabase must degrade to "invite failed", never hang the
          // admin's approval request.
          signal: AbortSignal.timeout(10_000),
        },
      );

      if (res.ok) {
        const user = (await res.json()) as { id?: string };
        if (user.id) {
          try {
            await this.linkProfile(user.id, tenantId);
          } catch (e) {
            // The email IS on its way — don't let a DB blip report otherwise.
            return {
              sent: true,
              reason: `linking their profile failed (${errMessage(e)}) — link them to the site manually`,
            };
          }
        }
        return { sent: true };
      }

      const body = (await res.json().catch(() => ({}))) as {
        error_code?: string;
        msg?: string;
        message?: string;
      };
      const message = body.msg ?? body.message ?? `Supabase responded ${res.status}`;

      // Existing confirmed account: no email needed, just link it — after
      // re-checking ownership, in case it changed since the check above.
      if (body.error_code === "email_exists" || /already been registered/i.test(message)) {
        const userId = existingId ?? (await this.findUserId(normalized));
        if (userId) {
          const conflict = await this.ownershipConflict(userId, tenantId, normalized);
          if (conflict) return conflict;
          try {
            await this.linkProfile(userId, tenantId);
          } catch (e) {
            return {
              sent: false,
              alreadyRegistered: true,
              reason: `account found, but linking their profile failed (${errMessage(e)}) — link them manually`,
            };
          }
          return { sent: false, alreadyRegistered: true };
        }
      }

      this.logger.warn(`Invite for ${normalized} failed: ${message}`);
      return { sent: false, reason: message };
    } catch (e) {
      const message = errMessage(e);
      this.logger.warn(`Invite for ${normalized} failed: ${message}`);
      return { sent: false, reason: message };
    }
  }

  private async findUserId(email: string): Promise<string | null> {
    const rows = await this.prisma.client.$queryRaw<
      { id: string }[]
    >`select id from auth.users where lower(email) = ${email} limit 1`;
    return rows[0]?.id ?? null;
  }

  /**
   * Non-null when linking this account to the site would take it from
   * somewhere else. Emails are unverified (public apply form) or typed by
   * hand (Sites page), so moving a writer is always the admin's explicit call.
   */
  private async ownershipConflict(
    userId: string,
    tenantId: string,
    email: string,
  ): Promise<InviteResult | null> {
    const profile = await this.prisma.client.profile.findUnique({ where: { id: userId } });
    if (profile && (profile.role === "admin" || (profile.tenantId && profile.tenantId !== tenantId))) {
      return {
        sent: false,
        alreadyRegistered: true,
        reason: `${email} already belongs to an existing account — link it to this site manually if that's really them`,
      };
    }
    return null;
  }

  /** The auth trigger may have created the profile already; either way, link it. */
  private linkProfile(userId: string, tenantId: string) {
    return this.prisma.client.profile.upsert({
      where: { id: userId },
      update: { tenantId },
      create: { id: userId, tenantId, role: "writer" },
    });
  }
}

function errMessage(e: unknown): string {
  return e instanceof Error ? e.message : "could not reach Supabase";
}
