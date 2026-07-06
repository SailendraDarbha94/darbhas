import { IsEmail, IsIn, IsOptional, IsString, Matches, MaxLength } from "class-validator";
import { SLUG_REGEX, WORK_TYPES, type WorkType } from "@darbha/types";

export class CreateApplicationDto {
  @IsString()
  @MaxLength(60)
  firstName: string;

  @IsString()
  @MaxLength(60)
  lastName: string;

  @Matches(SLUG_REGEX, {
    message: "requestedSlug must be lowercase letters, digits and hyphens",
  })
  requestedSlug: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;

  @IsIn(WORK_TYPES)
  genre: WorkType;
}

export class ReviewApplicationDto {
  @IsIn(["approved", "rejected"])
  status: "approved" | "rejected";
}
