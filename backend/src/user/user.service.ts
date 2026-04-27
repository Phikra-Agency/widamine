import { ConflictException, Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { PrismaService } from "@/prisma/prisma.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      await this.prismaService.user.create({
        data: {
          ...createUserDto,
          password: await bcrypt.hash(createUserDto.password, 12),
        },
      });
    } catch (e) {
      if (e.code === "P2002")
        throw new ConflictException(
          "A user with the same email is already registered",
        );
    }
  }

  async findAll() {
    return this.prismaService.user.findMany({
      select: { id: true, name: true, email: true, role: true, admin: true },
    });
  }

  async findDoctors() {
    return this.prismaService.user.findMany({
      where: { role: "DOCTOR" },
      select: { id: true, name: true },
    });
  }

  async findOne(id: string) {
    return this.prismaService.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, admin: true },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const data: any = { ...updateUserDto };
      if (updateUserDto.password) {
        data.password = await bcrypt.hash(updateUserDto.password, 12);
      }
      await this.prismaService.user.update({
        where: { id },
        data,
        select: { id: true, name: true, email: true, role: true, admin: true },
      });
    } catch (e) {
      if (e.code === "P2002")
        throw new ConflictException(
          "A user with the same email is already registered",
        );
    }
  }

  async remove(id: string) {
    await this.prismaService.user.delete({
      where: { id },
    });
  }
}
