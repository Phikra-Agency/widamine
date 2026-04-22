import { Type } from "class-transformer";
import { IsDate, IsNumber } from "class-validator";

export class CreateScheduleDto {
  @IsDate()
  @Type(() => Date)
  datetime: Date;

  @IsNumber()
  @Type(() => Number)
  sessionId: number;

  @IsNumber()
  @Type(() => Number)
  appointmentId: number;
}
