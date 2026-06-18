import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateServiceDto {
  @IsString()
  name: string;

  @IsString()
  categoryId: string;

  @IsNumber()
  price: number;

  @IsString()
  primaryDoctorId: string;

  @IsOptional()
  @IsString({ each: true })
  allowedDoctorIds?: string[];

  @IsOptional()
  @IsString({ each: true })
  allowedSalleIds?: string[];
}
