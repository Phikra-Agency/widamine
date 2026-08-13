import { Module } from "@nestjs/common";
import { SmsService } from "./sms.service";
import { WhatsAppService } from "./whatsapp.service";
import { SmsController } from "./sms.controller";

@Module({
  controllers: [SmsController],
  providers: [SmsService, WhatsAppService],
  exports: [SmsService],
})
export class SmsModule {}
