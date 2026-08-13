import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";

const ACTIVE_STATUSES = { notIn: ["CANCELLED", "COMPLETED"] };

@Injectable()
export class UnavailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  private windowStart(startDate: string, startTime: string): Date {
    return new Date(`${startDate}T${startTime}:00`);
  }

  private windowEnd(endDate: string, endTime: string): Date {
    return new Date(`${endDate}T${endTime}:00`);
  }

  private async findConflicts(practitionerId: string, start: Date, end: Date) {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        practitionerId,
        status: ACTIVE_STATUSES,
        schedules: { some: { datetime: { gte: start, lte: end } } },
      },
      select: {
        id: true,
        name: true,
        motif: { select: { name: true } },
        schedules: {
          where: { datetime: { gte: start, lte: end } },
          orderBy: { datetime: "asc" as const },
          select: { datetime: true },
        },
      },
    });
    return appointments.map((a) => ({
      id: a.id,
      patientName: a.name,
      motifName: a.motif.name,
      datetime: a.schedules[0]?.datetime,
    }));
  }

  private async withConflicts(id: string) {
    const item = await this.prisma.practitionerUnavailability.findUnique({
      where: { id },
      include: { practitioner: { select: { id: true, name: true, email: true, role: true } } },
    });
    if (!item) throw new NotFoundException("Unavailability not found");
    const start = this.windowStart(
      item.startDate.toISOString().slice(0, 10),
      item.startTime,
    );
    const end = this.windowEnd(item.endDate.toISOString().slice(0, 10), item.endTime);
    const conflictingAppointments = await this.findConflicts(item.practitionerId, start, end);
    return { ...item, conflictingAppointmentsCount: conflictingAppointments.length, conflictingAppointments };
  }

  async findAll(user: { id: string; role: string }) {
    return this.prisma.practitionerUnavailability.findMany({
      where: user.role === "ADMIN" ? {} : { practitionerId: user.id },
      orderBy: { createdAt: "desc" },
      include: { practitioner: { select: { id: true, name: true, email: true, role: true } } },
    });
  }

  async create(
    user: { id: string },
    data: {
      startDate: string;
      endDate: string;
      startTime: string;
      endTime: string;
      excuseType: string;
      customReason?: string;
    },
  ) {
    const created = await this.prisma.practitionerUnavailability.create({
      data: {
        practitionerId: user.id,
        startDate: new Date(`${data.startDate}T00:00:00Z`),
        endDate: new Date(`${data.endDate}T00:00:00Z`),
        startTime: data.startTime,
        endTime: data.endTime,
        excuseType: data.excuseType,
        customReason: data.customReason,
      },
    });
    return this.withConflicts(created.id);
  }

  async findOne(user: { id: string; role: string }, id: string) {
    const item = await this.prisma.practitionerUnavailability.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("Unavailability not found");
    if (user.role !== "ADMIN" && item.practitionerId !== user.id) {
      throw new ForbiddenException("Not your unavailability");
    }
    return this.withConflicts(id);
  }

  async update(
    user: { id: string },
    id: string,
    data: {
      startDate: string;
      endDate: string;
      startTime: string;
      endTime: string;
      excuseType: string;
      customReason?: string;
    },
  ) {
    const item = await this.prisma.practitionerUnavailability.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("Unavailability not found");
    if (item.practitionerId !== user.id) throw new ForbiddenException("Not your unavailability");
    if (item.status !== "PENDING") throw new ForbiddenException("Only PENDING requests can be edited");

    await this.prisma.practitionerUnavailability.update({
      where: { id },
      data: {
        startDate: new Date(`${data.startDate}T00:00:00Z`),
        endDate: new Date(`${data.endDate}T00:00:00Z`),
        startTime: data.startTime,
        endTime: data.endTime,
        excuseType: data.excuseType,
        customReason: data.customReason,
      },
    });
    return this.withConflicts(id);
  }

  async remove(user: { id: string }, id: string) {
    const item = await this.prisma.practitionerUnavailability.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("Unavailability not found");
    if (item.practitionerId !== user.id) throw new ForbiddenException("Not your unavailability");
    if (item.status !== "PENDING") throw new ForbiddenException("Only PENDING requests can be deleted");
    return this.prisma.practitionerUnavailability.delete({ where: { id } });
  }

  async approve(user: { id: string; name: string }, id: string) {
    const item = await this.prisma.practitionerUnavailability.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("Unavailability not found");
    if (item.status !== "PENDING") throw new ForbiddenException("Only PENDING requests can be approved");
    return this.prisma.practitionerUnavailability.update({
      where: { id },
      data: { status: "APPROVED", reviewedAt: new Date(), reviewedBy: user.name },
    });
  }

  async reject(
    user: { id: string; name: string },
    id: string,
    rejectionReason?: string,
  ) {
    const item = await this.prisma.practitionerUnavailability.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("Unavailability not found");
    if (item.status !== "PENDING") throw new ForbiddenException("Only PENDING requests can be rejected");
    return this.prisma.practitionerUnavailability.update({
      where: { id },
      data: { status: "REJECTED", rejectionReason, reviewedAt: new Date(), reviewedBy: user.name },
    });
  }

  async statistics(user: { id: string; role: string }) {
    const where = user.role === "ADMIN" ? {} : { practitionerId: user.id };
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const approved = await this.prisma.practitionerUnavailability.findMany({
      where: { ...where, status: "APPROVED" },
      select: { startDate: true, endDate: true },
    });

    const dayCount = (items: typeof approved, from: Date) =>
      items.reduce((total, item) => {
        const start = item.startDate > from ? item.startDate : from;
        const end = item.endDate > now ? now : item.endDate;
        const days = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 86400000) + 1);
        return total + days;
      }, 0);

    const [pendingRequests, upcomingApproved] = await Promise.all([
      this.prisma.practitionerUnavailability.count({ where: { ...where, status: "PENDING" } }),
      this.prisma.practitionerUnavailability.count({
        where: { ...where, status: "APPROVED", endDate: { gte: now } },
      }),
    ]);

    return {
      approvedThisMonth: dayCount(approved, monthStart),
      approvedThisYear: dayCount(approved, yearStart),
      upcomingApproved,
      pendingRequests,
    };
  }
}
