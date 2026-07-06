import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApplicationsService } from "./applications.service";
import { CreateApplicationDto, ReviewApplicationDto } from "./dto";
import { SupabaseAuthGuard } from "../auth/supabase-auth.guard";
import { AdminGuard } from "../auth/admin.guard";

@Controller("applications")
export class ApplicationsController {
  constructor(private readonly applications: ApplicationsService) {}

  /** Public: the apex "apply for a subdomain" form posts here. */
  @Post()
  submit(@Body() dto: CreateApplicationDto) {
    return this.applications.submit(dto);
  }

  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @Get()
  list(@Query("status") status?: "pending" | "approved" | "rejected") {
    return this.applications.list(status);
  }

  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @Patch(":id")
  review(@Param("id", ParseUUIDPipe) id: string, @Body() dto: ReviewApplicationDto) {
    return this.applications.review(id, dto);
  }
}
