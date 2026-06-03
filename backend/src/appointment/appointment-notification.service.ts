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

    if (!settings) {
      // Defaults aligned with Settings defaults
      if (type === "cancellation") return true;
      return true;
    }

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

  async sendConfirmation(appointmentId: string) {
    if (!(await this.canSendEmail("confirmation"))) return;

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { service: true, practitioner: true, schedules: true },
    });
    if (!appointment || !appointment.email) return;

    const date = appointment.schedules[0]
      ? new Date(appointment.schedules[0].datetime).toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "à confirmer";

    await this.mailService.sendMail(
      appointment.email,
      `Confirmation de votre rendez-vous — ${appointment.service?.name || "Widamine"}`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Rendez-vous confirmé ✅</h2>
          <p>Bonjour <strong>${appointment.name}</strong>,</p>
          <p>Votre rendez-vous a été <strong>confirmé</strong>.</p>
          <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Service</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${appointment.service?.name || "-"}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Praticien</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${appointment.practitioner?.name || "-"}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Date</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${date}</td></tr>
          </table>
          <p style="color: #6b7280; font-size: 14px;">Cabinet Widamine — Nous avons hâte de vous accueillir !</p>
        </div>
      `,
    );
  }

  async sendCancellation(appointmentId: string) {
    if (!(await this.canSendEmail("cancellation"))) return;

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { service: true, practitioner: true, schedules: true },
    });
    if (!appointment || !appointment.email) return;

    const date = appointment.schedules[0]
      ? new Date(appointment.schedules[0].datetime).toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    await this.mailService.sendMail(
      appointment.email,
      `Annulation de votre rendez-vous — Widamine`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">Rendez-vous annulé ❌</h2>
          <p>Bonjour <strong>${appointment.name}</strong>,</p>
          <p>Votre rendez-vous du <strong>${date}</strong> pour <strong>${appointment.service?.name || ""}</strong> a été <strong>annulé</strong>.</p>
          <p>Pour reprendre rendez-vous, contactez-nous ou visitez notre site.</p>
          <p style="color: #6b7280; font-size: 14px;">Cabinet Widamine</p>
        </div>
      `,
    );
  }

  async sendReminder(appointmentId: string) {
    if (!(await this.canSendEmail("reminder"))) return;

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { service: true, practitioner: true, schedules: true },
    });
    if (!appointment || !appointment.email) return;

    const date = appointment.schedules[0]
      ? new Date(appointment.schedules[0].datetime).toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "à confirmer";

    await this.mailService.sendMail(
      appointment.email,
      `Rappel : votre rendez-vous demain — ${appointment.service?.name || "Widamine"}`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">Rappel de rendez-vous ⏰</h2>
          <p>Bonjour <strong>${appointment.name}</strong>,</p>
          <p>Ceci est un rappel pour votre rendez-vous <strong>demain</strong>.</p>
          <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Service</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${appointment.service?.name || "-"}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Praticien</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${appointment.practitioner?.name || "-"}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Date</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${date}</td></tr>
          </table>
          <p style="color: #6b7280; font-size: 14px;">Cabinet Widamine — À demain !</p>
        </div>
      `,
    );
  }

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
          weekday: "long",
          day: "numeric",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "à planifier";

    await this.mailService.sendMail(
      doctorEmail,
      `Rendez-vous confirmé — ${appointment.service?.name || "Widamine"}`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Rendez-vous confirmé</h2>
          <p>Bonjour <strong>${doctor.name}</strong>,</p>
          <p>Le rendez-vous suivant a été confirmé.</p>
          <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Patient</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${appointment.patient ? `${appointment.patient.firstName} ${appointment.patient.lastName}` : appointment.name}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Service</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${appointment.service?.name || "-"}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Date</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${date}</td></tr>
          </table>
        </div>
      `,
    );
  }

  async sendNewBookingAcknowledgment(appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { service: true },
    });
    if (!appointment || !appointment.email) return;

    const serviceName = appointment.service?.name || "Consultation";

    await this.mailService.sendMail(
      appointment.email,
      `Réservation reçue — Widamine`,
      `
        <div style="font-family: 'Raleway', Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; background: #f9fafc;">
          <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
            <tr><td style="height:4px;background:#2e90c0;font-size:0;line-height:0;">&nbsp;</td></tr>
          </table>

          <div style="padding:36px 32px 8px;text-align:center;">
            <p style="font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;color:#1a3646;letter-spacing:3px;margin:0;text-transform:uppercase;">Widamine</p>
            <p style="font-size:10px;color:#2e90c0;letter-spacing:3px;margin:4px 0 0;text-transform:uppercase;font-weight:600;">Sobriété Esthétique</p>
          </div>

          <div style="margin:24px 32px;background:#fffaf7;border-radius:28px;border:1px solid rgba(26,54,70,0.10);padding:40px 32px;box-shadow:0 18px 40px rgba(26,54,70,0.06);">
            <div style="text-align:center;margin-bottom:28px;">
              <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#e8c5b8,#f0d5cb);margin:0 auto 16px;">
                <table cellpadding="0" cellspacing="0" style="width:100%;height:100%;">
                  <tr><td style="text-align:center;vertical-align:middle;color:#1a3646;font-size:22px;">&#10003;</td></tr>
                </table>
              </div>
              <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;color:#1a3646;margin:0;letter-spacing:0.5px;">Réservation reçue</h1>
            </div>

            <p style="font-size:15px;color:#1a3646;line-height:1.7;margin:0 0 20px;">
              Bonjour <strong style="color:#2e90c0;">${appointment.name}</strong>,
            </p>
            <p style="font-size:15px;color:rgba(26,54,70,0.72);line-height:1.8;margin:0 0 20px;">
              Nous avons bien reçu votre demande de rendez-vous au <strong style="color:#1a3646;">Cabinet Widamine</strong>.
            </p>

            <div style="background:linear-gradient(180deg,#fbf4ef,#fffaf7);border-radius:20px;padding:20px 24px;margin:0 0 20px;border:1px solid rgba(232,197,184,0.35);">
              <p style="font-size:10px;color:#2e90c0;letter-spacing:3px;margin:0 0 4px;text-transform:uppercase;font-weight:600;">Service demandé</p>
              <p style="font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:400;color:#1a3646;margin:0;">${serviceName}</p>
            </div>

            <div style="background:#f9fafc;border-radius:16px;padding:20px 24px;margin:0 0 24px;border-left:3px solid #e8c5b8;">
              <p style="font-size:14px;color:rgba(26,54,70,0.68);line-height:1.8;margin:0;">
                Notre équipe vous recontactera <strong style="color:#1a3646;">dès que possible</strong> pour confirmer votre rendez-vous et vous proposer les horaires disponibles.
              </p>
            </div>

            <p style="font-size:14px;color:rgba(26,54,70,0.68);line-height:1.8;margin:0 0 4px;">
              Pour toute question, n'hésitez pas à nous contacter.
            </p>
            <p style="font-size:15px;color:rgba(26,54,70,0.72);line-height:1.8;margin:0;">
              Cordialement,<br>
              <strong style="color:#2e90c0;">L'équipe Widamine</strong>
            </p>
          </div>

          <div style="background:#1a3646;border-radius:28px 28px 28px 28px;margin:0 32px 32px;padding:24px 32px;text-align:center;">
            <p style="font-size:11px;color:rgba(255,255,255,0.45);letter-spacing:1px;margin:0;text-transform:uppercase;">1<sup>er</sup> centre médical de Dermato-Esthétique</p>
            <p style="font-size:10px;color:rgba(255,255,255,0.3);margin:6px 0 0;letter-spacing:1px;">Fès, Maroc</p>
          </div>
        </div>
      `,
    );
  }

  // ── Doctor notifications ──────────────────────────────────────

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
          weekday: "long",
          day: "numeric",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "à planifier";

    await this.mailService.sendMail(
      doctorEmail,
      `Nouvelle réservation — ${appointment.service?.name || "Widamine"}`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">📋 Nouvelle réservation</h2>
          <p>Bonjour <strong>${doctor.name}</strong>,</p>
          <p>Un nouveau rendez-vous vous a été assigné.</p>
          <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Patient</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${appointment.patient ? `${appointment.patient.firstName} ${appointment.patient.lastName}` : appointment.name}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Téléphone</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${appointment.phone || "-"}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Service</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${appointment.service?.name || "-"}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Date</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${date}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Contexte</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${appointment.context || "-"}</td></tr>
          </table>
          <p style="color: #6b7280; font-size: 14px;">Cabinet Widamine</p>
        </div>
      `,
    );
  }

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
          weekday: "long",
          day: "numeric",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    await this.mailService.sendMail(
      doctorEmail,
      `Rendez-vous annulé — ${appointment.service?.name || "Widamine"}`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">❌ Rendez-vous annulé</h2>
          <p>Bonjour <strong>${doctor.name}</strong>,</p>
          <p>Un rendez-vous a été <strong>annulé</strong>.</p>
          <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Patient</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${appointment.patient ? `${appointment.patient.firstName} ${appointment.patient.lastName}` : appointment.name}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Service</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${appointment.service?.name || "-"}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Date</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${date}</td></tr>
          </table>
          <p style="color: #6b7280; font-size: 14px;">Cabinet Widamine</p>
        </div>
      `,
    );
  }
}
