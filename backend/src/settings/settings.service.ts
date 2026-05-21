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
    };
  }

  private toResponse(settings: Record<string, unknown>) {
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
    const result = await this.prisma.$runCommandRaw({
      find: this.COLLECTION,
      filter: { singletonKey: this.key },
      limit: 1,
    });

    const batch = (result as any).cursor?.firstBatch ?? [];
    let settings = batch[0] as Record<string, unknown> | undefined;

    if (!settings) {
      const defaultData = this.flatDoc({
        smsEnabled: false,
        emailEnabled: true,
        inAppEnabled: true,
        smsTypes: { confirmation: true, reminder: true, cancellation: false },
        emailTypes: { confirmation: true, reminder: true, cancellation: true },
        inAppTypes: { confirmation: true, reminder: true, cancellation: false },
      });

      await this.prisma.$runCommandRaw({
        insert: this.COLLECTION,
        documents: [defaultData],
      });

      const result2 = await this.prisma.$runCommandRaw({
        find: this.COLLECTION,
        filter: { singletonKey: this.key },
        limit: 1,
      });

      settings = ((result2 as any).cursor?.firstBatch ?? [])[0] as Record<string, unknown> | undefined;
    }

    return this.toResponse(settings!);
  }

  async updateNotificationSettings(dto: UpdateNotificationSettingsDto) {
    const data = this.flatDoc(dto);

    const result = await this.prisma.$runCommandRaw({
      findAndModify: this.COLLECTION,
      query: { singletonKey: this.key },
      update: { $set: data },
      upsert: true,
      new: true,
    });

    const updated = (result as any).value as Record<string, unknown>;
    return this.toResponse(updated);
  }
}
