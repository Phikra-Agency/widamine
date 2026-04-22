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
        doctor: { select: { name: true } },
        category: { select: { category: true } },
        _count: { select: { sessions: true } },
      },
    });
  }

  findOne(id: number) {
    return this.prismaService.service.findUnique({
      where: { id },
      include: {
        sessions: { orderBy: { session: "asc" } },
        category: { select: { category: true } },
        doctor: { select: { name: true } },
      },
    });
  }

  update(id: number, data: UpdateServiceDto) {
    return this.prismaService.service.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prismaService.service.delete({ where: { id } });
  }
}
