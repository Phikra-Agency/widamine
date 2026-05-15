import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";

const apptInclude = {
  patient: { select: { firstName: true, lastName: true, phone: true } },
  service: { select: { name: true } },
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
    const whereDoctor = !isAdmin ? { practitionerId: user.id } : {};

    // Counts
    const [todayTotal, todayConfirmed, todayPending, todayCompleted, todayCancelled] =
      await Promise.all([
        this.prisma.appointment.count({
          where: {
            ...whereDoctor,
            status: { not: "CANCELLED" },
            schedules: { some: { datetime: { gte: todayStart, lte: todayEnd } } },
          },
        }),
        this.prisma.appointment.count({
          where: {
            ...whereDoctor,
            status: "CONFIRMED",
            schedules: { some: { datetime: { gte: todayStart, lte: todayEnd } } },
          },
        }),
        this.prisma.appointment.count({
          where: {
            ...whereDoctor,
            status: "PENDING",
            schedules: { some: { datetime: { gte: todayStart, lte: todayEnd } } },
          },
        }),
        this.prisma.appointment.count({
          where: {
            ...whereDoctor,
            status: "COMPLETED",
            schedules: { some: { datetime: { gte: todayStart, lte: todayEnd } } },
          },
        }),
        this.prisma.appointment.count({
          where: {
            ...whereDoctor,
            status: "CANCELLED",
            schedules: { some: { datetime: { gte: todayStart, lte: todayEnd } } },
          },
        }),
      ]);

    // Currently running: CONFIRMED appointments that started in the last 90min (truly in progress)
    const currentlyRunning = await this.prisma.appointment.findMany({
      where: {
        ...whereDoctor,
        status: "CONFIRMED",
        schedules: { some: { datetime: { gte: recentWindow, lte: now } } },
      },
      include: apptInclude,
      orderBy: { createdAt: "desc" },
    });

    // Next upcoming: remaining confirmed/pending appointments for today
    const nextHour = await this.prisma.appointment.findMany({
      where: {
        ...whereDoctor,
        status: { in: ["CONFIRMED", "PENDING"] },
        schedules: {
          some: { datetime: { gt: now, lte: todayEnd } },
        },
      },
      include: apptInclude,
      orderBy: { createdAt: "asc" },
    });

    // All confirmed today (full day agenda)
    const confirmedToday = await this.prisma.appointment.findMany({
      where: {
        ...whereDoctor,
        status: "CONFIRMED",
        schedules: { some: { datetime: { gte: todayStart, lte: todayEnd } } },
      },
      include: apptInclude,
      orderBy: { createdAt: "desc" },
    });

    // Pending confirmations needing action
    const pendingConfirmations = await this.prisma.appointment.findMany({
      where: {
        ...whereDoctor,
        status: "PENDING",
        schedules: { some: { datetime: { gte: todayStart, lte: todayEnd } } },
      },
      include: apptInclude,
      orderBy: { createdAt: "desc" },
    });

    // Tomorrow preview (first 5)
    const tomorrowPreview = await this.prisma.appointment.findMany({
      where: {
        ...whereDoctor,
        status: { in: ["CONFIRMED", "PENDING"] },
        schedules: { some: { datetime: { gte: tomorrowStart, lte: tomorrowEnd } } },
      },
      include: apptInclude,
      orderBy: { createdAt: "asc" },
      take: 5,
    });

    return {
      todayTotal,
      todayConfirmed,
      todayPending,
      todayCompleted,
      todayCancelled,
      currentlyRunning,
      nextHour,
      confirmedToday,
      pendingConfirmations,
      tomorrowPreview,
    };
  }
}
