import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  async sendSms(phone: string, message: string) {
    this.logger.log(`[SMS PLACEHOLDER] To: ${phone}, Message: ${message}`);
    return { success: true, channel: "sms", provider: "placeholder" };
  }

  async sendWhatsApp(phone: string, message: string) {
    this.logger.log(`[WHATSAPP PLACEHOLDER] To: ${phone}, Message: ${message}`);
    return { success: true, channel: "whatsapp", provider: "placeholder" };
  }
}
