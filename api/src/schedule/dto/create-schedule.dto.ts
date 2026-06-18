import { Type } from "class-transformer";
import { IsDate, IsString } from "class-validator";

export class CreateScheduleDto {
  @IsDate()
  @Type(() => Date)
  datetime: Date;

  @IsString()
  sessionId: string;

  @IsString()
  appointmentId: string;
}
