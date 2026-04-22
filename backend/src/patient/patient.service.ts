import { ConflictException, Injectable } from "@nestjs/common";
import { CreatePatientDto } from "./dto/create-patient.dto";
import { UpdatePatientDto } from "./dto/update-patient.dto";
import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class PatientService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createPatientDto: CreatePatientDto) {
    try {
      return await this.prismaService.patient.create({
        data: {
          ...createPatientDto,
          dateOfBirth: new Date(createPatientDto.dateOfBirth),
        },
      });
    } catch (e) {
      if (e.code === "P2002")
        throw new ConflictException(
          "A patient with the same email is already registered",
        );
      throw e;
    }
  }

  async findAll() {
    return this.prismaService.patient.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: number) {
    return this.prismaService.patient.findUnique({
      where: { id },
    });
  }

  async update(id: number, updatePatientDto: UpdatePatientDto) {
    try {
      return await this.prismaService.patient.update({
        where: { id },
        data: {
          ...updatePatientDto,
          ...(updatePatientDto.dateOfBirth && {
            dateOfBirth: new Date(updatePatientDto.dateOfBirth),
          }),
        },
      });
    } catch (e) {
      if (e.code === "P2002")
        throw new ConflictException(
          "A patient with the same email is already registered",
        );
      throw e;
    }
  }

  async remove(id: number) {
    return this.prismaService.patient.delete({
      where: { id },
    });
  }
}
