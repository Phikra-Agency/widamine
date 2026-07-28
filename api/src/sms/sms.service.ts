import { Injectable, Logger } from "@nestjs/common";
import { WhatsAppService } from "./whatsapp.service";

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly whatsappService: WhatsAppService) {}

  async sendSms(phone: string, message: string) {
    this.logger.log(`[SMS PLACEHOLDER] To: ${phone}, Message: ${message}`);
    return { success: true, channel: "sms", provider: "placeholder" };
  }

  async sendWhatsApp(phone: string, message: string) {
    const result = await this.whatsappService.sendMessage(phone, message);
    
    if (result.success) {
      return { 
        success: true, 
        channel: "whatsapp", 
        provider: "openwa",
        messageId: result.messageId 
      };
    } else {
      this.logger.warn(`WhatsApp send failed: ${result.error}`);
      return { 
        success: false, 
        channel: "whatsapp", 
        provider: "openwa",
        error: result.error 
      };
    }
  }
}
