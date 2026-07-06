import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import type { AuthedRequest } from "./supabase-auth.guard";

/** Must run after SupabaseAuthGuard. */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    if (req.user?.role !== "admin") {
      throw new ForbiddenException("Admin access required");
    }
    return true;
  }
}
