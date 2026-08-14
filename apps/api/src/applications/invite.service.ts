import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";

export interface InviteResult {
  /** True when Supabase accepted the invite email. */
  sent: boolean;
  /** True when the email already had a login. */
  alreadyRegistered?: boolean;
  /**
   * Present whenever anything needs the admin's attention — an unsent invite,
   * or a sent invite / existing account whose profile could not be linked.
   */
  reason?: string;
}

/**
 * Sends the "set up your writer login" invite when an application is approved,
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

      // Existing account: only auto-link when that login isn't attached to
      // anything yet. The applicant's email is unverified public input, so an
      // account that already owns a site (or is an admin) must never be
      // silently repointed — that's the admin's explicit call.
      if (body.error_code === "email_exists" || /already been registered/i.test(message)) {
        const rows = await this.prisma.client.$queryRaw<
          { id: string }[]
        >`select id from auth.users where lower(email) = ${normalized} limit 1`;
        if (rows[0]) {
          const profile = await this.prisma.client.profile.findUnique({
            where: { id: rows[0].id },
          });
          if (
            profile &&
            (profile.role === "admin" || (profile.tenantId && profile.tenantId !== tenantId))
          ) {
            return {
              sent: false,
              alreadyRegistered: true,
              reason: `${normalized} already belongs to an existing account — link it to the new site manually if that's really them`,
            };
          }
          try {
            await this.linkProfile(rows[0].id, tenantId);
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
