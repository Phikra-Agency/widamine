import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, IsBoolean, Matches } from "class-validator";

export class CreateMotifDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsNumber()
  numberOfSessions?: number;

  @IsOptional()
  @IsBoolean()
  isOnlineBookable?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresPractitionerChoice?: boolean;

  @IsOptional()
  @IsNumber()
  pendingTtlHours?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/)
  color?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  practitionerIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resourceIds?: string[];
}

export class UpdateMotifDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsNumber()
  numberOfSessions?: number;

  @IsOptional()
  @IsBoolean()
  isOnlineBookable?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresPractitionerChoice?: boolean;

  @IsOptional()
  @IsNumber()
  pendingTtlHours?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/)
  color?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  practitionerIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resourceIds?: string[];
}
