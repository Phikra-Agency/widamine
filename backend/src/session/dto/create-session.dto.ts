import { Type } from "class-transformer";
import { IsNumber } from "class-validator";

export class CreateSessionDto {
  @IsNumber()
  @Type(() => Number)
  duration: number;

  @IsNumber()
  @Type(() => Number)
  serviceId: number;
}
