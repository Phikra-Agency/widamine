import { Injectable, OnModuleInit } from "@nestjs/common";
import { Resend } from "resend";

@Injectable()
export class MailService implements OnModuleInit {
  private resend: Resend | null = null;
  private senderEmail: string;
  private senderName: string;

  async onModuleInit() {
    const resendKey = process.env.RESEND_API_KEY;
    this.senderEmail = process.env.SMTP_FROM_EMAIL || "Widamine <onboarding@resend.dev>";
    this.senderName = process.env.SMTP_FROM_NAME || "Widamine";

    if (resendKey) {
      this.resend = new Resend(resendKey);
      console.log(`📧 Resend configured (sender: ${this.senderName})`);
    } else {
      console.log(`⚠️  No RESEND_API_KEY in .env — emails will NOT be sent`);
      console.log(`   💡 Set RESEND_API_KEY in .env to enable email delivery`);
    }
  }

  async sendMail(to: string, subject: string, html: string) {
    if (!this.resend) {
      console.log(`📧 [DRY RUN] Email to ${to}: ${subject} (no RESEND_API_KEY configured)`);
      return { messageId: 'dry-run' };
    }

    try {
      const result = await this.resend.emails.send({
        from: `${this.senderName} <onboarding@resend.dev>`,
        to: [to],
        subject,
        html,
      });
      console.log(`📧 Email sent to ${to}: ${subject} (via Resend) — id: ${result.data?.id}`);
      return { messageId: result.data?.id };
    } catch (error: any) {
      console.error(`❌ Failed to send email to ${to}: ${error.message}`);
      throw error;
    }
  }
}
