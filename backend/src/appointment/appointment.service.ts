import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PatientService } from "@/patient/patient.service";

@Injectable()
export class AppointmentService {
  constructor(
    private prisma: PrismaService,
    private patientService: PatientService,
  ) {}

  async create(data: {
    name: string;
    email: string;
    phone: string;
    context?: string;
    serviceId: string;
    motifId?: string;
    practitionerId?: string;
    resourceId?: string;
    datetime?: string;
  }) {
    // Find or create patient by phone
    const patient = await this.patientService.findOrCreateByPhone({
      firstName: data.name.split(' ')[0] || data.name,
      lastName: data.name.split(' ').slice(1).join(' ') || '',
      email: data.email,
      phone: data.phone,
    });

    // Find the first session for this service, or create a default one
    let session = await this.prisma.session.findFirst({
      where: { serviceId: data.serviceId },
      orderBy: { number: 'asc' },
    });

    if (!session) {
      const sessionCount = await this.prisma.session.count({
        where: { serviceId: data.serviceId },
      });
      session = await this.prisma.session.create({
        data: {
          serviceId: data.serviceId,
          number: sessionCount + 1,
          duration: 30,
        },
      });
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        context: data.context,
        patientId: patient.id,
        serviceId: data.serviceId,
        motifId: data.motifId,
        practitionerId: data.practitionerId,
        resourceId: data.resourceId,
        status: "PENDING",
      },
      include: {
        service: true,
        motif: true,
        practitioner: true,
        patient: true,
      },
    });

    // Create schedule if datetime is provided
    if (data.datetime) {
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

  async findAll() {
    return this.prisma.appointment.findMany({
      include: {
        service: true,
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

  async findByPractitioner(practitionerId: string) {
    return this.prisma.appointment.findMany({
      where: { practitionerId },
      include: {
        service: true,
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
        service: true, 
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
      serviceId: string;
      motifId: string;
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
        service: true, 
        motif: true, 
        practitioner: true,
        patient: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.appointment.delete({ where: { id } });
  }

  async getAvailability(serviceId: string, date: string) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get the service and its allowed doctors/salles
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      include: { sessions: true },
    });

    if (!service || !service.sessions.length) return [];

    // Use allowedDoctorIds from service (now stored as String[] in MongoDB)
    const allowedDoctorIds = service.allowedDoctorIds?.length 
      ? service.allowedDoctorIds 
      : [service.primaryDoctorId];
    const allowedSalleIds = service.allowedSalleIds || [];

    // If no doctors configured, return empty
    if (!allowedDoctorIds.length) return [];

    // Get all existing appointments that conflict with this service's allowed doctors/salles
    const conflictingAppointments = await this.prisma.appointment.findMany({
      where: {
        OR: [
          { practitionerId: { in: allowedDoctorIds } },
          { resourceId: { in: allowedSalleIds } },
        ],
        status: { notIn: ['CANCELLED', 'COMPLETED'] },
      },
      select: {
        id: true,
        practitionerId: true,
        resourceId: true,
      },
    });

    // Get scheduled times for these appointments
    const appointmentIds = conflictingAppointments.map(a => a.id);
    const schedules = await this.prisma.schedule.findMany({
      where: {
        appointmentId: { in: appointmentIds },
        datetime: { gte: startOfDay, lte: endOfDay },
      },
      select: {
        datetime: true,
        appointmentId: true,
      },
    });

    // Map appointmentId -> practitionerId, resourceId
    const appointmentMap = new Map(
      conflictingAppointments.map(a => [a.id, { doctorId: a.practitionerId, salleId: a.resourceId }])
    );

    // Build conflict set: Set of "doctorId_timestamp" and "salleId_timestamp"
    const conflicts = new Set<string>();
    for (const s of schedules) {
      const timeKey = new Date(s.datetime).getTime();
      const appt = appointmentMap.get(s.appointmentId);
      if (appt?.doctorId) conflicts.add(`${appt.doctorId}_${timeKey}`);
      if (appt?.salleId) conflicts.add(`${appt.salleId}_${timeKey}`);
    }

    // Get doctors for display
    const doctors = await this.prisma.user.findMany({
      where: { id: { in: allowedDoctorIds } },
      select: { id: true, name: true, image: true },
    });
    const doctorMap = new Map(doctors.map(d => [d.id, { name: d.name, image: d.image }]));

    // Generate avatar URL from initials when no image
    const initialsAvatar = (name: string) => {
      const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2e90c0&color=fff&size=128`;
    };

    // Generate slots: for each doctor, check if they have conflicts
    const slots: { time: string; doctorId: string; doctorName: string; doctorImage: string | null }[] = [];
    const duration = service.sessions[0]?.duration || 30;

    for (const doctorId of allowedDoctorIds) {
      const doctor = doctorMap.get(doctorId) ?? { name: 'Unknown', image: null };
      const doctorName = typeof doctor === 'string' ? doctor : doctor.name;
      const doctorImage = typeof doctor === 'string' ? null : doctor.image;

      for (let hour = 9; hour < 18; hour++) {
        for (let min = 0; min < 60; min += duration) {
          const slotTime = new Date(date);
          slotTime.setHours(hour, min, 0, 0);
          const timeKey = slotTime.getTime();

          // Check if this doctor OR any salle is booked at this time
          const doctorConflict = conflicts.has(`${doctorId}_${timeKey}`);
          let salleConflict = false;
          for (const salleId of allowedSalleIds) {
            if (conflicts.has(`${salleId}_${timeKey}`)) {
              salleConflict = true;
              break;
            }
          }

          if (!doctorConflict && !salleConflict) {
            slots.push({
              time: slotTime.toISOString(),
              doctorId,
              doctorName,
              doctorImage: doctorImage || initialsAvatar(doctorName),
            });
          }
        }
      }
    }

    // Sort by time
    slots.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    return slots;
  }
}
