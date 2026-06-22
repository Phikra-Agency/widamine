import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "@/prisma/prisma.module";
import { MailModule } from "@/mail/mail.module";
import { SmsModule } from "@/sms/sms.module";
import { CronService } from "./cron.service";

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, MailModule, SmsModule],
  providers: [CronService],
})
export class CronModule {}
