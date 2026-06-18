import { IsOptional, IsString, IsEmail, IsBoolean } from "class-validator";
import { Role } from "@/enums";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsBoolean()
  admin?: boolean;

  @IsOptional()
  @IsString()
  role?: Role;
}
