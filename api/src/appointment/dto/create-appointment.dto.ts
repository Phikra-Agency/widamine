import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

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

  @IsString()
  datetime: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  serviceId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  motifId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  practitionerId?: number;
}
