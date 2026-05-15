import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@/auth/auth.guard";
import { RoleGuard } from "@/auth/role.guard";
import { SettingsService } from "./settings.service";
import { UpdateNotificationSettingsDto } from "./dto/notification-settings.dto";

@UseGuards(AuthGuard)
@Controller("settings")
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get("notifications")
  @UseGuards(RoleGuard("ADMIN"))
  getNotificationSettings() {
    return this.settingsService.getNotificationSettings();
  }

  @Put("notifications")
  @UseGuards(RoleGuard("ADMIN"))
  updateNotificationSettings(@Body() dto: UpdateNotificationSettingsDto) {
    return this.settingsService.updateNotificationSettings(dto);
  }
}
