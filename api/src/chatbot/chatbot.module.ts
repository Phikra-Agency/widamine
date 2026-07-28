import { Module } from '@nestjs/common'
import { ChatbotService } from './chatbot.service'
import { ChatbotController } from './chatbot.controller'
import { PrismaModule } from '@/prisma/prisma.module'
import { ClinicInfoModule } from '@/clinic-info/clinic-info.module'

@Module({
  imports: [PrismaModule, ClinicInfoModule],
  controllers: [ChatbotController],
  providers: [ChatbotService],
})
export class ChatbotModule {}
