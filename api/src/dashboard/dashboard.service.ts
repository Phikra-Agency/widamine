import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";

const apptInclude = {
  patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
  practitioner: { select: { name: true } },
  motif: { select: { name: true, color: true } },
  resource: { select: { name: true } },
  schedules: {
    orderBy: { datetime: "asc" as const },
    take: 1,
  },
};

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(user: { id: string; role: string }) {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const recentWindow = new Date(now.getTime() - 90 * 60 * 1000);

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const tomorrowEnd = new Date(todayEnd);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

    const isAdmin = !["DOCTOR", "PRACTITIONER"].includes(user.role);
    const practitionerId = String(user.id);

    // Use schedule.findMany with appointment relation (same pattern as schedule service which works)
    const todaySchedules = await this.prisma.schedule.findMany({
      where: {
        datetime: { gte: todayStart, lte: todayEnd },
        appointment: isAdmin ? {} : { practitionerId },
      },
      include: {
        appointment: { include: apptInclude },
      },
    })

    // Group by status
    const todayAppointments = todaySchedules
      .map(s => s.appointment)
      .filter(Boolean) as any[]

    const uniqueIds = new Set<string>()
    const unique = todayAppointments.filter((a: any) => {
      if (uniqueIds.has(a.id)) return false
      uniqueIds.add(a.id)
      return true
    })

    const todayTotal = unique.filter((a: any) => a.status !== "CANCELLED").length
    const todayConfirmed = unique.filter((a: any) => a.status === "CONFIRMED").length
    const todayPending = unique.filter((a: any) => a.status === "PENDING").length
    const todayCompleted = unique.filter((a: any) => a.status === "COMPLETED").length
    const todayCancelled = unique.filter((a: any) => a.status === "CANCELLED").length

    // Currently running (confirmed in last 90min)
    const runningSchedules = await this.prisma.schedule.findMany({
      where: {
        datetime: { gte: recentWindow, lte: now },
        appointment: {
          ...(isAdmin ? {} : { practitionerId }),
          status: "CONFIRMED",
        },
      },
      include: { appointment: { include: apptInclude } },
      orderBy: { datetime: "desc" },
    })
    const currentlyRunning = runningSchedules
      .map(s => s.appointment)
      .filter((a, i, arr) => a && arr.findIndex(x => x?.id === a?.id) === i)

    // Next upcoming
    const upcomingSchedules = await this.prisma.schedule.findMany({
      where: {
        datetime: { gt: now, lte: todayEnd },
        appointment: {
          ...(isAdmin ? {} : { practitionerId }),
          status: { in: ["CONFIRMED", "PENDING"] },
        },
      },
      include: { appointment: { include: apptInclude } },
      orderBy: { datetime: "asc" },
    })
    const nextHour = upcomingSchedules
      .map(s => s.appointment)
      .filter((a, i, arr) => a && arr.findIndex(x => x?.id === a?.id) === i)

    // Tomorrow preview
    const tomorrowSchedules = await this.prisma.schedule.findMany({
      where: {
        datetime: { gte: tomorrowStart, lte: tomorrowEnd },
        appointment: {
          ...(isAdmin ? {} : { practitionerId }),
          status: { in: ["CONFIRMED", "PENDING"] },
        },
      },
      include: { appointment: { include: apptInclude } },
      orderBy: { datetime: "asc" },
      take: 5,
    })
    const tomorrowPreview = tomorrowSchedules
      .map(s => s.appointment)
      .filter((a, i, arr) => a && arr.findIndex(x => x?.id === a?.id) === i)

    return {
      todayTotal,
      todayConfirmed,
      todayPending,
      todayCompleted,
      todayCancelled,
      currentlyRunning,
      nextHour,
      confirmedToday: unique.filter((a: any) => a.status === "CONFIRMED"),
      pendingConfirmations: unique.filter((a: any) => a.status === "PENDING"),
      tomorrowPreview,
    };
  }
}
