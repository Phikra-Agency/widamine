import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PatientService } from "@/patient/patient.service";

@Injectable()
export class AppointmentService {
  constructor(
    private prisma: PrismaService,
    private patientService: PatientService,
  ) {}

  private async findAvailableResource(motifId: string, datetime: string): Promise<string | undefined> {
    const motifResources = await this.prisma.motifResource.findMany({
      where: { motifId },
      include: { resource: true },
      orderBy: [{ isPreferred: "desc" }, { priority: "asc" }, { resource: { priority: "asc" } }],
    });

    let resourceIds = motifResources.map(mr => mr.resourceId);

    if (!resourceIds.length) {
      const fallbackResources = await this.prisma.resource.findMany({
        where: { isActive: true },
        orderBy: { priority: "asc" },
      });
      resourceIds = fallbackResources.map(r => r.id);
      if (!resourceIds.length) return undefined;
    }

    const motif = await this.prisma.motif.findUnique({
      where: { id: motifId },
      select: { duration: true },
    });
    const duration = motif?.duration || 30;
    const slotStart = new Date(datetime);
    const slotEnd = new Date(slotStart.getTime() + duration * 60 * 1000);

    const bookedResources = await this.prisma.appointment.findMany({
      where: {
        resourceId: { in: resourceIds },
        status: { notIn: ["CANCELLED", "COMPLETED"] },
        schedules: {
          some: {
            datetime: { gte: slotStart, lt: slotEnd },
          },
        },
      },
      select: { resourceId: true },
    });

    const bookedIds = new Set(bookedResources.map(r => r.resourceId).filter(Boolean));
    const availableIds = resourceIds.filter(id => !bookedIds.has(id));
    if (!availableIds.length) return undefined;

    if (availableIds.length === 1) return availableIds[0];

    const resources = await this.prisma.resource.findMany({
      where: { id: { in: availableIds } },
      orderBy: { priority: "asc" },
      select: { id: true, priority: true },
    });

    return resources[0]?.id;
  }

  private async validateSessionSequence(motifId: string, sessionNumber: number): Promise<void> {
    if (sessionNumber <= 1) return;

    const previousAppointment = await this.prisma.appointment.findFirst({
      where: {
        motifId,
        sessionNumber: sessionNumber - 1,
        status: "COMPLETED",
      },
    });

    if (!previousAppointment) {
      throw new BadRequestException({
        message: `Session ${sessionNumber} requires session ${sessionNumber - 1} to be completed first`,
        code: "session_sequence_error",
        previousSessionNumber: sessionNumber - 1,
      });
    }
  }

