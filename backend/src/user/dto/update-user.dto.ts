import { IsOptional, IsString } from "class-validator";
import { CreateUserDto } from "./create-user.dto";

export class UpdateUserDto extends CreateUserDto {
  @IsOptional()
  @IsString()
  declare password: string;
}
