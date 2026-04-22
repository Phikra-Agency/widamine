import { Injectable } from "@nestjs/common";
import { CreateSessionDto } from "./dto/create-session.dto";
import { UpdateSessionDto } from "./dto/update-session.dto";
import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class SessionService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateSessionDto) {
    const sessionCount = await this.prismaService.session.count({
      where: { serviceId: data.serviceId },
    });
    return this.prismaService.session.create({
      data: { ...data, session: sessionCount + 1 },
    });
  }

  update(id: number, data: UpdateSessionDto) {
    return this.prismaService.session.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prismaService.session.delete({ where: { id } });
  }
}
