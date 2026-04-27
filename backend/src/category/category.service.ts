import { Injectable } from "@nestjs/common";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { PrismaService } from "@/prisma/prisma.service";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: CreateCategoryDto) {
    return this.prismaService.category.create({ data: data as any });
  }

  findAll() {
    return this.prismaService.category.findMany({
      include: { _count: { select: { services: true } } },
    });
  }

  update(id: string, data: UpdateCategoryDto) {
    return this.prismaService.category.update({ where: { id }, data: data as any });
  }

  remove(id: string) {
    return this.prismaService.category.delete({ where: { id } });
  }
}
