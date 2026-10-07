import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
} from "@nestjs/common";
import { isUUID } from "class-validator";
import type { Request } from "express";
import { ClapsService } from "./claps.service";
import { ClapDto } from "./dto";

/** Public, no login: readers applaud published works, Medium-style. */
@Controller("works/:workId/claps")
export class ClapsController {
  constructor(private readonly claps: ClapsService) {}

  /**
   * The reader id comes in a header, not the query string, so it never lands
   * in request-URL logs next to the caller's IP. A missing or malformed id
   * just means "a reader who hasn't clapped yet".
   */
  @Get()
  get(
    @Param("workId", ParseUUIDPipe) workId: string,
    @Headers("x-visitor-id") visitor: string | undefined,
    @Req() req: Request,
  ) {
    return this.claps.get(workId, req.ip ?? "", visitor && isUUID(visitor) ? visitor : undefined);
  }

  @Post()
  @HttpCode(200)
  clap(
    @Param("workId", ParseUUIDPipe) workId: string,
    @Body() dto: ClapDto,
    @Req() req: Request,
  ) {
    return this.claps.clap(workId, dto.visitorId, dto.count, req.ip ?? "");
  }
}
