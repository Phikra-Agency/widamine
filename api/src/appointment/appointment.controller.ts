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

  @Get("availability")
  getAvailability(
    @Query("serviceId") serviceId: string,
    @Query("date") date: string,
  ) {
    return this.appointmentService.getAvailability(serviceId, date);
  }

  @Post()
  async create(
    @Body()
    data: {
      name: string;
      email: string;
      phone: string;
      context?: string;
      serviceId: string;
      motifId?: string;
      practitionerId?: string;
      resourceId?: string;
      datetime?: string;
    },
  ) {
    const result = await this.appointmentService.create(data);

    // Send acknowledgment email to the patient
    this.notificationService.sendNewBookingAcknowledgment(result.id).catch((err) =>
      console.error("Failed to send booking acknowledgment:", err.message),
    );

    // Notify the assigned doctor about the new reservation
    if (result.practitionerId) {
      this.notificationService.notifyDoctorNewAppointment(result.id).catch((err) =>
        console.error("Failed to notify doctor:", err.message),
      );
    }

    return result;
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(@Req() req: { user: { id: string; role: string } }) {
    if (["DOCTOR", "PRACTITIONER"].includes(req.user.role)) {
      return this.appointmentService.findByPractitioner(req.user.id);
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
      if (!appointment || appointment.practitionerId !== req.user.id) {
        throw new ForbiddenException({
          message: "Not your appointment",
          code: "not_your_appointment",
        });
      }
      delete data.practitionerId;
      delete data.resourceId;
    }

    const result = await this.appointmentService.update(id, data);

    // Send email notifications on status changes
    if (data.status === "CONFIRMED") {
      this.notificationService.sendConfirmation(id).catch((err) =>
        console.error("Failed to send confirmation email:", err.message),
      );
      this.notificationService.notifyDoctorConfirmation(id).catch((err) =>
        console.error("Failed to notify doctor of confirmation:", err.message),
      );
    } else if (data.status === "CANCELLED") {
      // Notify both patient and doctor about cancellation
      this.notificationService.sendCancellation(id).catch((err) =>
        console.error("Failed to send cancellation email:", err.message),
      );
      this.notificationService.notifyDoctorCancellation(id).catch((err) =>
        console.error("Failed to notify doctor of cancellation:", err.message),
      );

      // Clean up patient if this was their only appointment
      this.patientService.deleteIfNoAppointments(result.patientId).catch((err) =>
        console.error("Failed to clean up patient:", err.message),
      );
    }

    return result;
  }

  @Delete(":id")
  @UseGuards(AuthGuard, RoleGuard("ADMIN"))
  remove(@Param("id") id: string) {
    return this.appointmentService.remove(id);
  }
}
