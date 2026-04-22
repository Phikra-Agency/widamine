import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AppointmentService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    email: string;
    phone: string;
    context?: string;
    serviceId: number;
    motifId?: number;
    practitionerId?: number;
    resourceId?: number;
  }) {
    return this.prisma.appointment.create({
      data,
      include: { service: true, motif: true, practitioner: true },
    });
  }

  async findAll() {
    return this.prisma.appointment.findMany({
      include: { service: true, motif: true, practitioner: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: number) {
    return this.prisma.appointment.findUnique({
      where: { id },
      include: { service: true, motif: true, practitioner: true },
    });
  }

  async update(
    id: number,
    data: Partial<{
      name: string;
      email: string;
      phone: string;
      context: string;
      status: string;
      serviceId: number;
      motifId: number;
      practitionerId: number;
      resourceId: number;
      expiresAt: Date;
      confirmedAt: Date;
      cancelledAt: Date;
      completedAt: Date;
    }>,
  ) {
    return this.prisma.appointment.update({
      where: { id },
      data,
      include: { service: true, motif: true, practitioner: true },
    });
  }

  async remove(id: number) {
    return this.prisma.appointment.delete({ where: { id } });
  }

  async getAvailability(serviceId: number, date: string) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get scheduled appointments for this service on this date
    const scheduledAppointments = await this.prisma.schedule.findMany({
      where: {
        appointment: { serviceId },
        datetime: { gte: startOfDay, lte: endOfDay },
      },
      select: { datetime: true },
    });

    const bookedTimes = new Set(
      scheduledAppointments.map((s) => new Date(s.datetime).getTime())
    );

    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      include: { sessions: true },
    });

    if (!service || !service.sessions.length) return [];

    const slots: string[] = [];
    const duration = service.sessions[0]?.duration || 30;

    for (let hour = 9; hour < 18; hour++) {
      for (let min = 0; min < 60; min += duration) {
        const slotTime = new Date(date);
        slotTime.setHours(hour, min, 0, 0);

        if (!bookedTimes.has(slotTime.getTime())) {
          slots.push(slotTime.toISOString());
        }
      }
    }

    return slots;
  }
}
