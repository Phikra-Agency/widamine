import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "@/prisma/prisma.module";
import { MailModule } from "@/mail/mail.module";
import { CronService } from "./cron.service";

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, MailModule],
  providers: [CronService],
})
export class CronModule {}
