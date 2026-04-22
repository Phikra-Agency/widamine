import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AppointmentNotificationService {
  constructor(private prisma: PrismaService) {}

  async sendReminder(appointmentId: number) {
    console.log(`Sending reminder for appointment ${appointmentId}`);
    return true;
  }
}
