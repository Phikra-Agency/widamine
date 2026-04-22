import { Injectable } from "@nestjs/common";
import { CreateContactDto } from "./dto/create-contact.dto";
import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class ContactService {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: CreateContactDto) {
    return this.prismaService.contact.create({ data });
  }

  findAll(read: boolean) {
    return this.prismaService.contact.findMany({ where: { read } });
  }

  findOne(id: number) {
    return this.prismaService.contact.findUnique({ where: { id } });
  }

  read(id: number) {
    return this.prismaService.contact.update({
      where: { id },
      data: { read: true },
    });
  }
}
