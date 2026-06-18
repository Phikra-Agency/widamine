import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { MailService } from "./mail.service";
import { AuthGuard } from "@/auth/auth.guard";
import { RoleGuard } from "@/auth/role.guard";

@UseGuards(AuthGuard, RoleGuard("ADMIN"))
@Controller("mail")
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post("test")
  async sendTestEmail(
    @Body() body: { to: string; subject: string; body: string },
  ) {
    const info = await this.mailService.sendMail(body.to, body.subject, body.body);
    return { success: true, messageId: info.messageId };
  }
}
