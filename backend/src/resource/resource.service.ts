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
  }) {
    return this.prisma.resource.create({ data: data as any });
  }

  async findAll() {
    return this.prisma.resource.findMany();
  }

  async findOne(id: string) {
    return this.prisma.resource.findUnique({ where: { id } as any });
  }

  async update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      type?: string;
      description?: string;
      isActive?: boolean;
    },
  ) {
    return this.prisma.resource.update({ where: { id } as any, data: data as any });
  }

  async remove(id: string) {
    return this.prisma.resource.delete({ where: { id } as any });
  }
}
