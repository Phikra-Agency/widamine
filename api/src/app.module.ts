import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { ContactModule } from "./contact/contact.module";
import { AppointmentModule } from "./appointment/appointment.module";
import { ScheduleModule } from "./schedule/schedule.module";
import { SessionModule } from "./session/session.module";
import { PatientModule } from "./patient/patient.module";
import { SmsModule } from "./sms/sms.module";
import { MotifModule } from "./motif/motif.module";
import { ResourceModule } from "./resource/resource.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { SettingsModule } from "./settings/settings.module";
import { CronModule } from "./cron/cron.module";
import { ChatbotModule } from "./chatbot/chatbot.module";
import { SearchModule } from "./search/search.module";

console.log("[AppModule] Loading modules...");

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    ContactModule,
    AppointmentModule,
    ScheduleModule,
    SessionModule,
    PatientModule,
    SmsModule,
    MotifModule,
    ResourceModule,
    DashboardModule,
    SettingsModule,
    CronModule,
    ChatbotModule,
    SearchModule,
  ],
})
export class AppModule {}

console.log("[AppModule] Loaded");
