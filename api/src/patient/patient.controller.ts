import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
  Query,
  Req,
  ForbiddenException,
} from "@nestjs/common";
import { PatientService } from "./patient.service";
import { CreatePatientDto } from "./dto/create-patient.dto";
import { UpdatePatientDto } from "./dto/update-patient.dto";
import { AuthGuard } from "@/auth/auth.guard";
import { RoleGuard } from "@/auth/role.guard";

@UseGuards(AuthGuard)
@Controller("patients")
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  @UseGuards(RoleGuard("ADMIN", "RECEPTIONIST", "DOCTOR", "PRACTITIONER"))
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientService.create(createPatientDto);
  }

  @Get()
  findAll(@Req() req: { user: { id: string; role: string } }) {
    if (["DOCTOR", "PRACTITIONER"].includes(req.user.role)) {
      return this.patientService.findByPractitioner(req.user.id);
    }
    return this.patientService.findAll();
  }

  @Get("by-phone")
  findByPhone(@Query("phone") phone: string) {
    return this.patientService.findByPhone(phone);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.patientService.findOne(id);
  }

  @Put(":id")
  async update(
    @Req() req: { user: { id: string; role: string } },
    @Param("id") id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    if (["DOCTOR", "PRACTITIONER"].includes(req.user.role)) {
      const isOwn = await this.patientService.isPatientOfDoctor(id, req.user.id);
      if (!isOwn)
        throw new ForbiddenException({
          message: "Not your patient",
          code: "not_your_patient",
        });
      return this.patientService.updateMedicalHistory(id, updatePatientDto.medicalHistory);
    }
    return this.patientService.update(id, updatePatientDto);
  }

  @Delete(":id")
  @UseGuards(RoleGuard("ADMIN", "RECEPTIONIST"))
  remove(@Param("id") id: string) {
    return this.patientService.remove(id);
  }
}
