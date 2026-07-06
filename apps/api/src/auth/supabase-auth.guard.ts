import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import type { ProfileRole } from "@darbha/types";
import { PrismaService } from "../prisma/prisma.service";
import { SupabaseJwtService } from "./supabase-jwt.service";

export interface AuthUser {
  id: string;
  email?: string;
  role: ProfileRole;
  tenantId: string | null;
}

export interface AuthedRequest extends Request {
  user: AuthUser;
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: SupabaseJwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing bearer token");
    }

    const payload = await this.jwt.verify(header.slice("Bearer ".length));
    const userId = payload.sub;
    if (!userId) throw new UnauthorizedException("Token has no subject");

    const profile = await this.prisma.client.profile.findUnique({ where: { id: userId } });
    if (!profile) throw new UnauthorizedException("No profile for this user");

    req.user = {
      id: userId,
      email: typeof payload.email === "string" ? payload.email : undefined,
      role: profile.role,
      tenantId: profile.tenantId,
    };
    return true;
  }
}
