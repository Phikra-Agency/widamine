import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { UpdateNotificationSettingsDto } from "./dto/notification-settings.dto";

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly key = "default";

  private defaultData() {
    return {
      singletonKey: this.key,
      smsEnabled: false,
      emailEnabled: true,
      inAppEnabled: true,
      smsConfirmation: true,
      smsReminder: true,
      smsCancellation: false,
      emailConfirmation: true,
      emailReminder: true,
      emailCancellation: true,
      inAppConfirmation: true,
      inAppReminder: true,
      inAppCancellation: false,
    };
  }

  private toResponse(settings: {
    smsEnabled: boolean;
    emailEnabled: boolean;
    inAppEnabled: boolean;
    smsConfirmation: boolean;
    smsReminder: boolean;
    smsCancellation: boolean;
    emailConfirmation: boolean;
    emailReminder: boolean;
    emailCancellation: boolean;
    inAppConfirmation: boolean;
    inAppReminder: boolean;
    inAppCancellation: boolean;
  }) {
    return {
      smsEnabled: settings.smsEnabled,
      emailEnabled: settings.emailEnabled,
      inAppEnabled: settings.inAppEnabled,
      smsTypes: {
        confirmation: settings.smsConfirmation,
        reminder: settings.smsReminder,
        cancellation: settings.smsCancellation,
      },
      emailTypes: {
        confirmation: settings.emailConfirmation,
        reminder: settings.emailReminder,
        cancellation: settings.emailCancellation,
      },
      inAppTypes: {
        confirmation: settings.inAppConfirmation,
        reminder: settings.inAppReminder,
        cancellation: settings.inAppCancellation,
      },
    };
  }

  async getNotificationSettings() {
    const settings = await this.prisma.appSettings.upsert({
      where: { singletonKey: this.key },
      update: {},
      create: this.defaultData(),
    });

    return this.toResponse(settings);
  }

  async updateNotificationSettings(dto: UpdateNotificationSettingsDto) {
    const settings = await this.prisma.appSettings.upsert({
      where: { singletonKey: this.key },
      update: {
        smsEnabled: dto.smsEnabled,
        emailEnabled: dto.emailEnabled,
        inAppEnabled: dto.inAppEnabled,
        smsConfirmation: dto.smsTypes.confirmation,
        smsReminder: dto.smsTypes.reminder,
        smsCancellation: dto.smsTypes.cancellation,
        emailConfirmation: dto.emailTypes.confirmation,
        emailReminder: dto.emailTypes.reminder,
        emailCancellation: dto.emailTypes.cancellation,
        inAppConfirmation: dto.inAppTypes.confirmation,
        inAppReminder: dto.inAppTypes.reminder,
        inAppCancellation: dto.inAppTypes.cancellation,
      },
      create: {
        ...this.defaultData(),
        smsEnabled: dto.smsEnabled,
        emailEnabled: dto.emailEnabled,
        inAppEnabled: dto.inAppEnabled,
        smsConfirmation: dto.smsTypes.confirmation,
        smsReminder: dto.smsTypes.reminder,
        smsCancellation: dto.smsTypes.cancellation,
        emailConfirmation: dto.emailTypes.confirmation,
        emailReminder: dto.emailTypes.reminder,
        emailCancellation: dto.emailTypes.cancellation,
        inAppConfirmation: dto.inAppTypes.confirmation,
        inAppReminder: dto.inAppTypes.reminder,
        inAppCancellation: dto.inAppTypes.cancellation,
      },
    });

    return this.toResponse(settings);
  }
}
