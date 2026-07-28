import { Module } from '@nestjs/common'
import { ClinicInfoController } from './clinic-info.controller'
import { ClinicInfoService } from './clinic-info.service'
import { PrismaModule } from '@/prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [ClinicInfoController],
  providers: [ClinicInfoService],
  exports: [ClinicInfoService],
})
export class ClinicInfoModule {}
