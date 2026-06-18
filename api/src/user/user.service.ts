import {
  ConflictException,
  ForbiddenException,
  Injectable,
  BadRequestException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { PrismaService } from "@/prisma/prisma.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      return await this.prismaService.user.create({
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
      where: { role: { in: ["DOCTOR", "PRACTITIONER"] } },
      select: { id: true, name: true },
    });
  }

  async findOne(id: string) {
    return this.prismaService.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, admin: true },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUser?: any) {
    const targetUser = await this.prismaService.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });
    if (!targetUser) throw new BadRequestException("User not found");

    // Receptionist cannot change any user's role
    if (currentUser?.role === "RECEPTIONIST") {
      if (updateUserDto.role !== undefined) {
        throw new ForbiddenException(
          "Receptionists cannot change user roles",
        );
      }
    }

    // Prevent removing the last admin's admin role
    if (
      targetUser.role === "ADMIN" &&
      updateUserDto.role &&
      updateUserDto.role !== "ADMIN"
    ) {
      const adminCount = await this.prismaService.user.count({
        where: { role: "ADMIN" },
      });
      if (adminCount <= 1) {
        throw new BadRequestException(
          "Cannot change the role of the last administrator",
        );
      }
    }

    try {
      const data: any = { ...updateUserDto };
      if (updateUserDto.password) {
        data.password = await bcrypt.hash(updateUserDto.password, 12);
      } else {
        delete data.password;
      }
      return await this.prismaService.user.update({
        where: { id },
        data,
        select: { id: true, name: true, email: true, role: true, admin: true },
      });
    } catch (e) {
      if (e.code === "P2002")
        throw new ConflictException(
          "A user with the same email is already registered",
        );
      throw e;
    }
  }

  async remove(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });
    if (!user) throw new BadRequestException("User not found");

    if (user.role === "ADMIN") {
      const adminCount = await this.prismaService.user.count({
        where: { role: "ADMIN" },
      });
      if (adminCount <= 1) {
        throw new BadRequestException(
          "Cannot delete the last administrator",
        );
      }
    }

    await this.prismaService.user.delete({
      where: { id },
    });
  }
}
