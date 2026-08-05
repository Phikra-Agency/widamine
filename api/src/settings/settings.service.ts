import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { UpdateNotificationSettingsDto } from "./dto/notification-settings.dto";

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly key = "default";

  private readonly COLLECTION = "AppSettings";

  private flatDoc(dto: UpdateNotificationSettingsDto) {
    return {
      singletonKey: this.key,
      ...(dto.smsEnabled !== undefined && { smsEnabled: dto.smsEnabled }),
      ...(dto.emailEnabled !== undefined && { emailEnabled: dto.emailEnabled }),
      ...(dto.inAppEnabled !== undefined && { inAppEnabled: dto.inAppEnabled }),
      ...(dto.whatsappEnabled !== undefined && { whatsappEnabled: dto.whatsappEnabled }),
      ...(dto.smsTypes && {
        smsConfirmation: dto.smsTypes.confirmation,
        smsReminder: dto.smsTypes.reminder,
        smsCancellation: dto.smsTypes.cancellation,
      }),
      ...(dto.emailTypes && {
        emailConfirmation: dto.emailTypes.confirmation,
        emailReminder: dto.emailTypes.reminder,
        emailCancellation: dto.emailTypes.cancellation,
      }),
      ...(dto.inAppTypes && {
        inAppConfirmation: dto.inAppTypes.confirmation,
        inAppReminder: dto.inAppTypes.reminder,
        inAppCancellation: dto.inAppTypes.cancellation,
      }),
      ...(dto.whatsappTypes && {
        whatsappConfirmation: dto.whatsappTypes.confirmation,
        whatsappReminder: dto.whatsappTypes.reminder,
        whatsappCancellation: dto.whatsappTypes.cancellation,
      }),
    };
  }

  private toResponse(settings: Record<string, unknown>) {
    return {
      smsEnabled: settings.smsEnabled,
      emailEnabled: settings.emailEnabled,
      inAppEnabled: settings.inAppEnabled,
      whatsappEnabled: settings.whatsappEnabled ?? false,
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
      whatsappTypes: {
        confirmation: settings.whatsappConfirmation ?? false,
        reminder: settings.whatsappReminder ?? false,
        cancellation: settings.whatsappCancellation ?? false,
      },
    };
  }

  async getNotificationSettings() {
    let settings = await this.prisma.appSettings.findUnique({
      where: { singletonKey: this.key },
    });

    if (!settings) {
      settings = await this.prisma.appSettings.create({
        data: {
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
          whatsappEnabled: false,
          whatsappConfirmation: false,
          whatsappReminder: false,
          whatsappCancellation: false,
        },
      });
    }

    return this.toResponse(settings as unknown as Record<string, unknown>);
  }

  async updateNotificationSettings(dto: UpdateNotificationSettingsDto) {
    const data = this.flatDoc(dto);

    const updated = await this.prisma.appSettings.upsert({
      where: { singletonKey: this.key },
      update: data,
      create: {
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
        whatsappEnabled: false,
        whatsappConfirmation: false,
        whatsappReminder: false,
        whatsappCancellation: false,
        ...data,
      },
    });

    return this.toResponse(updated as unknown as Record<string, unknown>);
  }
}
