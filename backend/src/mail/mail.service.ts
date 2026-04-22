import { Injectable } from "@nestjs/common";

@Injectable()
export class MailService {
  async sendMail(to: string, subject: string, body: string) {
    console.log(`Sending mail to ${to}: ${subject}`);
    return true;
  }
}
