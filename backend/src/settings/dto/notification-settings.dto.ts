import { Type } from "class-transformer";
import {
  IsBoolean,
  IsOptional,
  ValidateNested,
} from "class-validator";

export class NotificationTypesDto {
  @IsBoolean()
  confirmation: boolean;

  @IsBoolean()
  reminder: boolean;

  @IsBoolean()
  cancellation: boolean;
}

export class UpdateNotificationSettingsDto {
  @IsOptional()
  @IsBoolean()
  smsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppEnabled?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationTypesDto)
  smsTypes?: NotificationTypesDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationTypesDto)
  emailTypes?: NotificationTypesDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationTypesDto)
  inAppTypes?: NotificationTypesDto;
}
