import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ResourceService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    slug?: string;
    type?: string;
    description?: string;
    priority?: number;
    motifIds?: string[];
  }) {
    const { name, slug, type, description, priority, motifIds } = data;
    const resource = await this.prisma.resource.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        type: type || 'SALLE',
        description,
        priority: priority || 0,
      },
    });

    if (motifIds?.length) {
      for (const motifId of motifIds) {
        await this.prisma.motifResource.create({
          data: { resourceId: resource.id, motifId },
        });
      }
    }

    return this.prisma.resource.findUnique({
      where: { id: resource.id },
      include: { motifAssignments: { include: { motif: true } } },
    });
  }

  async findAll() {
    return this.prisma.resource.findMany({
      include: {
        motifAssignments: { include: { motif: true } },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.resource.findUnique({
      where: { id },
      include: {
        motifAssignments: { include: { motif: true } },
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      type?: string;
      description?: string;
      isActive?: boolean;
      motifIds?: string[];
      priority?: number;
    },
  ) {
    const { name, slug, type, description, isActive, motifIds, priority } = data;

    await this.prisma.resource.update({
      where: { id },
      data: {
        name,
        slug,
        type,
        description,
        isActive,
        priority,
      },
    });

    if (motifIds !== undefined) {
      await this.prisma.motifResource.deleteMany({ where: { resourceId: id } });
      for (const motifId of motifIds) {
        await this.prisma.motifResource.create({
          data: { resourceId: id, motifId },
        });
      }
    }

    return this.prisma.resource.findUnique({
      where: { id },
      include: { motifAssignments: { include: { motif: true } } },
    });
  }

  async remove(id: string) {
    await this.prisma.motifResource.deleteMany({ where: { resourceId: id } });
    await this.prisma.resourcePractitioner.deleteMany({ where: { resourceId: id } });
    await this.prisma.availabilityBlock.deleteMany({ where: { resourceId: id } });
    return this.prisma.resource.delete({ where: { id } });
  }
}
