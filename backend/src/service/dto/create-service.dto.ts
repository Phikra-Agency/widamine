import { Type } from "class-transformer";
import { IsNumber, IsString } from "class-validator";

export class CreateServiceDto {
  @IsString()
  name: string;

  @IsNumber()
  @Type(() => Number)
  categoryId: number;

  @IsNumber()
  @Type(() => Number)
  price: number;

  @IsNumber()
  @Type(() => Number)
  doctorId: number;
}
