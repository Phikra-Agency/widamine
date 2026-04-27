import { Injectable } from "@nestjs/common";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class ServiceService {
  constructor(private readonly prismaService: PrismaService) {}
  create(data: CreateServiceDto) {
    return this.prismaService.service.create({ data });
  }

  findAll() {
    return this.prismaService.service.findMany({
      include: {
        primaryDoctor: { select: { name: true } },
        category: { select: { name: true } },
        _count: { select: { sessions: true } },
      },
    });
  }

  findOne(id: string) {
    return this.prismaService.service.findUnique({
      where: { id },
      include: {
        sessions: { orderBy: { number: "asc" } },
        category: { select: { name: true } },
        primaryDoctor: { select: { name: true } },
      },
    });
  }

  update(id: string, data: UpdateServiceDto) {
    return this.prismaService.service.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prismaService.service.delete({ where: { id } });
  }
}
