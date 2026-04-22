import { IsString } from "class-validator";

export class CreateContactDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsString()
  email: string;

  @IsString()
  context: string;
}
