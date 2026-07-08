import { Injectable } from "@nestjs/common";
import { CreateContactDto } from "./dto/create-contact.dto";
import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class ContactService {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: CreateContactDto) {
    return this.prismaService.contact.create({ data });
  }

  countUnread() {
    return this.prismaService.contact.count({ where: { read: false } });
  }

  findAll(read?: boolean) {
    const where = read !== undefined ? { read } : {};
    return this.prismaService.contact.findMany({ where, orderBy: { createdAt: "desc" } });
  }

  findOne(id: string) {
    return this.prismaService.contact.findUnique({ where: { id } });
  }

  read(id: string) {
    return this.prismaService.contact.update({
      where: { id },
      data: { read: true },
    });
  }

  remove(id: string) {
    return this.prismaService.contact.delete({ where: { id } });
  }
}
