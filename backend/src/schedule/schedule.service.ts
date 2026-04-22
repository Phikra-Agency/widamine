import { Injectable, NotAcceptableException } from "@nestjs/common";
import { CreateScheduleDto } from "./dto/create-schedule.dto";
import { UpdateScheduleDto } from "./dto/update-schedule.dto";
import { PrismaService } from "@/prisma/prisma.service";

const ACTIVE_APPOINTMENT_STATUSES: string[] = ["PENDING", "CONFIRMED"];

@Injectable()
export class ScheduleService {
  constructor(private readonly prismaService: PrismaService) {}
  create(data: CreateScheduleDto) {
    return this.prismaService.schedule.create({ data });
  }

  async findWeekByDate(req: { user: { id: number } }, unsanitized_date: Date) {
    await this.prismaService.appointment.updateMany({
      where: { status: "PENDING", expiresAt: { lte: new Date() } },
      data: { status: "EXPIRED" },
    });

    const date = new Date(unsanitized_date);

    //! round to monday to get the full week
    date.setDate(
      unsanitized_date.getDate() - ((unsanitized_date.getDay() + 6) % 7),
    );

    const user = await this.prismaService.user.findUnique({
      where: { id: req.user.id },
      select: { role: true },
    });

    if (!user) throw new NotAcceptableException("User not found");

    const { start, end } = this.getDateRange(date, 6);
    const appointmentFilter =
      user.role === "DOCTOR"
        ? {
            status: {
              in: ACTIVE_APPOINTMENT_STATUSES,
            },
            OR: [
              { practitionerId: req.user.id },
              {
                practitionerId: null,
                service: {
                  doctorId: req.user.id,
                },
              },
            ],
          }
        : {
            status: {
              in: ACTIVE_APPOINTMENT_STATUSES,
            },
          };

    const schedules = await this.prismaService.schedule.findMany({
      where: {
        datetime: {
          gte: start,
          lt: end,
        },
        appointment: appointmentFilter,
      },
      select: {
        id: true,
        datetime: true,
        sessionId: true,
        appointmentId: true,
        session: {
          select: {
            id: true,
            session: true,
            duration: true,
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        appointment: {
          select: {
            id: true,
            status: true,
            practitionerId: true,
            practitioner: {
              select: {
                id: true,
                name: true,
              },
            },
            resource: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return Array.from({ length: 6 }).map((_, idx) => {
      const dayStart = new Date(date);
      dayStart.setDate(dayStart.getDate() + idx);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      return {
        morning: schedules.filter((sch) => {
          const sch_date = new Date(sch.datetime);
          return (
            dayStart <= sch_date &&
            sch_date < dayEnd &&
            sch_date.getHours() < 12
          );
        }),
        afternoon: schedules.filter((sch) => {
          const sch_date = new Date(sch.datetime);
          return (
            dayStart <= sch_date &&
            sch_date < dayEnd &&
            sch_date.getHours() >= 12 &&
            sch_date.getHours() < 16
          );
        }),
        evening: schedules.filter((sch) => {
          const sch_date = new Date(sch.datetime);
          return (
            dayStart <= sch_date &&
            sch_date < dayEnd &&
            sch_date.getHours() >= 16
          );
        }),
      };
    });
  }

  update(id: number, data: UpdateScheduleDto) {
    return this.prismaService.schedule.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prismaService.schedule.delete({ where: { id } });
  }

  async getOpenTime(date: Date) {
    await this.prismaService.appointment.updateMany({
      where: { status: "PENDING", expiresAt: { lte: new Date() } },
      data: { status: "EXPIRED" },
    });

    const { start, end } = this.getDateRange(date, 1);
    const records = (await this.prismaService.schedule.findMany({
      where: {
        datetime: { gte: start, lt: end },
        appointment: {
          status: {
            in: ACTIVE_APPOINTMENT_STATUSES,
          },
        },
      },
      select: { datetime: true, session: { select: { duration: true } } },
      orderBy: { datetime: "asc" },
    })) as { datetime: Date; session: { duration: number } }[];

    return this.getOpenTimeByRecords(
      records,
      this.DAYS_OF_THE_WEEK[date.getDay() - 1],
    );
  }

  //! Private Class Methods

  private getOpenTimeByRecords(
    records: { datetime: Date; session: { duration: number } }[],
    day: string,
  ) {
    if (!day)
      throw new NotAcceptableException("can't select a non working day");

    const daySchedule = this.SCHEDULE_OF_THE_WEEK[day];

    const available: {
      morning: { hours: number; minutes: number }[];
      afternoon: { hours: number; minutes: number }[];
      evening: { hours: number; minutes: number }[];
    } = {
      morning: [],
      afternoon: [],
      evening: [],
    };

    records
      .map((r) => ({
        hours: r.datetime.getHours(),
        minutes: r.datetime.getMinutes(),
        timeSlicesCount: Math.trunc(r.session.duration / 30),
      }))
      .forEach((r) => {
        for (let i = 0; i < r.timeSlicesCount; i++) {
          const slot = new Date(2000, 0, 1, r.hours, r.minutes, 0, 0);
          slot.setMinutes(slot.getMinutes() + i * 30);

          const targetHours = slot.getHours();
          const targetMinutes = slot.getMinutes();

          if (targetHours < 12) {
            available.morning.push({
              hours: targetHours,
              minutes: targetMinutes,
            });
          } else if (targetHours < 16) {
            available.afternoon.push({
              hours: targetHours,
              minutes: targetMinutes,
            });
          } else {
            available.evening.push({
              hours: targetHours,
              minutes: targetMinutes,
            });
          }
        }
      });

    return {
      morning: daySchedule.morning.map(
        (slice: { hours: number; minutes: number }) => ({
          ...slice,
          available: !available.morning.some(
            (availableSlice) =>
              availableSlice.hours === slice.hours &&
              availableSlice.minutes === slice.minutes,
          ),
        }),
      ),
      afternoon: daySchedule.afternoon.map(
        (slice: { hours: number; minutes: number }) => ({
          ...slice,
          available: !available.afternoon.some(
            (availableSlice) =>
              availableSlice.hours === slice.hours &&
              availableSlice.minutes === slice.minutes,
          ),
        }),
      ),
      evening: daySchedule.evening.map(
        (slice: { hours: number; minutes: number }) => ({
          ...slice,
          available: !available.evening.some(
            (availableSlice) =>
              availableSlice.hours === slice.hours &&
              availableSlice.minutes === slice.minutes,
          ),
        }),
      ),
    };
  }

  private getDateRange(date: Date, interval: number) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + interval);

    return { start, end };
  }

  private readonly morning = [
    { hours: 9, minutes: 0 },
    { hours: 9, minutes: 30 },
    { hours: 10, minutes: 0 },
    { hours: 10, minutes: 30 },
    { hours: 11, minutes: 0 },
    { hours: 11, minutes: 30 },
  ];
  private readonly afternoon = [
    { hours: 12, minutes: 0 },
    { hours: 12, minutes: 30 },
    { hours: 13, minutes: 0 },
    { hours: 13, minutes: 30 },
    { hours: 14, minutes: 0 },
    { hours: 14, minutes: 30 },
    { hours: 15, minutes: 0 },
    { hours: 15, minutes: 30 },
  ];
  private readonly saturday_afternoon = [
    { hours: 12, minutes: 0 },
    { hours: 12, minutes: 30 },
    { hours: 13, minutes: 0 },
    { hours: 13, minutes: 30 },
  ];
  private readonly evening = [
    { hours: 16, minutes: 0 },
    { hours: 16, minutes: 30 },
    { hours: 17, minutes: 0 },
    { hours: 17, minutes: 30 },
  ];

  private readonly SCHEDULE_OF_THE_WEEK = {
    monday: {
      morning: this.morning,
      afternoon: this.afternoon,
      evening: this.evening,
    },
    tuesday: {
      morning: this.morning,
      afternoon: this.afternoon,
      evening: this.evening,
    },
    wednesday: {
      morning: this.morning,
      afternoon: this.afternoon,
      evening: this.evening,
    },
    thursday: {
      morning: this.morning,
      afternoon: this.afternoon,
      evening: this.evening,
    },
    friday: {
      morning: this.morning,
      afternoon: this.afternoon,
      evening: this.evening,
    },
    saturday: {
      morning: this.morning,
      afternoon: this.saturday_afternoon,
      evening: [],
    },
  };

  private readonly DAYS_OF_THE_WEEK = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
}
