import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";
import { WORK_LANGS, WORK_TYPES, type WorkMedia, type WorkType } from "@darbha/types";

export class CreateWorkDto {
  /** Admins must specify which tenant; writers default to their own. */
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsIn(WORK_TYPES)
  type: WorkType;

  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsIn(WORK_LANGS)
  lang?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  excerpt?: string;

  @IsOptional()
  @IsString()
  coverUrl?: string;

  @IsOptional()
  @IsObject()
  media?: WorkMedia;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  /** The date shown on the site — when the piece was written, not when it was uploaded. */
  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class UpdateWorkDto {
  @IsOptional()
  @IsIn(WORK_TYPES)
  type?: WorkType;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsIn(WORK_LANGS)
  lang?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  excerpt?: string;

  @IsOptional()
  @IsString()
  coverUrl?: string;

  @IsOptional()
  @IsObject()
  media?: WorkMedia;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  /** The date shown on the site — when the piece was written, not when it was uploaded. */
  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