  async create(data: {
    name: string;
    email: string;
    phone: string;
    context?: string;
    motifId: string;
    practitionerId?: string;
    resourceId?: string;
    datetime?: string;
    sessionNumber?: number;
  }) {
    const motif = await this.prisma.motif.findUnique({ where: { id: data.motifId } });
    if (!motif) throw new NotFoundException("Motif not found");

    const sessionNumber = data.sessionNumber ?? 1;
    await this.validateSessionSequence(data.motifId, sessionNumber);

    const patient = await this.patientService.findOrCreateByPhone({
      firstName: data.name.split(" ")[0] || data.name,
      lastName: data.name.split(" ").slice(1).join(" ") || "",
      email: data.email,
      phone: data.phone,
    });

    const session = await this.prisma.session.findFirst({
      where: { motifId: data.motifId, number: sessionNumber },
    });

    if (!data.resourceId && data.datetime) {
      data.resourceId = await this.findAvailableResource(data.motifId, data.datetime);
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        context: data.context,
        patientId: patient.id,
        motifId: data.motifId,
        sessionNumber,
        practitionerId: data.practitionerId,
        resourceId: data.resourceId,
        status: "PENDING",
      },
      include: {
        motif: true,
        practitioner: true,
        patient: true,
        resource: true,
      },
    });

    if (data.datetime && session) {
      await this.prisma.schedule.create({
        data: {
          datetime: new Date(data.datetime),
          sessionId: session.id,
          appointmentId: appointment.id,
        },
      });
    }

    return appointment;
  }

  async countReservations() {
    return this.prisma.appointment.count({
      where: { status: { notIn: ["CANCELLED", "COMPLETED"] } },
    })
  }

  async countByDateRange(from: string, to: string) {
    const fromDate = new Date(from)
    fromDate.setUTCHours(0, 0, 0, 0)
    const toDate = new Date(to)
    toDate.setUTCHours(23, 59, 59, 999)
    return this.prisma.appointment.count({
      where: {
        status: { not: "CANCELLED" },
        schedules: {
          some: {
            datetime: { gte: fromDate, lte: toDate },
          },
        },
      },
    })
  }

  async findAll() {
    return this.prisma.appointment.findMany({
      include: {
        motif: true,
        practitioner: true,
        patient: true,
        resource: true,
        schedules: true,
        notifications: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByStatus(status: string) {
    return this.prisma.appointment.findMany({
      where: { status },
      include: {
        motif: true,
        practitioner: true,
        patient: true,
        resource: true,
        schedules: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByPractitioner(practitionerId: string) {
    return this.prisma.appointment.findMany({
      where: { practitionerId },
      include: {
        motif: true,
        practitioner: true,
        patient: true,
        resource: true,
        schedules: true,
        notifications: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    return this.prisma.appointment.findUnique({
      where: { id },
      include: {
        motif: true,
        practitioner: true,
        patient: true,
        resource: true,
        schedules: true,
      },
    });
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      email: string;
      phone: string;
      context: string;
      status: string;
      motifId: string;
      sessionNumber: number;
      practitionerId: string;
      resourceId: string;
      expiresAt: Date;
      confirmedAt: Date;
      cancelledAt: Date;
      completedAt: Date;
    }>,
  ) {
    const now = new Date();
    if (data.status === "CONFIRMED" && !data.confirmedAt) data.confirmedAt = now;
    if (data.status === "CANCELLED" && !data.cancelledAt) data.cancelledAt = now;
    if (data.status === "COMPLETED" && !data.completedAt) data.completedAt = now;

    return this.prisma.appointment.update({
      where: { id },
      data,
      include: {
        motif: true,
        practitioner: true,
        patient: true,
        resource: true,
      },
    });
  }

  async remove(id: string) {
    await this.prisma.schedule.deleteMany({ where: { appointmentId: id } });
    await this.prisma.notificationLog.deleteMany({ where: { appointmentId: id } });
    return this.prisma.appointment.delete({ where: { id } });
  }

  private getMoroccoOffsetMinutes(dateStr: string): number {
    const d = new Date(dateStr + 'T12:00:00Z');
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Casablanca',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(d);
    const get = (t: string) => parseInt(parts.find(p => p.type === t)?.value || '0', 10);
    const localMs = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'));
    return (localMs - d.getTime()) / 60000;
  }

  async getAvailability(motifId: string, date: string, practitionerId?: string) {
    const motif = await this.prisma.motif.findUnique({
      where: { id: motifId },
      include: {
        practitionerAssignments: {
          include: { practitioner: { select: { id: true, name: true, image: true } } },
        },
        resourceAssignments: {
          include: { resource: { select: { id: true } } },
        },
      },
    });
    if (!motif) throw new NotFoundException("Motif not found");

    const assignedPractitioners = motif.practitionerAssignments.map(pa => pa.practitioner);
    const practitionerIds = practitionerId
      ? [practitionerId]
      : assignedPractitioners.map(p => p.id);

    if (!practitionerIds.length) return [];

    const assignedResourceIds = motif.resourceAssignments.map(ra => ra.resource.id);
    const [year, month, day] = date.split('-').map(Number);
    const offsetMinutes = this.getMoroccoOffsetMinutes(date);

    const startOfDay = new Date(Date.UTC(year, month - 1, day, -offsetMinutes / 60, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23 - offsetMinutes / 60, 59, 59, 999));

    const existingAppointments = await this.prisma.appointment.findMany({
      where: {
        OR: [
          { practitionerId: { in: practitionerIds } },
          ...(assignedResourceIds.length ? [{ resourceId: { in: assignedResourceIds } }] : []),
        ],
        status: { notIn: ["CANCELLED", "COMPLETED"] },
      },
      select: { id: true, practitionerId: true, resourceId: true },
    });

    const appointmentIds = existingAppointments.map(a => a.id);
    const schedules = await this.prisma.schedule.findMany({
      where: {
        appointmentId: { in: appointmentIds },
        datetime: { gte: startOfDay, lte: endOfDay },
      },
      select: { datetime: true, appointmentId: true },
    });

    const appointmentMap = new Map(
      existingAppointments.map(a => [a.id, { practitionerId: a.practitionerId, resourceId: a.resourceId }])
    );

    const conflicts = new Set<string>();
    for (const s of schedules) {
      const timeKey = new Date(s.datetime).getTime();
      const appt = appointmentMap.get(s.appointmentId);
      if (appt?.practitionerId) conflicts.add(`practitioner_${appt.practitionerId}_${timeKey}`);
      if (appt?.resourceId) conflicts.add(`resource_${appt.resourceId}_${timeKey}`);
    }

    const slots: { time: string; practitionerId: string; practitionerName: string; practitionerImage: string | null }[] = [];
    const duration = motif.duration || 30;
    const initialsAvatar = (name: string) => {
      const initials = name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2e90c0&color=fff&size=128`;
    };

    for (const practitioner of assignedPractitioners) {
      if (practitionerId && practitioner.id !== practitionerId) continue;

      for (let hour = 9; hour < 18; hour++) {
        for (let min = 0; min < 60; min += duration) {
          const slotTime = new Date(Date.UTC(year, month - 1, day, hour - offsetMinutes / 60, min, 0));
          const timeKey = slotTime.getTime();

          const practitionerConflict = conflicts.has(`practitioner_${practitioner.id}_${timeKey}`);
          let hasFreeResource = assignedResourceIds.length === 0;
          for (const rid of assignedResourceIds) {
            if (!conflicts.has(`resource_${rid}_${timeKey}`)) {
              hasFreeResource = true;
              break;
            }
          }

          if (!practitionerConflict && hasFreeResource) {
            slots.push({
              time: slotTime.toISOString(),
              practitionerId: practitioner.id,
              practitionerName: practitioner.name,
              practitionerImage: practitioner.image || initialsAvatar(practitioner.name),
            });
          }
        }
      }
    }

    slots.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    return slots;
  }
}
