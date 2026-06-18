import { IsNumber, IsString } from "class-validator";

export class CreateSessionDto {
  @IsNumber()
  duration: number;

  @IsString()
  serviceId: string;
}
