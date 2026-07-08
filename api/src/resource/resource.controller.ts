import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { ResourceService } from "./resource.service";
import { AuthGuard } from "@/auth/auth.guard";
import { RoleGuard } from "@/auth/role.guard";

@UseGuards(AuthGuard)
@Controller("resources")
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Get("count")
  count() {
    return this.resourceService.count();
  }

  @Get()
  findAll() {
    return this.resourceService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.resourceService.findOne(id);
  }

  @Post()
  @UseGuards(RoleGuard("ADMIN"))
  create(
    @Body()
    data: {
      name: string;
      slug: string;
      type: string;
      description?: string;
    },
  ) {
    return this.resourceService.create(data);
  }

  @Put(":id")
  @UseGuards(RoleGuard("ADMIN"))
  update(
    @Param("id") id: string,
    @Body()
    data: {
      name?: string;
      slug?: string;
      type?: string;
      description?: string;
      isActive?: boolean;
    },
  ) {
    return this.resourceService.update(id, data);
  }

  @Delete(":id")
  @UseGuards(RoleGuard("ADMIN"))
  remove(@Param("id") id: string) {
    return this.resourceService.remove(id);
  }
}
