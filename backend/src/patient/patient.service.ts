import { Injectable } from "@nestjs/common";
import { CreatePatientDto } from "./dto/create-patient.dto";
import { UpdatePatientDto } from "./dto/update-patient.dto";
import { PrismaService } from "@/prisma/prisma.service";

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
      if (data.city) updateData.city = data.city;
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
        city: data.city,
        postalCode: data.postalCode,
        country: data.country || "Maroc",
        medicalHistory: data.medicalHistory,
      },
    });
  }

  async create(createPatientDto: CreatePatientDto) {
    return this.findOrCreateByPhone(createPatientDto);
  }

  async findAll() {
    return this.prismaService.patient.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        appointments: {
          orderBy: { createdAt: "desc" },
          include: {
            service: { select: { name: true } },
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
            service: { select: { name: true } },
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
            service: { select: { name: true } },
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

    return this.prismaService.patient.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prismaService.patient.delete({
      where: { id },
    });
  }
}
