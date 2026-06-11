import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "../mail/mail.service";

@Injectable()
export class AppointmentNotificationService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  private async canSendEmail(type: "confirmation" | "reminder" | "cancellation") {
    const settings = await this.prisma.appSettings.findUnique({
      where: { singletonKey: "default" },
      select: {
        emailEnabled: true,
        emailConfirmation: true,
        emailReminder: true,
        emailCancellation: true,
      },
    });

    if (!settings) return true;
    if (!settings.emailEnabled) return false;
    if (type === "confirmation") return settings.emailConfirmation;
    if (type === "reminder") return settings.emailReminder;
    return settings.emailCancellation;
  }

  private async canSendAnyEmail() {
    const settings = await this.prisma.appSettings.findUnique({
      where: { singletonKey: "default" },
      select: { emailEnabled: true },
    });
    if (!settings) return true;
    return settings.emailEnabled;
  }

  // ── Widamine email theme constants ───────────────────────────
  private readonly COLORS = {
    primary: '#2e90c0',
    secondary: '#1a3646',
    accent: '#e8c5b8',
    bg: '#f9fafc',
    cardBg: '#fffaf7',
    text: '#1a3646',
    textLight: 'rgba(26,54,70,0.72)',
    textMuted: 'rgba(26,54,70,0.55)',
  };

  private readonly FONTS = {
    heading: "Georgia, 'Times New Roman', serif",
    body: "'Raleway', Arial, Helvetica, sans-serif",
  };

  private emailWrapper(inner: string): string {
    return `
      <div style="font-family:${this.FONTS.body};max-width:560px;margin:0 auto;background:${this.COLORS.bg};">
        <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
          <tr><td style="height:4px;background:${this.COLORS.primary};font-size:0;line-height:0;">&nbsp;</td></tr>
        </table>

        <div style="padding:36px 32px 8px;text-align:center;">
          <p style="font-family:${this.FONTS.heading};font-size:26px;font-weight:400;color:${this.COLORS.secondary};letter-spacing:3px;margin:0;text-transform:uppercase;">Widamine</p>
          <p style="font-size:10px;color:${this.COLORS.primary};letter-spacing:3px;margin:4px 0 0;text-transform:uppercase;font-weight:600;">Sobriété Esthétique</p>
        </div>

        <div style="margin:24px 32px;background:${this.COLORS.cardBg};border-radius:28px;border:1px solid rgba(26,54,70,0.10);padding:40px 32px;box-shadow:0 18px 40px rgba(26,54,70,0.06);">
          ${inner}
        </div>

        <div style="background:${this.COLORS.secondary};border-radius:28px;margin:0 32px 32px;padding:24px 32px;text-align:center;">
          <p style="font-size:11px;color:rgba(255,255,255,0.45);letter-spacing:1px;margin:0;text-transform:uppercase;">1<sup>er</sup> centre médical de Dermato-Esthétique</p>
          <p style="font-size:10px;color:rgba(255,255,255,0.3);margin:6px 0 0;letter-spacing:1px;">Fès, Maroc</p>
        </div>
      </div>
    `;
  }

  private heading(icon: string, text: string): string {
    return `
      <div style="text-align:center;margin-bottom:28px;">
        <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,${this.COLORS.accent},#f0d5cb);margin:0 auto 16px;">
          <table cellpadding="0" cellspacing="0" style="width:100%;height:100%;">
            <tr><td style="text-align:center;vertical-align:middle;color:${this.COLORS.secondary};font-size:22px;">${icon}</td></tr>
          </table>
        </div>
        <h1 style="font-family:${this.FONTS.heading};font-size:26px;font-weight:400;color:${this.COLORS.secondary};margin:0;letter-spacing:0.5px;">${text}</h1>
      </div>
    `;
  }

  private infoTable(rows: [string, string][]): string {
    const cellStyle = `padding:12px 16px;border:1px solid rgba(26,54,70,0.08);font-size:14px;color:${this.COLORS.text};`;
    const labelStyle = `padding:12px 16px;border:1px solid rgba(26,54,70,0.08);font-size:14px;color:${this.COLORS.text};background:${this.COLORS.bg};font-weight:600;`;
    return `
      <table style="border-collapse:collapse;width:100%;margin:16px 0;border-radius:12px;overflow:hidden;">
        ${rows.map(([label, value]) => `
          <tr>
            <td style="${labelStyle}">${label}</td>
            <td style="${cellStyle}">${value}</td>
          </tr>
        `).join('')}
      </table>
    `;
  }

  private greeting(name: string): string {
    return `<p style="font-size:15px;color:${this.COLORS.text};line-height:1.7;margin:0 0 20px;">Bonjour <strong style="color:${this.COLORS.primary};">${name}</strong>,</p>`;
  }

  private bodyText(text: string): string {
    return `<p style="font-size:15px;color:${this.COLORS.textLight};line-height:1.8;margin:0 0 20px;">${text}</p>`;
  }

  private signature(): string {
    return `
      <p style="font-size:15px;color:${this.COLORS.textLight};line-height:1.8;margin:24px 0 0;">
        Cordialement,<br>
        <strong style="color:${this.COLORS.primary};">L'équipe Widamine</strong>
      </p>
    `;
  }

  // ── 1. Booking acknowledgment (sent to patient on creation) ──

  async sendNewBookingAcknowledgment(appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { service: true },
    });
    if (!appointment || !appointment.email) return;

    const serviceName = appointment.service?.name || "Consultation";

    const html = this.emailWrapper(`
      ${this.heading('&#10003;', 'Réservation reçue')}

      ${this.greeting(appointment.name)}
      ${this.bodyText('Nous avons bien reçu votre demande de rendez-vous au <strong style="color:' + this.COLORS.secondary + ';">Cabinet Widamine</strong>.')}

      <div style="background:linear-gradient(180deg,#fbf4ef,#fffaf7);border-radius:20px;padding:20px 24px;margin:0 0 20px;border:1px solid rgba(232,197,184,0.35);">
        <p style="font-size:10px;color:${this.COLORS.primary};letter-spacing:3px;margin:0 0 4px;text-transform:uppercase;font-weight:600;">Service demandé</p>
        <p style="font-family:${this.FONTS.heading};font-size:20px;font-weight:400;color:${this.COLORS.secondary};margin:0;">${serviceName}</p>
      </div>

      <div style="background:${this.COLORS.bg};border-radius:16px;padding:20px 24px;margin:0 0 24px;border-left:3px solid ${this.COLORS.accent};">
        <p style="font-size:14px;color:${this.COLORS.textLight};line-height:1.8;margin:0;">
          Notre équipe va <strong style="color:${this.COLORS.secondary};">examiner votre demande</strong> et vous recontacter <strong style="color:${this.COLORS.secondary};">dans les plus brefs délais</strong> pour confirmer ou refuser votre rendez-vous.
        </p>
        <p style="font-size:14px;color:${this.COLORS.textLight};line-height:1.8;margin:12px 0 0;">
          Vous recevrez un email de confirmation dès que votre réservation sera validée.
        </p>
      </div>

      <p style="font-size:14px;color:${this.COLORS.textMuted};line-height:1.8;margin:0 0 4px;">
        Pour toute question, n'hésitez pas à nous contacter.
      </p>
      ${this.signature()}
    `);

    await this.mailService.sendMail(
      appointment.email,
      `Réservation reçue — Widamine`,
      html,
    );
  }

  // ── 2. Confirmation (sent to patient when status → CONFIRMED) ──

  async sendConfirmation(appointmentId: string) {
    if (!(await this.canSendEmail("confirmation"))) return;

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { service: true, practitioner: true, schedules: true },
    });
    if (!appointment || !appointment.email) return;

    const date = appointment.schedules[0]
      ? new Date(appointment.schedules[0].datetime).toLocaleDateString("fr-FR", {
          weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
        })
      : "à confirmer";

    const html = this.emailWrapper(`
      ${this.heading('&#10003;', 'Rendez-vous confirmé')}

      ${this.greeting(appointment.name)}
      ${this.bodyText('Votre rendez-vous a été <strong style="color:' + this.COLORS.secondary + ';">confirmé</strong> par notre équipe.')}

      ${this.infoTable([
        ['Service', appointment.service?.name || '-'],
        ['Praticien', appointment.practitioner?.name || '-'],
        ['Date', date],
      ])}

      <div style="background:${this.COLORS.bg};border-radius:16px;padding:20px 24px;margin:0 0 24px;border-left:3px solid ${this.COLORS.accent};">
        <p style="font-size:14px;color:${this.COLORS.textLight};line-height:1.8;margin:0;">
          Nous vous attendons avec impatience. En cas d'empêchement, merci de nous prévenir au moins 24h à l'avance.
        </p>
      </div>

      ${this.signature()}
    `);

    await this.mailService.sendMail(
      appointment.email,
      `Confirmation de votre rendez-vous — ${appointment.service?.name || "Widamine"}`,
      html,
    );
  }

  // ── 3. Cancellation (sent to patient when status → CANCELLED) ──

  async sendCancellation(appointmentId: string) {
    if (!(await this.canSendEmail("cancellation"))) return;

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { service: true, practitioner: true, schedules: true },
    });
    if (!appointment || !appointment.email) return;

    const date = appointment.schedules[0]
      ? new Date(appointment.schedules[0].datetime).toLocaleDateString("fr-FR", {
          weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
        })
      : "";

    const html = this.emailWrapper(`
      ${this.heading('&#10007;', 'Rendez-vous annulé')}

      ${this.greeting(appointment.name)}
      ${this.bodyText(`Votre rendez-vous${date ? ` du <strong style="color:${this.COLORS.secondary};">${date}</strong> pour <strong style="color:${this.COLORS.secondary};">${appointment.service?.name || ""}</strong>` : ''} a été <strong style="color:${this.COLORS.secondary};">annulé</strong>.`)}

      <p style="font-size:14px;color:${this.COLORS.textLight};line-height:1.8;margin:0 0 20px;">
        Pour reprendre rendez-vous, vous pouvez revisiter notre site ou nous contacter directement.
      </p>

      ${this.signature()}
    `);

    await this.mailService.sendMail(
      appointment.email,
      `Annulation de votre rendez-vous — Widamine`,
      html,
    );
  }

  // ── 4. Reminder (sent to patient the day before) ──

  async sendReminder(appointmentId: string) {
    if (!(await this.canSendEmail("reminder"))) return;

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { service: true, practitioner: true, schedules: true },
    });
    if (!appointment || !appointment.email) return;

    const date = appointment.schedules[0]
      ? new Date(appointment.schedules[0].datetime).toLocaleDateString("fr-FR", {
          weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
        })
      : "à confirmer";

    const html = this.emailWrapper(`
      ${this.heading('&#9200;', 'Rappel de rendez-vous')}

      ${this.greeting(appointment.name)}
      ${this.bodyText('Ceci est un rappel pour votre rendez-vous <strong style="color:' + this.COLORS.secondary + ';">demain</strong>.')}

      ${this.infoTable([
        ['Service', appointment.service?.name || '-'],
        ['Praticien', appointment.practitioner?.name || '-'],
        ['Date', date],
      ])}

      <div style="background:${this.COLORS.bg};border-radius:16px;padding:20px 24px;margin:0 0 24px;border-left:3px solid ${this.COLORS.accent};">
        <p style="font-size:14px;color:${this.COLORS.textLight};line-height:1.8;margin:0;">
          Merci de confirmer votre présence. En cas d'empêchement, contactez-nous au plus tôt.
        </p>
      </div>

      ${this.signature()}
    `);

    await this.mailService.sendMail(
      appointment.email,
      `Rappel : votre rendez-vous demain — ${appointment.service?.name || "Widamine"}`,
      html,
    );
  }

  // ── 5. Doctor: new appointment ──

  async notifyDoctorNewAppointment(appointmentId: string) {
    if (!(await this.canSendAnyEmail())) return;

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { service: true, practitioner: true, schedules: true, patient: true },
    });
    if (!appointment?.practitionerId) return;

    const doctor = await this.prisma.user.findUnique({
      where: { id: appointment.practitionerId },
    });
    if (!doctor) return;
    const doctorEmail = doctor.notificationEmail ?? doctor.email;
    if (!doctorEmail) return;

    const date = appointment.schedules[0]
      ? new Date(appointment.schedules[0].datetime).toLocaleDateString("fr-FR", {
          weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
        })
      : "à planifier";

    const patientName = appointment.patient
      ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
      : appointment.name;

    const html = this.emailWrapper(`
      ${this.heading('&#128203;', 'Nouvelle réservation')}

      ${this.greeting(doctor.name || '')}
      ${this.bodyText('Un nouveau rendez-vous vous a été assigné.')}

      ${this.infoTable([
        ['Patient', patientName],
        ['Téléphone', appointment.phone || '-'],
        ['Service', appointment.service?.name || '-'],
        ['Date', date],
        ['Contexte', appointment.context || '-'],
      ])}

      ${this.signature()}
    `);

    await this.mailService.sendMail(
      doctorEmail,
      `Nouvelle réservation — ${appointment.service?.name || "Widamine"}`,
      html,
    );
  }

  // ── 6. Doctor: confirmation ──

  async notifyDoctorConfirmation(appointmentId: string) {
    if (!(await this.canSendAnyEmail())) return;

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { service: true, practitioner: true, schedules: true, patient: true },
    });
    if (!appointment?.practitionerId) return;

    const doctor = await this.prisma.user.findUnique({
      where: { id: appointment.practitionerId },
    });
    if (!doctor) return;
    const doctorEmail = doctor.notificationEmail ?? doctor.email;
    if (!doctorEmail) return;

    const date = appointment.schedules[0]
      ? new Date(appointment.schedules[0].datetime).toLocaleDateString("fr-FR", {
          weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
        })
      : "à planifier";

    const patientName = appointment.patient
      ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
      : appointment.name;

    const html = this.emailWrapper(`
      ${this.heading('&#10003;', 'Rendez-vous confirmé')}

      ${this.greeting(doctor.name || '')}
      ${this.bodyText('Le rendez-vous suivant a été confirmé.')}

      ${this.infoTable([
        ['Patient', patientName],
        ['Service', appointment.service?.name || '-'],
        ['Date', date],
      ])}

      ${this.signature()}
    `);

    await this.mailService.sendMail(
      doctorEmail,
      `Rendez-vous confirmé — ${appointment.service?.name || "Widamine"}`,
      html,
    );
  }

  // ── 7. Doctor: cancellation ──

  async notifyDoctorCancellation(appointmentId: string) {
    if (!(await this.canSendAnyEmail())) return;

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { service: true, practitioner: true, schedules: true, patient: true },
    });
    if (!appointment?.practitionerId) return;

    const doctor = await this.prisma.user.findUnique({
      where: { id: appointment.practitionerId },
    });
    if (!doctor) return;
    const doctorEmail = doctor.notificationEmail ?? doctor.email;
    if (!doctorEmail) return;

    const date = appointment.schedules[0]
      ? new Date(appointment.schedules[0].datetime).toLocaleDateString("fr-FR", {
          weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
        })
      : "";

    const patientName = appointment.patient
      ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
      : appointment.name;

    const html = this.emailWrapper(`
      ${this.heading('&#10007;', 'Rendez-vous annulé')}

      ${this.greeting(doctor.name || '')}
      ${this.bodyText('Un rendez-vous a été <strong style="color:' + this.COLORS.secondary + ';">annulé</strong>.')}

      ${this.infoTable([
        ['Patient', patientName],
        ['Service', appointment.service?.name || '-'],
        ['Date', date],
      ])}

      ${this.signature()}
    `);

    await this.mailService.sendMail(
      doctorEmail,
      `Rendez-vous annulé — ${appointment.service?.name || "Widamine"}`,
      html,
    );
  }
}
