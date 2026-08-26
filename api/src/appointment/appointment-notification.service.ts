import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "../mail/mail.service";
import { SmsService } from "../sms/sms.service";

@Injectable()
export class AppointmentNotificationService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private smsService: SmsService,
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

  private async canSendWhatsApp(type: "confirmation" | "reminder" | "cancellation") {
    const settings = await this.prisma.appSettings.findUnique({
      where: { singletonKey: "default" },
      select: {
        whatsappEnabled: true,
        whatsappConfirmation: true,
        whatsappReminder: true,
        whatsappCancellation: true,
      },
    });
    if (!settings) return false;
    if (!settings.whatsappEnabled) return false;
    if (type === "confirmation") return settings.whatsappConfirmation;
    if (type === "reminder") return settings.whatsappReminder;
    return settings.whatsappCancellation;
  }

  private async canSendAnyEmail() {
    const settings = await this.prisma.appSettings.findUnique({
      where: { singletonKey: "default" },
      select: { emailEnabled: true },
    });
    if (!settings) return true;
    return settings.emailEnabled;
  }

  private async canSendAnyWhatsApp() {
    const settings = await this.prisma.appSettings.findUnique({
      where: { singletonKey: "default" },
      select: { whatsappEnabled: true },
    });
    if (!settings) return false;
    return settings.whatsappEnabled;
  }

  private async sendWhatsAppToAppointment(appt: { phone: string | null }, message: string, type?: "confirmation" | "reminder" | "cancellation") {
    if (!appt.phone) return;
    
    // Check if WhatsApp is enabled for this type
    if (type && !(await this.canSendWhatsApp(type))) {
      return;
    }
    
    await this.smsService.sendWhatsApp(appt.phone, message).catch((e: any) => {
      console.error(`[WhatsApp] Failed to send to ${appt.phone}: ${e?.message || e}`);
    });
  }

  private readonly COLORS = {
    primary: '#2e90c0',
    secondary: '#1a3646',
    accent: '#e8c5b8',
    bg: '#F7F1EB',
    white: '#ffffff',
    text: '#2d3748',
    textLight: '#718096',
    success: '#48bb78',
    warning: '#ecc94b',
    danger: '#fc8181',
  };

  private readonly FONTS = {
    sans: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
  };

  private wrap(content: string, accentColor?: string): string {
    const accent = accentColor || this.COLORS.primary;
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background: ${this.COLORS.bg}; font-family: ${this.FONTS.sans};">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background: ${this.COLORS.bg};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="500" style="max-width: 500px; width: 100%;">

          <!-- Top accent line -->
          <tr>
            <td style="height: 4px; background: ${accent}; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="background: ${this.COLORS.secondary}; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; font-family: ${this.FONTS.serif}; font-size: 24px; font-weight: 400; color: ${this.COLORS.white}; letter-spacing: 3px; text-transform: uppercase;">WIDAMINE</h1>
              <p style="margin: 8px 0 0; font-size: 11px; color: ${this.COLORS.accent}; letter-spacing: 2px; text-transform: uppercase; font-weight: 300;">Sobriété Esthétique</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="background: ${this.COLORS.white}; padding: 48px 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: ${this.COLORS.secondary}; padding: 32px 40px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.5); letter-spacing: 1px;">Fès, Maroc</p>
              <p style="margin: 16px 0 0; font-size: 11px; color: rgba(255,255,255,0.3);">
                <a href="https://widamine.com" style="color: ${this.COLORS.accent}; text-decoration: none;">widamine.com</a>
                &nbsp;&nbsp;·&nbsp;&nbsp;
                <a href="mailto:contact@widamine.com" style="color: ${this.COLORS.accent}; text-decoration: none;">contact@widamine.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  private title(icon: string, text: string, color?: string): string {
    const c = color || this.COLORS.secondary;
    return `
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="width: 48px; height: 48px; background: ${c}; border-radius: 50%; margin: 0 auto 16px; line-height: 48px; font-size: 20px; color: ${this.COLORS.white};">${icon}</div>
        <h2 style="margin: 0; font-family: ${this.FONTS.serif}; font-size: 28px; font-weight: 400; color: ${c};">${text}</h2>
      </div>`;
  }

  private paragraph(text: string): string {
    return `<p style="margin: 0 0 20px; font-size: 15px; color: ${this.COLORS.text}; line-height: 1.7;">${text}</p>`;
  }

  private detailsTable(rows: [string, string][]): string {
    return `
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        ${rows.map(([label, value], i) => `
          <tr>
            <td style="padding: 14px 20px; background: ${i % 2 === 0 ? '#f7fafc' : this.COLORS.white}; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: ${this.COLORS.textLight}; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; width: 35%;">${label}</td>
            <td style="padding: 14px 20px; background: ${i % 2 === 0 ? '#f7fafc' : this.COLORS.white}; border-bottom: 1px solid #e2e8f0; font-size: 15px; color: ${this.COLORS.text};">${value}</td>
          </tr>
        `).join('')}
      </table>`;
  }

  private note(text: string): string {
    return `
      <div style="background: #f7fafc; border-left: 4px solid ${this.COLORS.accent}; padding: 16px 20px; margin: 24px 0; border-radius: 0 4px 4px 0;">
        <p style="margin: 0; font-size: 14px; color: ${this.COLORS.text}; line-height: 1.6;">${text}</p>
      </div>`;
  }

  private motifBox(name: string): string {
    return `
      <div style="background: linear-gradient(135deg, #f7fafc, #edf2f7); padding: 20px 24px; margin: 24px 0; border-radius: 8px; border: 1px solid #e2e8f0;">
        <p style="margin: 0 0 4px; font-size: 11px; color: ${this.COLORS.primary}; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Traitement</p>
        <p style="margin: 0; font-size: 18px; color: ${this.COLORS.secondary}; font-family: ${this.FONTS.serif};">${name}</p>
      </div>`;
  }

  private dateStr(d?: Date | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private patientName(a: { name: string; patient?: { firstName: string; lastName: string } | null }): string {
    return a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : a.name;
  }

  private closing(name?: string): string {
    return `
      <p style="margin: 32px 0 0; font-size: 14px; color: ${this.COLORS.textLight}; line-height: 1.6;">
        Cordialement,<br>
        <strong style="color: ${this.COLORS.secondary};">${name || "L'équipe Widamine"}</strong>
      </p>`;
  }

  // ════════════════════════════════════════════════════════════════
  //  1. BOOKING ACKNOWLEDGMENT — patient
  // ════════════════════════════════════════════════════════════════

  async sendNewBookingAcknowledgment(appointmentId: string) {
    const appt = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { motif: true },
    });
    if (!appt) return;

    // Send email if enabled AND email exists
    if ((await this.canSendAnyEmail()) && appt.email) {
      const html = this.wrap(`
        ${this.title('✓', 'Réservation reçue')}
        ${this.paragraph(`Bonjour <strong>${appt.name}</strong>,`)}
        ${this.paragraph('Votre demande de rendez-vous a bien été enregistrée.')}
        ${this.motifBox(appt.motif?.name || 'Consultation')}
        ${this.note(`
          Notre équipe va examiner votre demande et vous recontacter rapidement pour vous confirmer ou refuser votre rendez-vous.<br><br>
          <strong>Vous recevrez un email de confirmation</strong> dès que votre réservation sera validée.
        `)}
        ${this.paragraph('Pour toute question, contactez-nous à <a href="mailto:contact@widamine.com" style="color: ' + this.COLORS.primary + ';">contact@widamine.com</a>.')}
        ${this.closing()}
      `);

      await this.mailService.sendMail(appt.email, 'Réservation reçue — Widamine', html);
    }
    
    // Send WhatsApp INDEPENDENTLY if enabled AND phone exists
    if ((await this.canSendAnyWhatsApp()) && appt.phone) {
      await this.sendWhatsAppToAppointment(
        appt,
        `Bonjour ${appt.name}, votre demande de rendez-vous (${appt.motif?.name || 'Consultation'}) a bien été enregistrée. Notre équipe vous recontactera rapidement pour confirmer. — Widamine`,
      );
    }
  }

  // ════════════════════════════════════════════════════════════════
  //  2. CONFIRMATION — patient
  // ════════════════════════════════════════════════════════════════

  async sendConfirmation(appointmentId: string) {
    if (!(await this.canSendEmail("confirmation"))) return;

    const appt = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { motif: true, practitioner: true, schedules: true },
    });
    if (!appt || !appt.email) return;

    const html = this.wrap(`
      ${this.title('✓', 'Rendez-vous confirmé', this.COLORS.success)}
      ${this.paragraph(`Bonjour <strong>${appt.name}</strong>,`)}
      ${this.paragraph(`Bonne nouvelle ! Votre rendez-vous pour <strong>${appt.motif?.name || '—'}</strong> a été confirmé.`)}
      ${this.detailsTable([
        ['Traitement', appt.motif?.name || '—'],
        ['Praticien', appt.practitioner?.name || '—'],
        ['Date', this.dateStr(appt.schedules[0]?.datetime)],
      ])}
      ${this.note('Nous vous attendons. En cas d\'empêchement, merci de nous prévenir au moins <strong>24 heures</strong> à l\'avance.')}
      ${this.closing()}
    `, this.COLORS.success);

    await this.mailService.sendMail(appt.email, `Confirmation — ${appt.motif?.name || 'Widamine'}`, html);
    await this.sendWhatsAppToAppointment(
      appt,
      `Bonjour ${appt.name}, votre rendez-vous pour ${appt.motif?.name || '—'} est CONFIRMÉ. ${this.dateStr(appt.schedules[0]?.datetime)}. Merci de confirmer votre présence. — Widamine`,
      'confirmation'
    );
  }

  // ════════════════════════════════════════════════════════════════
  //  3. CANCELLATION — patient
  // ════════════════════════════════════════════════════════════════

  async sendCancellation(appointmentId: string) {
    if (!(await this.canSendEmail("cancellation"))) return;

    const appt = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { motif: true, practitioner: true, schedules: true },
    });
    if (!appt || !appt.email) return;

    const date = appt.schedules[0] ? this.dateStr(appt.schedules[0].datetime) : '';

    const html = this.wrap(`
      ${this.title('✗', 'Rendez-vous annulé', this.COLORS.danger)}
      ${this.paragraph(`Bonjour <strong>${appt.name}</strong>,`)}
      ${this.paragraph(`Votre rendez-vous${date ? ` du <strong>${date}</strong>` : ''}${appt.motif ? ` pour <strong>${appt.motif.name}</strong>` : ''} a été annulé.`)}
      ${this.note('Si vous souhaitez reprendre rendez-vous, contactez-nous directement. Nous restons à votre disposition.')}
      ${this.closing()}
    `, this.COLORS.danger);

    await this.mailService.sendMail(appt.email, 'Annulation — Widamine', html);
    await this.sendWhatsAppToAppointment(
      appt,
      `Bonjour ${appt.name}, votre rendez-vous${date ? ` du ${date}` : ''}${appt.motif ? ` pour ${appt.motif.name}` : ''} a été annulé. Si vous souhaitez reprendre rendez-vous, contactez-nous. — Widamine`,
      'cancellation'
    );
  }

  // ════════════════════════════════════════════════════════════════
  //  4. REMINDER — patient
  // ════════════════════════════════════════════════════════════════

  async sendReminder(appointmentId: string) {
    if (!(await this.canSendEmail("reminder"))) return;

    const appt = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { motif: true, practitioner: true, schedules: true },
    });
    if (!appt || !appt.email) return;

    const html = this.wrap(`
      ${this.title('⏰', 'Rappel de rendez-vous', this.COLORS.warning)}
      ${this.paragraph(`Bonjour <strong>${appt.name}</strong>,`)}
      ${this.paragraph('Ceci est un rappel pour votre rendez-vous <strong>demain</strong>.')}
      ${this.detailsTable([
        ['Traitement', appt.motif?.name || '—'],
        ['Praticien', appt.practitioner?.name || '—'],
        ['Date', this.dateStr(appt.schedules[0]?.datetime)],
      ])}
      ${this.note('Merci de confirmer votre présence. En cas d\'empêchement, contactez-nous dès que possible.')}
      ${this.closing()}
    `, this.COLORS.warning);

    await this.mailService.sendMail(appt.email, `Rappel — ${appt.motif?.name || 'Widamine'}`, html);
    await this.sendWhatsAppToAppointment(
      appt,
      `Bonjour ${appt.name}, rappel de votre rendez-vous demain (${appt.motif?.name || '—'} — ${this.dateStr(appt.schedules[0]?.datetime)}). Merci de confirmer votre présence. — Widamine`,
      'reminder'
    );
  }

  // ════════════════════════════════════════════════════════════════
  //  5. DOCTOR — new appointment
  // ════════════════════════════════════════════════════════════════

  async notifyDoctorNewAppointment(appointmentId: string, changedBy?: { id: string; name: string; role: string }) {
    const appt = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { motif: true, practitioner: true, schedules: true, patient: true },
    });
    if (!appt) return;

    // CREATE IN-APP NOTIFICATION for assigned practitioner
    if (appt.practitionerId) {
      const changedByText = changedBy ? ` par ${changedBy.role === 'DOCTOR' ? 'Dr.' : changedBy.role === 'ADMIN' ? 'Admin' : ''} ${changedBy.name}` : '';
      await this.prisma.notificationLog.create({
        data: {
          appointmentId: appt.id,
          channel: 'IN_APP',
          recipientType: 'PRACTITIONER',
          recipient: appt.practitionerId,
          provider: 'system',
          status: 'DELIVERED',
          message: `Nouveau rendez-vous${changedByText}: ${this.patientName(appt)} - ${appt.motif?.name || 'Consultation'}`,
          sentAt: new Date(),
        },
      });
    }

    // CREATE IN-APP NOTIFICATION for all ADMINs
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, name: true },
    });
    
    const changedByText = changedBy ? ` par ${changedBy.role === 'DOCTOR' ? 'Dr.' : changedBy.role === 'ADMIN' ? 'Admin' : ''} ${changedBy.name}` : '';
    for (const admin of admins) {
      await this.prisma.notificationLog.create({
        data: {
          appointmentId: appt.id,
          channel: 'IN_APP',
          recipientType: 'ADMIN',
          recipient: admin.id,
          provider: 'system',
          status: 'DELIVERED',
          message: `Nouveau rendez-vous${changedByText}: ${this.patientName(appt)} - ${appt.motif?.name || 'Consultation'}`,
          sentAt: new Date(),
        },
      });
    }

    // SEND EMAIL to practitioner if enabled
    if (appt.practitionerId && (await this.canSendAnyEmail())) {
      const doctor = await this.prisma.user.findUnique({ where: { id: appt.practitionerId } });
      if (doctor) {
        const to = doctor.notificationEmail ?? doctor.email;
        if (to) {
          const html = this.wrap(`
            ${this.title('📋', 'Nouvelle réservation')}
            ${this.paragraph(`Bonjour <strong>${doctor.name || ''}</strong>,`)}
            ${this.paragraph('Un nouveau rendez-vous vous a été assigné.')}
            ${this.detailsTable([
              ['Patient', this.patientName(appt)],
              ['Téléphone', appt.phone || '—'],
              ['Traitement', appt.motif?.name || '—'],
              ['Date', this.dateStr(appt.schedules[0]?.datetime)],
              ['Note', appt.context || '—'],
            ])}
            ${this.closing('Dr. ' + (doctor.name || 'Widamine'))}
          `);

          await this.mailService.sendMail(to, `Nouvelle réservation — ${appt.motif?.name || 'Widamine'}`, html);
        }
      }
    }
  }

  // ════════════════════════════════════════════════════════════════
  //  6. DOCTOR — confirmation
  // ════════════════════════════════════════════════════════════════

  async notifyDoctorConfirmation(appointmentId: string, changedBy?: { id: string; name: string; role: string }) {
    const appt = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { motif: true, practitioner: true, schedules: true, patient: true },
    });
    if (!appt) return;

    // CREATE IN-APP NOTIFICATION for assigned practitioner
    if (appt.practitionerId) {
      const changedByText = changedBy ? ` par ${changedBy.role === 'DOCTOR' ? 'Dr.' : changedBy.role === 'ADMIN' ? 'Admin' : ''} ${changedBy.name}` : '';
      await this.prisma.notificationLog.create({
        data: {
          appointmentId: appt.id,
          channel: 'IN_APP',
          recipientType: 'PRACTITIONER',
          recipient: appt.practitionerId,
          provider: 'system',
          status: 'DELIVERED',
          message: `Rendez-vous confirmé${changedByText}: ${this.patientName(appt)} - ${appt.motif?.name || 'Consultation'}`,
          sentAt: new Date(),
        },
      });
    }

    // CREATE IN-APP NOTIFICATION for all ADMINs
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });
    
    const changedByText = changedBy ? ` par ${changedBy.role === 'DOCTOR' ? 'Dr.' : changedBy.role === 'ADMIN' ? 'Admin' : ''} ${changedBy.name}` : '';
    for (const admin of admins) {
      await this.prisma.notificationLog.create({
        data: {
          appointmentId: appt.id,
          channel: 'IN_APP',
          recipientType: 'ADMIN',
          recipient: admin.id,
          provider: 'system',
          status: 'DELIVERED',
          message: `Rendez-vous confirmé${changedByText}: ${this.patientName(appt)} - ${appt.motif?.name || 'Consultation'}`,
          sentAt: new Date(),
        },
      });
    }

    // SEND EMAIL to practitioner if enabled
    if (appt.practitionerId && (await this.canSendAnyEmail())) {
      const doctor = await this.prisma.user.findUnique({ where: { id: appt.practitionerId } });
      if (doctor) {
        const to = doctor.notificationEmail ?? doctor.email;
        if (to) {
          const html = this.wrap(`
            ${this.title('✓', 'Rendez-vous confirmé', this.COLORS.success)}
            ${this.paragraph(`Bonjour <strong>${doctor.name || ''}</strong>,`)}
            ${this.paragraph('Le rendez-vous suivant a été confirmé.')}
            ${this.detailsTable([
              ['Patient', this.patientName(appt)],
              ['Traitement', appt.motif?.name || '—'],
              ['Date', this.dateStr(appt.schedules[0]?.datetime)],
            ])}
            ${this.closing('Dr. ' + (doctor.name || 'Widamine'))}
          `, this.COLORS.success);

          await this.mailService.sendMail(to, `Confirmé — ${appt.motif?.name || 'Widamine'}`, html);
        }
      }
    }
  }

  // ════════════════════════════════════════════════════════════════
  //  7. DOCTOR — cancellation
  // ════════════════════════════════════════════════════════════════

  async notifyDoctorCancellation(appointmentId: string, changedBy?: { id: string; name: string; role: string }) {
    const appt = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { motif: true, practitioner: true, schedules: true, patient: true },
    });
    if (!appt) return;

    // CREATE IN-APP NOTIFICATION for assigned practitioner
    if (appt.practitionerId) {
      const changedByText = changedBy ? ` par ${changedBy.role === 'DOCTOR' ? 'Dr.' : changedBy.role === 'ADMIN' ? 'Admin' : ''} ${changedBy.name}` : '';
      await this.prisma.notificationLog.create({
        data: {
          appointmentId: appt.id,
          channel: 'IN_APP',
          recipientType: 'PRACTITIONER',
          recipient: appt.practitionerId,
          provider: 'system',
          status: 'DELIVERED',
          message: `Rendez-vous annulé${changedByText}: ${this.patientName(appt)} - ${appt.motif?.name || 'Consultation'}`,
          sentAt: new Date(),
        },
      });
    }

    // CREATE IN-APP NOTIFICATION for all ADMINs
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });
    
    const changedByText = changedBy ? ` par ${changedBy.role === 'DOCTOR' ? 'Dr.' : changedBy.role === 'ADMIN' ? 'Admin' : ''} ${changedBy.name}` : '';
    for (const admin of admins) {
      await this.prisma.notificationLog.create({
        data: {
          appointmentId: appt.id,
          channel: 'IN_APP',
          recipientType: 'ADMIN',
          recipient: admin.id,
          provider: 'system',
          status: 'DELIVERED',
          message: `Rendez-vous annulé${changedByText}: ${this.patientName(appt)} - ${appt.motif?.name || 'Consultation'}`,
          sentAt: new Date(),
        },
      });
    }

    // SEND EMAIL to practitioner if enabled
    if (appt.practitionerId && (await this.canSendAnyEmail())) {
      const doctor = await this.prisma.user.findUnique({ where: { id: appt.practitionerId } });
      if (doctor) {
        const to = doctor.notificationEmail ?? doctor.email;
        if (to) {
          const html = this.wrap(`
            ${this.title('✗', 'Rendez-vous annulé', this.COLORS.danger)}
            ${this.paragraph(`Bonjour <strong>${doctor.name || ''}</strong>,`)}
            ${this.paragraph('Un rendez-vous a été annulé. Veuillez mettre à jour votre agenda.')}
            ${this.detailsTable([
              ['Patient', this.patientName(appt)],
              ['Traitement', appt.motif?.name || '—'],
              ['Date', this.dateStr(appt.schedules[0]?.datetime)],
            ])}
            ${this.closing('Dr. ' + (doctor.name || 'Widamine'))}
          `, this.COLORS.danger);

          await this.mailService.sendMail(to, `Annulé — ${appt.motif?.name || 'Widamine'}`, html);
        }
      }
    }
  }

  // ════════════════════════════════════════════════════════════════
  //  8. CONTACT FORM NOTIFICATION
  // ════════════════════════════════════════════════════════════════

  async notifyContactFormSubmission(contactId: string) {
    const contact = await this.prisma.contact.findUnique({
      where: { id: contactId },
    });
    if (!contact) return;

    // CREATE IN-APP NOTIFICATION for all ADMINs and RECEPTIONISTs
    const staff = await this.prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'RECEPTIONIST'] } },
      select: { id: true, role: true },
    });

    for (const user of staff) {
      await this.prisma.notificationLog.create({
        data: {
          appointmentId: contactId, // Using contactId since we don't have a separate contactId field
          channel: 'IN_APP',
          recipientType: user.role,
          recipient: user.id,
          provider: 'system',
          status: 'DELIVERED',
          message: `Nouveau message de contact: ${contact.name} - ${contact.phone}`,
          sentAt: new Date(),
        },
      });
    }
  }
}
