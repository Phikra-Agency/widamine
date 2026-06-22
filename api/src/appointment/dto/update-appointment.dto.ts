import { IsString, IsOptional } from "class-validator";

export class UpdateAppointmentDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  resourceId?: string;

  @IsOptional()
  @IsString()
  practitionerId?: string;

  @IsOptional()
  @IsString()
  context?: string;

  @IsOptional()
  @IsString()
  expiresAt?: string;
}
