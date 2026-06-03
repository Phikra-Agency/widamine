import { Injectable, OnModuleInit } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { BrevoClient } from "@getbrevo/brevo";

@Injectable()
export class MailService implements OnModuleInit {
  private brevoClient: BrevoClient | null = null;
  private transporter: nodemailer.Transporter | null = null;
  private isEthereal = false;
  private senderEmail: string;
  private senderName: string;

  async onModuleInit() {
    const apiKey = process.env.BREVO_API_KEY;
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_PASS;
    this.senderEmail = process.env.SMTP_FROM_EMAIL || gmailUser || "noreply@widamine.com";
    this.senderName = process.env.SMTP_FROM_NAME || "Widamine";

    if (apiKey) {
      this.brevoClient = new BrevoClient({ apiKey });
      console.log(`📧 Brevo API configured (sender: ${this.senderName} <${this.senderEmail}>)`);
    } else if (gmailUser && gmailPass) {
      this.transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: { user: gmailUser, pass: gmailPass },
      });
      console.log(`📧 Gmail SMTP configured (sender: ${this.senderName} <${gmailUser}>)`);
      console.log(`   💡 Make sure you're using a Gmail App Password, not your regular password.`);
    } else {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
      this.isEthereal = true;
      console.log(`📧 Ethereal SMTP (dev only — emails NOT really sent):`);
      console.log(`   → View inbox: https://ethereal.email/login?username=${testAccount.user}&password=${testAccount.pass}`);
      console.log(`   💡 To send real emails, set BREVO_API_KEY or GMAIL_USER+GMAIL_PASS in .env`);
    }
  }

  async sendMail(to: string, subject: string, html: string) {
    if (this.brevoClient) {
      return this.sendViaBrevo(to, subject, html);
    }
    return this.sendViaSmtp(to, subject, html);
  }

  private async sendViaBrevo(to: string, subject: string, html: string) {
    const result = await this.brevoClient!.transactionalEmails.sendTransacEmail({
      sender: { name: this.senderName, email: this.senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    });
    console.log(`📧 Email sent to ${to}: ${subject} (via Brevo)`);
    return result;
  }

  private async sendViaSmtp(to: string, subject: string, html: string) {
    const info = await this.transporter!.sendMail({
      from: `"${this.senderName}" <${this.senderEmail}>`,
      to,
      subject,
      html,
    });
    const label = this.isEthereal ? "Ethereal" : "SMTP";
    const preview = this.isEthereal ? ` → Preview: ${nodemailer.getTestMessageUrl(info)}` : "";
    console.log(`📧 Email sent to ${to}: ${subject} (via ${label})${preview}`);
    return info;
  }
}
