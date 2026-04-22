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
    return this.prisma.resource.create({ data });
  }

  async findAll() {
    return this.prisma.resource.findMany();
  }

  async findOne(id: number) {
    return this.prisma.resource.findUnique({ where: { id } });
  }

  async update(
    id: number,
    data: {
      name?: string;
      slug?: string;
      type?: string;
      description?: string;
      isActive?: boolean;
    },
  ) {
    return this.prisma.resource.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.resource.delete({ where: { id } });
  }
}
