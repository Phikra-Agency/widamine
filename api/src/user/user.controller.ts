import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
  Req,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { AuthGuard } from "@/auth/auth.guard";
import { RoleGuard } from "@/auth/role.guard";

@UseGuards(AuthGuard)
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(RoleGuard("ADMIN", "RECEPTIONIST"))
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get("count")
  @UseGuards(RoleGuard("ADMIN", "RECEPTIONIST"))
  count() {
    return this.userService.count();
  }

  @Get()
  @UseGuards(RoleGuard("ADMIN", "RECEPTIONIST"))
  findAll() {
    return this.userService.findAll();
  }

  @Get("doctors")
  findDoctors() {
    return this.userService.findDoctors();
  }

  @Get(":id")
  @UseGuards(RoleGuard("ADMIN", "RECEPTIONIST"))
  findOne(@Param("id") id: string) {
    return this.userService.findOne(id);
  }

  @Put(":id")
  @UseGuards(RoleGuard("ADMIN", "RECEPTIONIST"))
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: any) {
    return this.userService.update(id, updateUserDto, req.user);
  }

  @Delete(":id")
  @UseGuards(RoleGuard("ADMIN"))
  remove(@Param("id") id: string) {
    return this.userService.remove(id);
  }
}
