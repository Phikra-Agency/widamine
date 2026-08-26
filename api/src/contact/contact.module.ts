import { Module } from "@nestjs/common";
import { ContactService } from "./contact.service";
import { ContactController } from "./contact.controller";
import { AppointmentModule } from "@/appointment/appointment.module";

@Module({
  imports: [AppointmentModule],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
