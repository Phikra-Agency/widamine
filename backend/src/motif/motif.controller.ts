import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
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
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.motifService.findOne(id);
  }

  @Post()
  create(
    @Body()
    data: {
      name: string;
      slug: string;
      bookingType: string;
      serviceId: number;
      duration?: number;
      description?: string;
    },
  ) {
    return this.motifService.create(data);
  }

  @Put(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() data: any) {
    return this.motifService.update(id, data);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.motifService.remove(id);
  }
}
