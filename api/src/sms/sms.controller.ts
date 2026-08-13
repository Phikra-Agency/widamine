import { Controller, Post, Body, Get, UseGuards } from "@nestjs/common";
import { SmsService } from "./sms.service";
import { WhatsAppService } from "./whatsapp.service";
import { AuthGuard } from "@/auth/auth.guard";
import { RoleGuard } from "@/auth/role.guard";

@Controller("sms")
@UseGuards(AuthGuard)
export class SmsController {
  constructor(
    private readonly smsService: SmsService,
    private readonly whatsappService: WhatsAppService,
  ) {}

  @Post("whatsapp/send")
  @UseGuards(RoleGuard("ADMIN"))
  async sendWhatsApp(@Body() body: { phone: string; message: string }) {
    return await this.smsService.sendWhatsApp(body.phone, body.message);
  }

  @Get("whatsapp/status")
  @UseGuards(RoleGuard("ADMIN"))
  async getWhatsAppStatus() {
    const isReady = await this.whatsappService.isReady();
    const connectedNumber = await this.whatsappService.getConnectedNumber();
    
    return {
      status: isReady ? "connected" : "disconnected",
      connectedNumber,
      ready: isReady,
    };
  }

  @Post("whatsapp/test")
  @UseGuards(RoleGuard("ADMIN"))
  async testWhatsApp(@Body() body: { phone: string }) {
    const message = "Hey! This is a test message from Widamine 👋";
    return await this.smsService.sendWhatsApp(body.phone, message);
  }
}
