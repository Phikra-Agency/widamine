import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PatientService } from "@/patient/patient.service";
import { toZonedTime, fromZonedTime, format } from 'date-fns-tz';

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

  private async checkTimeSlotConflict(
    motifId: string,
    practitionerId: string | undefined,
    resourceId: string | undefined,
    datetime: string
  ): Promise<boolean> {
    const motif = await this.prisma.motif.findUnique({
      where: { id: motifId },
      select: { duration: true },
    });
    const duration = motif?.duration || 30;
    const slotStart = new Date(datetime);
    const slotEnd = new Date(slotStart.getTime() + duration * 60 * 1000);

    const conflictingAppointment = await this.prisma.appointment.findFirst({
      where: {
        OR: [
          ...(practitionerId ? [{ practitionerId }] : []),
          ...(resourceId ? [{ resourceId }] : []),
        ],
        status: { notIn: ["CANCELLED", "COMPLETED"] },
        schedules: {
          some: {
            datetime: { gte: slotStart, lt: slotEnd },
          },
        },
      },
    });

    return !!conflictingAppointment;
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
    gender?: string;
  }) {
    const motif = await this.prisma.motif.findUnique({ where: { id: data.motifId } });
    if (!motif) throw new NotFoundException("Motif not found");

    const sessionNumber = data.sessionNumber ?? 1;
    await this.validateSessionSequence(data.motifId, sessionNumber);

    // CHECK FOR TIME SLOT CONFLICT BEFORE CREATING APPOINTMENT
    if (data.datetime) {
      const hasConflict = await this.checkTimeSlotConflict(
        data.motifId,
        data.practitionerId,
        data.resourceId,
        data.datetime
      );
      
      if (hasConflict) {
        throw new BadRequestException({
          message: "Ce créneau horaire n'est plus disponible. Veuillez choisir un autre créneau.",
          code: "time_slot_taken",
          datetime: data.datetime,
        });
      }
    }

    const patient = await this.patientService.findOrCreateByPhone({
      firstName: data.name.split(" ")[0] || data.name,
      lastName: data.name.split(" ").slice(1).join(" ") || "",
      email: data.email,
      phone: data.phone,
      gender: data.gender as any,
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
      // TIMEZONE FIX: Ensure datetime is properly parsed as ISO string (already in correct timezone from frontend)
      const scheduleDate = new Date(data.datetime);
      
      await this.prisma.schedule.create({
        data: {
          datetime: scheduleDate,
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
    const MOROCCO_TZ = 'Africa/Casablanca';
    
    // Parse dates in Morocco timezone
    const fromDateParts = from.split('-').map(Number);
    const toDateParts = to.split('-').map(Number);
    
    const fromDateMorocco = new Date(fromDateParts[0], fromDateParts[1] - 1, fromDateParts[2], 0, 0, 0, 0);
    const toDateMorocco = new Date(toDateParts[0], toDateParts[1] - 1, toDateParts[2], 23, 59, 59, 999);
    
    const fromDate = fromZonedTime(fromDateMorocco, MOROCCO_TZ);
    const toDate = fromZonedTime(toDateMorocco, MOROCCO_TZ);
    
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

  async getAvailability(motifId: string, date: string, practitionerId?: string) {
    const MOROCCO_TZ = 'Africa/Casablanca';
    
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
    
    // Parse date as YYYY-MM-DD in Morocco timezone
    const [year, month, day] = date.split('-').map(Number);
    
    // Create start/end of day in Morocco timezone, then convert to UTC for database query
    const startOfDayMorocco = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDayMorocco = new Date(year, month - 1, day, 23, 59, 59, 999);
    
    const startOfDay = fromZonedTime(startOfDayMorocco, MOROCCO_TZ);
    const endOfDay = fromZonedTime(endOfDayMorocco, MOROCCO_TZ);

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

    const slots: { time: string; practitionerId: string; practitionerName: string; practitionerImage: string | null; available: boolean }[] = [];
    const duration = motif.duration || 30;
    const initialsAvatar = (name: string) => {
      const initials = name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2e90c0&color=fff&size=128`;
    };

    for (const practitioner of assignedPractitioners) {
      if (practitionerId && practitioner.id !== practitionerId) continue;

      for (let hour = 9; hour < 18; hour++) {
        for (let min = 0; min < 60; min += duration) {
          // Create slot time in Morocco timezone
          const slotTimeMorocco = new Date(year, month - 1, day, hour, min, 0, 0);
          const slotTimeUTC = fromZonedTime(slotTimeMorocco, MOROCCO_TZ);
          const timeKey = slotTimeUTC.getTime();

          const practitionerConflict = conflicts.has(`practitioner_${practitioner.id}_${timeKey}`);
          let hasFreeResource = assignedResourceIds.length === 0;
          for (const rid of assignedResourceIds) {
            if (!conflicts.has(`resource_${rid}_${timeKey}`)) {
              hasFreeResource = true;
              break;
            }
          }

          const isAvailable = !practitionerConflict && hasFreeResource;

          // Return time as ISO string (UTC)
          slots.push({
            time: slotTimeUTC.toISOString(),
            practitionerId: practitioner.id,
            practitionerName: practitioner.name,
            practitionerImage: practitioner.image || initialsAvatar(practitioner.name),
            available: isAvailable,
          });
        }
      }
    }

    slots.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    return slots;
  }
}
