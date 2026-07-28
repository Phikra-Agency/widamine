import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { BrevoClient } from "@getbrevo/brevo";

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private brevoClient: BrevoClient | null = null;
  private senderEmail: string;
  private senderName: string;

  async onModuleInit() {
    const brevoKey = process.env.BREVO_API_KEY;
    this.senderEmail = process.env.SMTP_FROM_EMAIL || "noreply@widamine.com";
    this.senderName = process.env.SMTP_FROM_NAME || "Widamine";

    if (brevoKey) {
      this.brevoClient = new BrevoClient({ apiKey: brevoKey });
      this.logger.log(`📧 Brevo configured (sender: ${this.senderName} <${this.senderEmail}>)`);
    } else {
      this.logger.warn(`⚠️  No BREVO_API_KEY in .env — emails will NOT be sent`);
      this.logger.warn(`   💡 Set BREVO_API_KEY in .env to enable email delivery`);
      this.logger.warn(`   💡 Get your key at: https://app.brevo.com/settings/keys/api`);
    }
  }

  async sendMail(to: string, subject: string, html: string) {
    if (!this.brevoClient) {
      this.logger.log(`📧 [DRY RUN] Email to ${to}: ${subject} (no BREVO_API_KEY configured)`);
      return { messageId: 'dry-run' };
    }

    try {
      const { messageId } = await this.brevoClient.transactionalEmails.sendTransacEmail({
        sender: { name: this.senderName, email: this.senderEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      });
      this.logger.log(`📧 Email sent to ${to}: ${subject} (via Brevo) — id: ${messageId}`);
      return { messageId };
    } catch (error: any) {
      this.logger.error(`❌ Failed to send email to ${to}: ${error.message}`);
      throw error;
    }
  }
}
