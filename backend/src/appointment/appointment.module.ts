import { Module } from "@nestjs/common";
import { AppointmentService } from "./appointment.service";
import { AppointmentController } from "./appointment.controller";
import { MailModule } from "@/mail/mail.module";
import { SmsModule } from "@/sms/sms.module";
import { AppointmentNotificationService } from "./appointment-notification.service";

@Module({
  imports: [MailModule, SmsModule],
  controllers: [AppointmentController],
  providers: [AppointmentService, AppointmentNotificationService],
})
export class AppointmentModule {}
