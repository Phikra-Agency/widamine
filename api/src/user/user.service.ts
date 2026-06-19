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
        throw new ConflictException({
          message: "A user with the same email is already registered",
          code: "user_email_taken",
        });
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
    if (!targetUser)
      throw new BadRequestException({
        message: "User not found",
        code: "user_not_found",
      });

    // Receptionist cannot change any user's role
    if (currentUser?.role === "RECEPTIONIST") {
      if (updateUserDto.role !== undefined) {
        throw new ForbiddenException({
          message: "Receptionists cannot change user roles",
          code: "receptionist_cannot_change_role",
        });
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
        throw new BadRequestException({
          message: "Cannot change the role of the last administrator",
          code: "cannot_change_last_admin_role",
        });
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
        throw new ConflictException({
          message: "A user with the same email is already registered",
          code: "user_email_taken",
        });
      throw e;
    }
  }

  async remove(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });
    if (!user)
      throw new BadRequestException({
        message: "User not found",
        code: "user_not_found",
      });

    if (user.role === "ADMIN") {
      const adminCount = await this.prismaService.user.count({
        where: { role: "ADMIN" },
      });
      if (adminCount <= 1) {
        throw new BadRequestException({
          message: "Cannot delete the last administrator",
          code: "cannot_delete_last_admin",
        });
      }
    }

    await this.prismaService.user.delete({
      where: { id },
    });
  }
}
