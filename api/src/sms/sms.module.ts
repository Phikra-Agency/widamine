import { Module } from "@nestjs/common";
import { SmsService } from "./sms.service";
import { WhatsAppService } from "./whatsapp.service";

@Module({
  providers: [SmsService, WhatsAppService],
  exports: [SmsService],
})
export class SmsModule {}
