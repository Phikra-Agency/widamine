import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Req,
} from "@nestjs/common";
import { ScheduleService } from "./schedule.service";
import { CreateScheduleDto } from "./dto/create-schedule.dto";
import { UpdateScheduleDto } from "./dto/update-schedule.dto";
import { AuthGuard } from "@/auth/auth.guard";
import { RoleGuard } from "@/auth/role.guard";

@Controller("schedule")
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  create(@Body() data: CreateScheduleDto) {
    return this.scheduleService.create(data);
  }

  @Get(":date")
  @UseGuards(AuthGuard)
  findWeekByDate(
    @Req() req: { user: { id: number } },
    @Param("date") date: string,
  ) {
    return this.scheduleService.findWeekByDate(req, new Date(date));
  }

  @Get("get-available-time/:date")
  @UseGuards(AuthGuard, RoleGuard("ADMIN", "RECEPTIONIST"))
  getOpenTime(@Param("date") date: string) {
    return this.scheduleService.getOpenTime(new Date(date));
  }

  @Put(":id")
  @UseGuards(AuthGuard, RoleGuard("ADMIN", "RECEPTIONIST"))
  update(@Param("id") id: string, @Body() data: UpdateScheduleDto) {
    return this.scheduleService.update(+id, data);
  }

  @Delete(":id")
  @UseGuards(AuthGuard, RoleGuard("ADMIN"))
  remove(@Param("id") id: string) {
    return this.scheduleService.remove(+id);
  }
}
