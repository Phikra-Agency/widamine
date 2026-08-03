import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import nodemailer, { Transporter } from "nodemailer";

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private senderEmail: string;
  private senderName: string;

  async onModuleInit() {
    this.senderEmail = process.env.SMTP_FROM_EMAIL || "admin@widamineaestheticcenter.com";
    this.senderName = process.env.SMTP_FROM_NAME || "Widamine";

    const host = process.env.SMTP_HOST;
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT || 465),
        secure: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) === 465 : true,
        auth: {
          user: process.env.SMTP_USER || "",
          pass: process.env.SMTP_PASS || "",
        },
      });
      this.logger.log(`📧 SMTP configured (${host}:${process.env.SMTP_PORT || 465})`);
    } else {
      this.logger.warn(`⚠️  No SMTP_HOST in .env — emails will NOT be sent`);
      this.logger.warn(`   💡 Set SMTP_HOST in .env to enable email delivery`);
    }
  }

  async sendMail(to: string, subject: string, html: string) {
    if (!this.transporter) {
      this.logger.log(`📧 [DRY RUN] Email to ${to}: ${subject} (no SMTP_HOST configured)`);
      return { messageId: 'dry-run' };
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"${this.senderName}" <${this.senderEmail}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`📧 Email sent to ${to}: ${subject} (via SMTP) — id: ${info.messageId}`);
      return { messageId: info.messageId };
    } catch (error: any) {
      this.logger.error(`❌ Failed to send email to ${to}: ${error.message}`);
      throw error;
    }
  }
}
