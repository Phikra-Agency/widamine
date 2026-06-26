import { Controller, Get, InternalServerErrorException, Req, UseGuards } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { AuthGuard } from "@/auth/auth.guard";

@UseGuards(AuthGuard)
@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("stats")
  async getStats(@Req() req: { user: { id: string; role: string } }) {
    try {
      return await this.dashboardService.getStats(req.user);
    } catch (e) {
      console.error("Dashboard stats error:", e);
      throw new InternalServerErrorException("Failed to load stats");
    }
  }
}
