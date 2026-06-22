import { IsNumber, IsString, IsOptional } from "class-validator";

export class CreateSessionDto {
  @IsString()
  motifId: string;

  @IsNumber()
  duration: number;
}

export class UpdateSessionDto {
  @IsOptional()
  @IsNumber()
  duration?: number;
}
