import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { AppointmentService } from "./appointment.service";
import { AppointmentNotificationService } from "./appointment-notification.service";
import { PatientService } from "@/patient/patient.service";
import { AuthGuard } from "@/auth/auth.guard";
import { RoleGuard } from "@/auth/role.guard";

@Controller("appointments")
export class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly notificationService: AppointmentNotificationService,
    private readonly patientService: PatientService,
  ) {}

  @Get("queue")
  @UseGuards(AuthGuard, RoleGuard("ADMIN", "RECEPTIONIST"))
  getVerificationQueue() {
    return this.appointmentService.findByStatus("PENDING");
  }

  @Put(":id/confirm")
  @UseGuards(AuthGuard, RoleGuard("ADMIN", "RECEPTIONIST"))
  async confirmAppointment(@Param("id") id: string) {
    const appt = await this.appointmentService.findOne(id);
    if (!appt) throw new NotFoundException("Appointment not found");
    if (appt.status !== "PENDING") {
      throw new ForbiddenException("Only PENDING appointments can be confirmed");
    }
    const result = await this.appointmentService.update(id, { status: "CONFIRMED" });
    this.notificationService.sendConfirmation(id).catch(() => {});
    this.notificationService.notifyDoctorConfirmation(id).catch(() => {});
    return result;
  }

  @Put(":id/reject")
  @UseGuards(AuthGuard, RoleGuard("ADMIN", "RECEPTIONIST"))
  async rejectAppointment(@Param("id") id: string) {
    const appt = await this.appointmentService.findOne(id);
    if (!appt) throw new NotFoundException("Appointment not found");
    if (appt.status !== "PENDING") {
      throw new ForbiddenException("Only PENDING appointments can be rejected");
    }
    const result = await this.appointmentService.update(id, { status: "REJECTED" });
    this.notificationService.sendCancellation(id).catch(() => {});
    this.patientService.deleteIfNoAppointments(result.patientId).catch(() => {});
    return result;
  }

  @Get("availability")
  getAvailability(
    @Query("motifId") motifId: string,
    @Query("date") date: string,
    @Query("practitionerId") practitionerId?: string,
  ) {
    return this.appointmentService.getAvailability(motifId, date, practitionerId);
  }

  @Post()
  async create(
    @Body()
    data: {
      name: string;
      email: string;
      phone: string;
      context?: string;
      motifId: string;
      practitionerId?: string;
      resourceId?: string;
      datetime?: string;
      sessionNumber?: number;
    },
  ) {
    const result = await this.appointmentService.create(data);

    this.notificationService.sendNewBookingAcknowledgment(result.id).catch((err) =>
      console.error("Failed to send booking acknowledgment:", err.message),
    );

    if (result.practitionerId) {
      this.notificationService.notifyDoctorNewAppointment(result.id).catch((err) =>
        console.error("Failed to notify doctor:", err.message),
      );
    }

    return result;
  }

  @Get("reservations-count")
  @UseGuards(AuthGuard)
  countReservations() {
    return this.appointmentService.countReservations();
  }

  @Get("count")
  @UseGuards(AuthGuard)
  countByDateRange(
    @Query("from") from: string,
    @Query("to") to: string,
  ) {
    return this.appointmentService.countByDateRange(from, to);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(@Req() req: { user: { id: string; role: string } }) {
    if (["DOCTOR", "PRACTITIONER"].includes(req.user.role)) {
      return this.appointmentService.findByPractitioner(String(req.user.id));
    }
    return this.appointmentService.findAll();
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  findOne(@Param("id") id: string) {
    return this.appointmentService.findOne(id);
  }

  @Put(":id")
  @UseGuards(AuthGuard)
  async update(
    @Req() req: { user: { id: string; role: string } },
    @Param("id") id: string,
    @Body() data: any,
  ) {
    if (["DOCTOR", "PRACTITIONER"].includes(req.user.role)) {
      const appointment = await this.appointmentService.findOne(id);
      if (!appointment || appointment.practitionerId !== String(req.user.id)) {
        throw new ForbiddenException({
          message: "Not your appointment",
          code: "not_your_appointment",
        });
      }
      delete data.practitionerId;
      delete data.resourceId;
    }

    const result = await this.appointmentService.update(id, data);

    if (data.status === "CONFIRMED") {
      this.notificationService.sendConfirmation(id).catch((err) =>
        console.error("Failed to send confirmation email:", err.message),
      );
      this.notificationService.notifyDoctorConfirmation(id).catch((err) =>
        console.error("Failed to notify doctor of confirmation:", err.message),
      );
    } else if (data.status === "CANCELLED") {
      this.notificationService.sendCancellation(id).catch((err) =>
        console.error("Failed to send cancellation email:", err.message),
      );
      this.notificationService.notifyDoctorCancellation(id).catch((err) =>
        console.error("Failed to notify doctor of cancellation:", err.message),
      );

      this.patientService.deleteIfNoAppointments(result.patientId).catch((err) =>
        console.error("Failed to clean up patient:", err.message),
      );
    }

    return result;
  }

  @Delete(":id")
  @UseGuards(AuthGuard, RoleGuard("ADMIN"))
  async remove(@Param("id") id: string) {
    const appt = await this.appointmentService.findOne(id);
    const result = await this.appointmentService.remove(id);
    if (appt) this.patientService.deleteIfNoAppointments(appt.patientId).catch(() => {});
    return result;
  }
}
