import { Injectable, BadRequestException } from "@nestjs/common";
import { CreateSessionDto, UpdateSessionDto } from "./dto/create-session.dto";
import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class SessionService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateSessionDto) {
    const motif = await this.prismaService.motif.findUnique({
      where: { id: data.motifId },
    });
    if (!motif) {
      throw new BadRequestException("Motif not found");
    }

    const sessionCount = await this.prismaService.session.count({
      where: { motifId: data.motifId },
    });

    if (sessionCount >= motif.numberOfSessions) {
      throw new BadRequestException(
        `Max sessions (${motif.numberOfSessions}) already created for this motif`
      );
    }

    return this.prismaService.session.create({
      data: {
        motifId: data.motifId,
        number: sessionCount + 1,
        duration: data.duration || motif.duration,
      },
    });
  }

  update(id: string, data: UpdateSessionDto) {
    return this.prismaService.session.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prismaService.schedule.deleteMany({ where: { sessionId: id } });
    return this.prismaService.session.delete({ where: { id } });
  }
}
