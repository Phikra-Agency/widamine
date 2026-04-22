import { IsDate } from "class-validator";
import { Type } from "class-transformer";

export class UpdateScheduleDto {
  @IsDate()
  @Type(() => Date)
  datetime: Date;
}
