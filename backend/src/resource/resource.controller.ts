import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from "@nestjs/common";
import { ResourceService } from "./resource.service";

@Controller("resources")
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Get()
  findAll() {
    return this.resourceService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.resourceService.findOne(id);
  }

  @Post()
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
  remove(@Param("id") id: string) {
    return this.resourceService.remove(id);
  }
}
