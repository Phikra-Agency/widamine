import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MotifService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    slug: string;
    bookingType: string;
    serviceId: string;
    duration?: number;
    description?: string;
    color?: string;
    practitionerIds?: string[];
  }) {
    const { 
      name, slug, bookingType, serviceId, duration, 
      description, color, practitionerIds 
    } = data;

    return this.prisma.motif.create({
      data: {
        name,
        slug,
        bookingType,
        serviceId,
        duration: duration || 30,
        description,
        color,
        practitionerAssignments: practitionerIds
          ? {
              create: practitionerIds.map((pid) => ({
                practitionerId: pid,
              })),
            }
          : undefined,
      },
    });
  }

  async findAll() {
    return this.prisma.motif.findMany({
      include: { 
        service: true,
        practitionerAssignments: true
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.motif.findUnique({
      where: { id },
      include: { 
        service: true,
        practitionerAssignments: true
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      bookingType?: string;
      serviceId?: string;
      duration?: number;
      description?: string;
      isActive?: boolean;
      color?: string;
      practitionerIds?: string[];
    },
  ) {
    const { 
      name, slug, bookingType, serviceId, duration, 
      description, isActive, color, practitionerIds 
    } = data;

    return this.prisma.motif.update({
      where: { id },
      data: {
        name,
        slug,
        bookingType,
        serviceId,
        duration,
        description,
        isActive,
        color,
        practitionerAssignments: practitionerIds
          ? {
              deleteMany: {},
              create: practitionerIds.map((pid) => ({
                practitionerId: pid,
              })),
            }
          : undefined,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.motif.delete({ where: { id } });
  }
}
