import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MotifService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    slug?: string;
    bookingType?: string;
    serviceId?: string;
    duration?: number;
    description?: string;
    color?: string;
    practitionerIds?: string[];
  }) {
    const { 
      name, slug, bookingType, serviceId, duration, 
      description, color, practitionerIds 
    } = data;

    const motif = await this.prisma.motif.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        bookingType: bookingType || 'STANDARD',
        serviceId: serviceId || '000000000000000000000000',
        duration: duration || 30,
        description,
        color,
      },
    });

    if (practitionerIds?.length) {
      for (const pid of practitionerIds) {
        await this.prisma.motifPractitioner.create({
          data: { motifId: motif.id, practitionerId: pid },
        });
      }
    }

    return this.prisma.motif.findUnique({
      where: { id: motif.id },
      include: { service: true, practitionerAssignments: true },
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

    await this.prisma.motif.update({
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
      },
    });

    if (practitionerIds !== undefined) {
      await this.prisma.motifPractitioner.deleteMany({ where: { motifId: id } });
      for (const pid of practitionerIds) {
        await this.prisma.motifPractitioner.create({
          data: { motifId: id, practitionerId: pid },
        });
      }
    }

    return this.prisma.motif.findUnique({
      where: { id },
      include: { service: true, practitionerAssignments: true },
    });
  }

  async remove(id: string) {
    await this.prisma.motifPractitioner.deleteMany({ where: { motifId: id } });
    return this.prisma.motif.delete({ where: { id } });
  }
}
