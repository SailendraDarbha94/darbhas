import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { TenantsService } from "./tenants.service";
import { CreateTenantDto, UpdateTenantDto } from "./dto";
import { SupabaseAuthGuard, type AuthUser } from "../auth/supabase-auth.guard";
import { AdminGuard } from "../auth/admin.guard";
import { CurrentUser } from "../auth/current-user.decorator";

@Controller("tenants")
export class TenantsController {
  constructor(private readonly tenants: TenantsService) {}

  /** Public: cards for the apex gallery. */
  @Get()
  list() {
    return this.tenants.listActive();
  }

  /** Admin: every tenant including hidden ones. */
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @Get("all")
  listAll() {
    return this.tenants.listAll();
  }

  /** Public: a tenant and its published works (used by subdomains + mobile). */
  @Get(":slug")
  bySlug(@Param("slug") slug: string) {
    return this.tenants.getBySlugWithWorks(slug);
  }

  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @Post()
  create(@Body() dto: CreateTenantDto) {
    return this.tenants.create(dto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch(":id")
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateTenantDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.tenants.update(id, dto, user);
  }

  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @Delete(":id")
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.tenants.remove(id);
  }
}
