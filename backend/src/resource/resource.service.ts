import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ResourceService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    slug: string;
    type: string;
    description?: string;
    priority?: number;
    motifIds?: string[];
  }) {
    const { name, slug, type, description, priority, motifIds } = data;
    return this.prisma.resource.create({
      data: {
        name,
        slug,
        type,
        description,
        priority: priority || 0,
        motifAssignments: motifIds
          ? {
              create: motifIds.map((motifId) => ({
                motifId,
              })),
            }
          : undefined,
      },
    });
  }

  async findAll() {
    return this.prisma.resource.findMany({
      include: {
        motifAssignments: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.resource.findUnique({
      where: { id },
      include: {
        motifAssignments: true,
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
    return this.prisma.resource.update({
      where: { id },
      data: {
        name,
        slug,
        type,
        description,
        isActive,
        priority,
        motifAssignments: motifIds
          ? {
              deleteMany: {},
              create: motifIds.map((motifId) => ({
                motifId,
              })),
            }
          : undefined,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.resource.delete({ where: { id } as any });
  }
}
