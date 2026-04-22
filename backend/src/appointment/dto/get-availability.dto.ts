import { Type } from "class-transformer";
import { IsDateString, IsNumber, IsOptional } from "class-validator";

export class GetAvailabilityDto {
  @IsNumber()
  @Type(() => Number)
  motifId: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  practitionerId?: number;
}
