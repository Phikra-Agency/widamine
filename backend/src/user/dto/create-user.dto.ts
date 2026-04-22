import { Role } from "@/enums";
import { IsBoolean, IsEmail, IsOptional, IsString } from "class-validator";

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsBoolean()
  admin: boolean;

  @IsString()
  role: Role;
}
