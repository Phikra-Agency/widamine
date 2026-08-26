import { IsString, IsOptional, IsNumber } from "class-validator";
import { Type } from "class-transformer";

export class CreateAppointmentDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  context?: string;

  @IsOptional()
  @IsString()
  datetime?: string;

  @IsString()
  motifId: string;

  @IsOptional()
  @IsString()
  practitionerId?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sessionNumber?: number;
}
