import { BadRequestException, Injectable } from "@nestjs/common";
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

  async remove(id: string) {
    await this.prismaService.schedule.deleteMany({ where: { session: { serviceId: id } } });
    await this.prismaService.notificationLog.deleteMany({ where: { appointment: { serviceId: id } } });
    await this.prismaService.schedule.deleteMany({ where: { appointment: { serviceId: id } } });
    const motifs = await this.prismaService.motif.findMany({ where: { serviceId: id }, select: { id: true } });
    for (const m of motifs) {
      await this.prismaService.motifPractitioner.deleteMany({ where: { motifId: m.id } });
      await this.prismaService.motifResource.deleteMany({ where: { motifId: m.id } });
    }
    await this.prismaService.session.deleteMany({ where: { serviceId: id } });
    await this.prismaService.motif.deleteMany({ where: { serviceId: id } });
    await this.prismaService.appointment.deleteMany({ where: { serviceId: id } });
    await this.prismaService.service.delete({ where: { id } });
  }
}
