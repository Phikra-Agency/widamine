import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from "@nestjs/common";
import { MotifService } from "./motif.service";

@Controller("motifs")
export class MotifController {
  constructor(private readonly motifService: MotifService) {}

  @Get()
  findAll() {
    return this.motifService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.motifService.findOne(id);
  }

  @Post()
  create(
    @Body()
    data: {
      name: string;
      slug: string;
      bookingType: string;
      serviceId: string;
      duration?: number;
      description?: string;
    },
  ) {
    return this.motifService.create(data);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() data: any) {
    return this.motifService.update(id, data);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.motifService.remove(id);
  }
}
