import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from "@nestjs/common";
import { UnavailabilityService } from "./unavailability.service";
import { AuthGuard } from "@/auth/auth.guard";
import { RoleGuard } from "@/auth/role.guard";

@Controller("unavailabilities")
export class UnavailabilityController {
  constructor(private readonly unavailabilityService: UnavailabilityService) {}

  @Get()
  @UseGuards(AuthGuard)
  findAll(@Req() req: any) {
    return this.unavailabilityService.findAll(req.user);
  }

  @Get("statistics")
  @UseGuards(AuthGuard)
  statistics(@Req() req: any) {
    return this.unavailabilityService.statistics(req.user);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Req() req: any,
    @Body()
    data: {
      startDate: string;
      endDate: string;
      startTime: string;
      endTime: string;
      excuseType: string;
      customReason?: string;
    },
  ) {
    return this.unavailabilityService.create(req.user, data);
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  findOne(@Req() req: any, @Param("id") id: string) {
    return this.unavailabilityService.findOne(req.user, id);
  }

  @Put(":id")
  @UseGuards(AuthGuard)
  update(
    @Req() req: any,
    @Param("id") id: string,
    @Body()
    data: {
      startDate: string;
      endDate: string;
      startTime: string;
      endTime: string;
      excuseType: string;
      customReason?: string;
    },
  ) {
    return this.unavailabilityService.update(req.user, id, data);
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  remove(@Req() req: any, @Param("id") id: string) {
    return this.unavailabilityService.remove(req.user, id);
  }

  @Post(":id/approve")
  @UseGuards(AuthGuard, RoleGuard("ADMIN"))
  approve(@Req() req: any, @Param("id") id: string) {
    return this.unavailabilityService.approve(req.user, id);
  }

  @Post(":id/reject")
  @UseGuards(AuthGuard, RoleGuard("ADMIN"))
  reject(
    @Req() req: any,
    @Param("id") id: string,
    @Body() body: { rejectionReason?: string },
  ) {
    return this.unavailabilityService.reject(req.user, id, body?.rejectionReason);
  }
}
