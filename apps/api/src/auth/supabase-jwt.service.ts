import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

/**
 * Verifies Supabase-issued JWTs. Prefers the legacy shared secret (HS256)
 * when SUPABASE_JWT_SECRET is set, otherwise uses the project's JWKS
 * endpoint (new asymmetric signing keys).
 */
@Injectable()
export class SupabaseJwtService {
  private jwks?: ReturnType<typeof createRemoteJWKSet>;
  private readonly secret?: Uint8Array;

  constructor(config: ConfigService) {
    const secret = config.get<string>("SUPABASE_JWT_SECRET");
    if (secret) {
      this.secret = new TextEncoder().encode(secret);
    } else {
      const url = config.get<string>("SUPABASE_URL");
      if (url) {
        this.jwks = createRemoteJWKSet(new URL(`${url}/auth/v1/.well-known/jwks.json`));
      }
    }
  }

  async verify(token: string): Promise<JWTPayload> {
    try {
      if (this.secret) {
        const { payload } = await jwtVerify(token, this.secret);
        return payload;
      }
      if (this.jwks) {
        const { payload } = await jwtVerify(token, this.jwks);
        return payload;
      }
      throw new Error("Neither SUPABASE_JWT_SECRET nor SUPABASE_URL configured");
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
