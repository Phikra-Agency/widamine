import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MotifService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    slug: string;
    bookingType: string;
    serviceId: number;
    duration?: number;
    description?: string;
  }) {
    return this.prisma.motif.create({
      data: {
        ...data,
        duration: data.duration || 30,
      },
    });
  }

  async findAll() {
    return this.prisma.motif.findMany({
      include: { service: true },
    });
  }

  async findOne(id: number) {
    return this.prisma.motif.findUnique({
      where: { id },
      include: { service: true },
    });
  }

  async update(id: number, data: any) {
    return this.prisma.motif.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.motif.delete({ where: { id } });
  }
}
