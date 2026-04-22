import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { ContactModule } from "./contact/contact.module";
import { CategoryModule } from "./category/category.module";
import { ServiceModule } from "./service/service.module";
import { AppointmentModule } from "./appointment/appointment.module";
import { ScheduleModule } from "./schedule/schedule.module";
import { SessionModule } from "./session/session.module";
import { PatientModule } from "./patient/patient.module";
import { SmsModule } from "./sms/sms.module";
import { MotifModule } from "./motif/motif.module";
import { ResourceModule } from "./resource/resource.module";

console.log("[AppModule] Loading modules...");

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    ContactModule,
    CategoryModule,
    ServiceModule,
    AppointmentModule,
    ScheduleModule,
    SessionModule,
    PatientModule,
    SmsModule,
    MotifModule,
    ResourceModule,
  ],
})
export class AppModule {}

console.log("[AppModule] Loaded");
