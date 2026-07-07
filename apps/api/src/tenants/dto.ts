import {
  IsBoolean,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from "class-validator";
import {
  SLUG_REGEX,
  WORK_TYPES,
  type TenantProfile,
  type TenantTheme,
  type WorkType,
} from "@darbha/types";

export class CreateTenantDto {
  @Matches(SLUG_REGEX, { message: "slug must be lowercase letters, digits and hyphens" })
  slug: string;

  @IsString()
  @MaxLength(80)
  displayName: string;

  @IsOptional()
  @IsString()
  @MaxLength(140)
  tagline?: string;

  @IsIn(WORK_TYPES)
  genre: WorkType;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsObject()
  theme?: TenantTheme;

  @IsOptional()
  @IsObject()
  profile?: TenantProfile;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsUUID()
  ownerUserId?: string;
}

export class UpdateTenantDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(140)
  tagline?: string;

  @IsOptional()
  @IsIn(WORK_TYPES)
  genre?: WorkType;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsObject()
  theme?: TenantTheme;

  @IsOptional()
  @IsObject()
  profile?: TenantProfile;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsIn(["active", "hidden"])
  status?: "active" | "hidden";

  @IsOptional()
  @IsUUID()
  ownerUserId?: string;
}
