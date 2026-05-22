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
