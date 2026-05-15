import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDefined,
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
  @IsBoolean()
  smsEnabled: boolean;

  @IsBoolean()
  emailEnabled: boolean;

  @IsBoolean()
  inAppEnabled: boolean;

  @IsDefined()
  @ValidateNested()
  @Type(() => NotificationTypesDto)
  smsTypes: NotificationTypesDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => NotificationTypesDto)
  emailTypes: NotificationTypesDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => NotificationTypesDto)
  inAppTypes: NotificationTypesDto;
}
