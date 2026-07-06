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
import { WorksService } from "./works.service";
import { CreateWorkDto, UpdateWorkDto } from "./dto";
import { SupabaseAuthGuard, type AuthUser } from "../auth/supabase-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";

@UseGuards(SupabaseAuthGuard)
@Controller("works")
export class WorksController {
  constructor(private readonly works: WorksService) {}

  @Get()
  listMine(@CurrentUser() user: AuthUser) {
    return this.works.listMine(user);
  }

  @Get(":id")
  getOne(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return this.works.getOne(id, user);
  }

  @Post()
  create(@Body() dto: CreateWorkDto, @CurrentUser() user: AuthUser) {
    return this.works.create(dto, user);
  }

  @Patch(":id")
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateWorkDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.works.update(id, dto, user);
  }

  @Delete(":id")
  remove(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return this.works.remove(id, user);
  }
}
