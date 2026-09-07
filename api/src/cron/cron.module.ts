import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "@/prisma/prisma.module";
import { AppointmentModule } from "@/appointment/appointment.module";
import { CronService } from "./cron.service";

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, AppointmentModule],
  providers: [CronService],
})
export class CronModule {}
