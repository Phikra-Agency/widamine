import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from "@nestjs/common";
import { AppointmentService } from "./appointment.service";

@Controller("appointments")
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get()
  findAll() {
    return this.appointmentService.findAll();
  }

  @Get("availability")
  getAvailability(
    @Query("serviceId") serviceId: string,
    @Query("date") date: string,
  ) {
    return this.appointmentService.getAvailability(+serviceId, date);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.appointmentService.findOne(id);
  }

  @Post()
  create(
    @Body()
    data: {
      name: string;
      email: string;
      phone: string;
      context?: string;
      serviceId: number;
      motifId?: number;
      practitionerId?: number;
      resourceId?: number;
    },
  ) {
    return this.appointmentService.create(data);
  }

  @Put(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() data: any) {
    return this.appointmentService.update(id, data);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.appointmentService.remove(id);
  }
}
