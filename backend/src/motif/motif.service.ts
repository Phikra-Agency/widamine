import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const DEFAULT_MOTIF_COLORS = [
  "#2E90C0",
  "#14B8A6",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#10B981",
  "#EC4899",
  "#0EA5E9",
];

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
        color: normalizeMotifColor(color) ?? getRandomMotifColor(),
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
    const normalizedColor = color === undefined ? undefined : normalizeMotifColor(color) ?? undefined;

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
        color: normalizedColor,
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

function normalizeMotifColor(value?: string) {
  if (!value) return null;
  const trimmed = value.trim();
  const prefixed = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return /^#[0-9A-Fa-f]{6}$/.test(prefixed) ? prefixed.toUpperCase() : null;
}

function getRandomMotifColor() {
  return DEFAULT_MOTIF_COLORS[Math.floor(Math.random() * DEFAULT_MOTIF_COLORS.length)];
}
