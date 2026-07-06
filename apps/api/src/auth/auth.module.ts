import { Global, Module } from "@nestjs/common";
import { SupabaseJwtService } from "./supabase-jwt.service";
import { SupabaseAuthGuard } from "./supabase-auth.guard";
import { AdminGuard } from "./admin.guard";

@Global()
@Module({
  providers: [SupabaseJwtService, SupabaseAuthGuard, AdminGuard],
  exports: [SupabaseJwtService, SupabaseAuthGuard, AdminGuard],
})
export class AuthModule {}
