import { Controller, Get, Query } from '@nestjs/common'
import { ClinicInfoService } from './clinic-info.service'

@Controller('clinic-info')
export class ClinicInfoController {
  constructor(private readonly clinicInfoService: ClinicInfoService) {}

  @Get('appointments/stats')
  async getAppointmentStats(@Query('period') period?: string) {
    return this.clinicInfoService.getAppointmentStats(period)
  }

  @Get('services/available')
  async getAvailableServices() {
    return this.clinicInfoService.getAvailableServices()
  }

  @Get('services/by-practitioner')
  async getServicesByPractitioner() {
    return this.clinicInfoService.getServicesByPractitioner()
  }

  @Get('practitioners/availability')
  async getPractitionersAvailability() {
    return this.clinicInfoService.getPractitionersAvailability()
  }

  @Get('business-hours')
  async getBusinessHours() {
    return this.clinicInfoService.getBusinessHours()
  }
}
