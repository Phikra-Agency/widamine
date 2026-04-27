import { Injectable } from "@nestjs/common";
import { CreateContactDto } from "./dto/create-contact.dto";
import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class ContactService {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: CreateContactDto) {
    return this.prismaService.contact.create({ data: data as any });
  }

  findAll(read: boolean) {
    return this.prismaService.contact.findMany({ where: { read } });
  }

  findOne(id: string) {
    return this.prismaService.contact.findUnique({ where: { id } as any });
  }

  read(id: string) {
    return this.prismaService.contact.update({
      where: { id } as any,
      data: { read: true },
    });
  }
}
