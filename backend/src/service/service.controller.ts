import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ServiceService } from "./service.service";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
import { RoleGuard } from "@/auth/role.guard";
import { AuthGuard } from "@/auth/auth.guard";

@Controller("services")
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  @UseGuards(AuthGuard, RoleGuard("ADMIN"))
  create(@Body() data: CreateServiceDto) {
    return this.serviceService.create(data);
  }

  @Get()
  findAll() {
    return this.serviceService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.serviceService.findOne(+id);
  }

  @Put(":id")
  @UseGuards(AuthGuard, RoleGuard("ADMIN"))
  update(@Param("id") id: string, @Body() data: UpdateServiceDto) {
    return this.serviceService.update(+id, data);
  }

  @Delete(":id")
  @UseGuards(AuthGuard, RoleGuard("ADMIN"))
  remove(@Param("id") id: string) {
    return this.serviceService.remove(+id);
  }
}
