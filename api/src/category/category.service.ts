import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { PrismaService } from "@/prisma/prisma.service";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: CreateCategoryDto) {
    return this.prismaService.category.create({ data });
  }

  findAll() {
    return this.prismaService.category.findMany({
      include: { _count: { select: { services: true } } },
    });
  }

  update(id: string, data: UpdateCategoryDto) {
    return this.prismaService.category.update({ where: { id }, data });
  }

  async remove(id: string) {
    const svcs = await this.prismaService.service.findMany({ where: { categoryId: id }, select: { id: true } });
    if (svcs.length) {
      throw new BadRequestException("Cannot delete category with existing services. Delete or reassign services first.");
    }
    return this.prismaService.category.delete({ where: { id } });
  }
}
