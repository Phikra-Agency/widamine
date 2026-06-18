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
import { MotifService } from "./motif.service";
import { AuthGuard } from "@/auth/auth.guard";
import { RoleGuard } from "@/auth/role.guard";

@UseGuards(AuthGuard)
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
  @UseGuards(RoleGuard("ADMIN"))
  create(
    @Body()
    data: {
      name: string;
      slug: string;
      bookingType: string;
      serviceId: string;
      duration?: number;
      description?: string;
      color?: string;
      practitionerIds?: string[];
    },
  ) {
    return this.motifService.create(data);
  }

  @Put(":id")
  @UseGuards(RoleGuard("ADMIN"))
  update(@Param("id") id: string, @Body() data: any) {
    return this.motifService.update(id, data);
  }

  @Delete(":id")
  @UseGuards(RoleGuard("ADMIN"))
  remove(@Param("id") id: string) {
    return this.motifService.remove(id);
  }
}
