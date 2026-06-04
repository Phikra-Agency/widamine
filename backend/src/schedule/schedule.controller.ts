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

@UseGuards(AuthGuard)
@Controller("schedule")
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  @UseGuards(RoleGuard("ADMIN", "RECEPTIONIST"))
  create(@Body() data: CreateScheduleDto) {
    return this.scheduleService.create(data);
  }

  @Get(":date")
  async findWeekByDate(
    @Req() req: { user: { id: string; role: string } },
    @Param("date") date: string,
  ) {
    try {
      return await this.scheduleService.findWeekByDate(req.user, new Date(date));
    } catch (e) {
      try {
        const fs = await import('fs')
        const err = e instanceof Error ? e.stack || e.message : JSON.stringify(e)
        fs.appendFileSync('/tmp/widamine-schedule-error.log', `${new Date().toISOString()} - ${err}\n\n`)
      } catch {}
      throw e
    }
  }

  @Get("get-available-time/:date")
  @UseGuards(RoleGuard("ADMIN", "RECEPTIONIST"))
  getOpenTime(@Param("date") date: string) {
    return this.scheduleService.getOpenTime(new Date(date));
  }

  @Put(":id")
  @UseGuards(RoleGuard("ADMIN", "RECEPTIONIST"))
  update(@Param("id") id: string, @Body() data: UpdateScheduleDto) {
    return this.scheduleService.update(id, data);
  }

  @Delete(":id")
  @UseGuards(RoleGuard("ADMIN"))
  remove(@Param("id") id: string) {
    return this.scheduleService.remove(id);
  }
}
