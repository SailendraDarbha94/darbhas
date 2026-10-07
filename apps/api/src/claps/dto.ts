import { IsInt, IsUUID, Max, Min } from "class-validator";
import { MAX_CLAPS_PER_READER } from "@darbha/types";

export class ClapDto {
  @IsUUID()
  visitorId: string;

  @IsInt()
  @Min(1)
  @Max(MAX_CLAPS_PER_READER)
  count: number;
}
