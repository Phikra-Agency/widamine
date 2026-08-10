import { Injectable } from "@nestjs/common";
import { CreatePatientDto } from "./dto/create-patient.dto";
import { UpdatePatientDto } from "./dto/update-patient.dto";
import { PrismaService } from "@/prisma/prisma.service";

const CITY_NORMALIZE: Record<string, string> = {
  casablanca: "Casablanca",
  rabat: "Rabat",
  marrakech: "Marrakech",
  fes: "Fès",
  "fès": "Fès",
  tanger: "Tanger",
};

function normalizeCity(city: string | undefined | null): string | undefined | null {
  if (!city) return city;
  const key = city.trim().toLowerCase();
  return CITY_NORMALIZE[key] ?? city.trim();
}

@Injectable()
export class PatientService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Find or create a patient by phone number.
   * If patient exists with this phone, update their info with new data.
   * Phone is the unique identifier for deduplication.
   */
  async findOrCreateByPhone(data: CreatePatientDto) {
    const existing = await this.prismaService.patient.findUnique({
      where: { phone: data.phone },
    });

    if (existing) {
      // Update existing patient with new data (merge strategy)
      const updateData: any = {};

      // Only update fields if new data is provided
      if (data.firstName) updateData.firstName = data.firstName;
      if (data.lastName) updateData.lastName = data.lastName;
      if (data.email) updateData.email = data.email;
      if (data.dateOfBirth) updateData.dateOfBirth = data.dateOfBirth;
      if (data.gender) updateData.gender = data.gender;
      if (data.address) updateData.address = data.address;
      if (data.city) updateData.city = normalizeCity(data.city);
      if (data.postalCode) updateData.postalCode = data.postalCode;
      if (data.country) updateData.country = data.country;
      if (data.medicalHistory) updateData.medicalHistory = data.medicalHistory;

      return this.prismaService.patient.update({
        where: { id: existing.id },
        data: updateData,
      });
    }

    // Create new patient
    return this.prismaService.patient.create({
      data: {
        firstName: data.firstName ?? "",
        lastName: data.lastName ?? "",
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender,
        address: data.address,
        city: normalizeCity(data.city),
        postalCode: data.postalCode,
        country: data.country || "Maroc",
        medicalHistory: data.medicalHistory,
      },
    });
  }

  async create(createPatientDto: CreatePatientDto) {
    return this.findOrCreateByPhone(createPatientDto);
  }

  async count(userRole?: string, userId?: string) {
    if (userRole === 'DOCTOR' || userRole === 'PRACTITIONER') {
      return this.prismaService.patient.count({
        where: {
          appointments: { some: { practitionerId: userId } },
        },
      })
    }
    return this.prismaService.patient.count()
  }

  async findAll() {
    return this.prismaService.patient.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        appointments: {
          orderBy: { createdAt: "desc" },
          include: {
            motif: { select: { name: true, color: true } },
            schedules: true,
          },
        },
      },
    });
  }

  async findByPractitioner(practitionerId: string) {
    return this.prismaService.patient.findMany({
      where: {
        appointments: {
          some: { practitionerId },
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        appointments: {
          where: { practitionerId },
          orderBy: { createdAt: "desc" },
          include: {

            motif: { select: { name: true, color: true } },
            schedules: true,
          },
        },
      },
    });
  }

  async isPatientOfDoctor(patientId: string, practitionerId: string): Promise<boolean> {
    const count = await this.prismaService.appointment.count({
      where: { patientId, practitionerId },
    });
    return count > 0;
  }

  async updateMedicalHistory(id: string, medicalHistory: string | undefined) {
    return this.prismaService.patient.update({
      where: { id },
      data: { medicalHistory: medicalHistory ?? null },
    });
  }

  async findOne(id: string) {
    return this.prismaService.patient.findUnique({
      where: { id },
      include: {
        appointments: {
          orderBy: { createdAt: "desc" },
          include: {

            motif: { select: { name: true, color: true } },
            practitioner: { select: { name: true } },
            schedules: true,
          },
        },
      },
    });
  }

  async findByPhone(phone: string) {
    return this.prismaService.patient.findUnique({
      where: { phone },
    });
  }

  async update(id: string, updatePatientDto: UpdatePatientDto) {
    const data: any = { ...updatePatientDto };
    if (updatePatientDto.dateOfBirth) {
      data.dateOfBirth = new Date(updatePatientDto.dateOfBirth);
    }
    if (data.city) data.city = normalizeCity(data.city);

    return this.prismaService.patient.update({
      where: { id },
      data,
    });
  }

  async deleteIfNoAppointments(patientId: string) {
    const any = await this.prismaService.appointment.count({
      where: { patientId },
    })
    if (any === 0) {
      await this.remove(patientId)
    }
  }

  async remove(id: string) {
    await this.prismaService.schedule.deleteMany({ where: { appointment: { patientId: id } } });
    await this.prismaService.notificationLog.deleteMany({ where: { appointment: { patientId: id } } });
    await this.prismaService.appointment.deleteMany({ where: { patientId: id } });
    return this.prismaService.patient.delete({
      where: { id },
    });
  }
}
