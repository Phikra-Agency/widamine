import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";
import { AppointmentNotificationService } from "../appointment/appointment-notification.service";

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: AppointmentNotificationService,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async expirePendingAppointments() {
    this.logger.log("Expiring pending appointments...");
    const expired = await this.prisma.appointment.findMany({
      where: {
        status: "PENDING",
        expiresAt: { lte: new Date() },
      },
      select: { id: true, email: true, name: true },
    });

    for (const appt of expired) {
      await this.prisma.appointment.update({
        where: { id: appt.id },
        data: { status: "EXPIRED" },
      });
    }

    if (expired.length > 0) {
      this.logger.log(`Expired ${expired.length} pending appointments`);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async sendReminders() {
    this.logger.log("Sending 24h reminders...");

    // ponytail: per docs matrix — run if either reminder channel is on (email and/or WhatsApp)
    const settings = await this.prisma.appSettings.findUnique({
      where: { singletonKey: "default" },
      select: { emailEnabled: true, emailReminder: true, whatsappEnabled: true, whatsappReminder: true },
    });
    const emailOn = !settings || (settings.emailEnabled && settings.emailReminder);
    const waOn = !!settings?.whatsappEnabled && !!settings?.whatsappReminder;
    if (!emailOn && !waOn) {
      this.logger.log("Reminders skipped — reminders disabled in settings");
      return;
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startOfDay = new Date(tomorrow);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(tomorrow);
    endOfDay.setHours(23, 59, 59, 999);

    const upcoming = await this.prisma.appointment.findMany({
      where: {
        status: "CONFIRMED",
        schedules: {
          some: {
            datetime: { gte: startOfDay, lte: endOfDay },
          },
        },
      },
      include: {
        motif: true,
        practitioner: true,
        schedules: true,
        notifications: {
          where: {
            OR: [
              { channel: "EMAIL", sentAt: { not: null } },
              { channel: "WHATSAPP", sentAt: { not: null } },
            ],
          },
        },
      },
    });

    for (const appt of upcoming) {
      if (appt.notifications.length > 0) continue;
      if (!appt.email && !appt.phone) continue;
      if (!appt.schedules[0]?.datetime) continue;

      // ponytail: single reminder template — sendReminder() gates each channel per settings
      await this.notificationService.sendReminder(appt.id).catch(() => {});

      if (emailOn && appt.email) {
        await this.prisma.notificationLog.create({
          data: {
            appointmentId: appt.id,
            channel: "EMAIL",
            recipientType: "PATIENT",
            recipient: appt.email,
            status: "SENT",
            sentAt: new Date(),
          },
        }).catch(() => {});
      }

      if (waOn && appt.phone) {
        await this.prisma.notificationLog.create({
          data: {
            appointmentId: appt.id,
            channel: "WHATSAPP",
            recipientType: "PATIENT",
            recipient: appt.phone,
            status: "SENT",
            sentAt: new Date(),
          },
        }).catch(() => {});
      }
    }

    this.logger.log(`Sent reminders for ${upcoming.length} appointments`);
  }
}
