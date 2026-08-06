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
    duration?: number;
    numberOfSessions?: number;
    isOnlineBookable?: boolean;
    requiresPractitionerChoice?: boolean;
    pendingTtlHours?: number;
    description?: string;
    color?: string;
    practitionerIds?: string[];
    resourceIds?: string[];
  }) {
    const { 
      name, slug, duration, numberOfSessions, 
      isOnlineBookable, requiresPractitionerChoice, pendingTtlHours,
      description, color, practitionerIds, resourceIds 
    } = data;

    const motif = await this.prisma.motif.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        duration: duration || 30,
        numberOfSessions: numberOfSessions ?? 1,
        isOnlineBookable: isOnlineBookable ?? false,
        requiresPractitionerChoice: requiresPractitionerChoice ?? false,
        pendingTtlHours: pendingTtlHours ?? 24,
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

    if (resourceIds?.length) {
      for (const rid of resourceIds) {
        await this.prisma.motifResource.create({
          data: { motifId: motif.id, resourceId: rid },
        });
      }
    }

    return this.prisma.motif.findUnique({
      where: { id: motif.id },
      include: { practitionerAssignments: true, resourceAssignments: true, sessions: true },
    });
  }

  async count() {
    return this.prisma.motif.count()
  }

  async findAll() {
    const motifs = await this.prisma.motif.findMany({
      include: { 
        practitionerAssignments: true,
        resourceAssignments: true,
        sessions: { orderBy: { number: "asc" } },
      },
    });
    console.log('[MotifService] Raw Prisma result (first motif):', JSON.stringify(motifs[0], null, 2));
    return motifs;
  }

  async findOne(id: string) {
    return this.prisma.motif.findUnique({
      where: { id },
      include: { 
        practitionerAssignments: true,
        resourceAssignments: true,
        sessions: { orderBy: { number: "asc" } },
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      duration?: number;
      numberOfSessions?: number;
      isOnlineBookable?: boolean;
      requiresPractitionerChoice?: boolean;
      pendingTtlHours?: number;
      description?: string;
      isActive?: boolean;
      color?: string;
      practitionerIds?: string[];
      resourceIds?: string[];
    },
  ) {
    const { 
      name, slug, duration, numberOfSessions, 
      isOnlineBookable, requiresPractitionerChoice, pendingTtlHours,
      description, isActive, color, practitionerIds, resourceIds 
    } = data;
    const normalizedColor = color === undefined ? undefined : normalizeMotifColor(color) ?? undefined;

    await this.prisma.motif.update({
      where: { id },
      data: {
        name,
        slug,
        duration,
        numberOfSessions,
        isOnlineBookable,
        requiresPractitionerChoice,
        pendingTtlHours,
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

    if (resourceIds !== undefined) {
      await this.prisma.motifResource.deleteMany({ where: { motifId: id } });
      for (const rid of resourceIds) {
        await this.prisma.motifResource.create({
          data: { motifId: id, resourceId: rid },
        });
      }
    }

    return this.prisma.motif.findUnique({
      where: { id },
      include: { practitionerAssignments: true, resourceAssignments: true, sessions: true },
    });
  }

  async remove(id: string) {
    await this.prisma.motifPractitioner.deleteMany({ where: { motifId: id } });
    await this.prisma.motifResource.deleteMany({ where: { motifId: id } });
    await this.prisma.session.deleteMany({ where: { motifId: id } });
    await this.prisma.schedule.deleteMany({ where: { appointment: { motifId: id } } });
    await this.prisma.notificationLog.deleteMany({ where: { appointment: { motifId: id } } });
    await this.prisma.appointment.deleteMany({ where: { motifId: id } });
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
