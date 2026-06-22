import { IsDateString, IsOptional, IsString } from "class-validator";

export class GetAvailabilityDto {
  @IsString()
  motifId: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  practitionerId?: string;
}
