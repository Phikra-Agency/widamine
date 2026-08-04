import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "../mail/mail.service";
import { SmsService } from "../sms/sms.service";

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly smsService: SmsService,
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

    // ponytail: same gate as canSendEmail() — the "Rappel" toggle in Paramètres controls this cron
    const settings = await this.prisma.appSettings.findUnique({
      where: { singletonKey: "default" },
      select: { emailEnabled: true, emailReminder: true },
    });
    if (settings && (!settings.emailEnabled || !settings.emailReminder)) {
      this.logger.log("Reminders skipped — email reminders disabled in settings");
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
      if (!appt.email) continue;

      const date = appt.schedules[0]?.datetime;
      if (!date) continue;

      const html = this.buildReminderHtml(appt.name, appt.motif?.name || "", appt.practitioner?.name, date);
      await this.mailService.sendMail(appt.email, "Rappel de rendez-vous — Widamine", html).catch(() => {});

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

      if (appt.phone) {
        const waResult = await this.smsService.sendWhatsApp(appt.phone, `Bonjour ${appt.name}, rappel de votre rendez-vous pour ${appt.motif?.name || ""} demain à ${date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}.`).catch((e: any) => ({ success: false, error: e?.message }));
        if (waResult.success) {
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
        } else {
          this.logger.warn(`Reminder WhatsApp not sent to ${appt.phone}: ${waResult.error || "unknown"}`);
        }
      }
    }

    this.logger.log(`Sent reminders for ${upcoming.length} appointments`);
  }

  private buildReminderHtml(name: string, motifName: string, practitionerName?: string, date?: Date): string {
    const dateStr = date
      ? date.toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";
    return `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background: #f7f1eb; padding: 40px 20px;">
  <table cellpadding="0" cellspacing="0" width="500" style="margin: 0 auto; background: white; border-radius: 8px;">
    <tr><td style="height: 4px; background: #ecc94b; font-size: 0;">&nbsp;</td></tr>
    <tr><td style="padding: 32px 40px;">
      <h2 style="margin: 0 0 16px; color: #2d3748;">Rappel de rendez-vous</h2>
      <p style="margin: 0 0 20px; color: #2d3748;">Bonjour <strong>${name}</strong>,</p>
      <p style="margin: 0 0 20px; color: #2d3748;">Ceci est un rappel pour votre rendez-vous <strong>demain</strong>.</p>
      <table cellpadding="8" cellspacing="0" style="margin: 24px 0; border: 1px solid #e2e8f0; border-radius: 4px; width: 100%;">
        <tr><td style="font-weight: 600; color: #718096;">Traitement</td><td>${motifName}</td></tr>
        ${practitionerName ? `<tr><td style="font-weight: 600; color: #718096;">Praticien</td><td>${practitionerName}</td></tr>` : ""}
        <tr><td style="font-weight: 600; color: #718096;">Date</td><td>${dateStr}</td></tr>
      </table>
      <p style="margin: 20px 0 0; font-size: 13px; color: #718096;">Merci de confirmer votre présence. En cas d'empêchement, contactez-nous.</p>
      <p style="margin: 32px 0 0; font-size: 13px; color: #718096;">Cordialement,<br><strong>L'équipe Widamine</strong></p>
    </td></tr>
    <tr><td style="background: #1a3646; padding: 24px; text-align: center; color: rgba(255,255,255,0.5); font-size: 12px;">Fès, Maroc</td></tr>
  </table>
</body>
</html>`;
  }
}
