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
  ParseBoolPipe,
} from "@nestjs/common";
import { ContactService } from "./contact.service";
import { CreateContactDto } from "./dto/create-contact.dto";
import { AuthGuard } from "@/auth/auth.guard";
import { RoleGuard } from "@/auth/role.guard";
import { AppointmentNotificationService } from "@/appointment/appointment-notification.service";

@Controller("contacts")
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    private readonly notificationService: AppointmentNotificationService,
  ) {}

  @Post()
  async create(@Body() createContactDto: CreateContactDto) {
    const contact = await this.contactService.create(createContactDto);
    
    // Notify staff about new contact form submission
    this.notificationService.notifyContactFormSubmission(contact.id).catch((err) =>
      console.error("Failed to notify contact submission:", err.message),
    );
    
    return contact;
  }

  @UseGuards(AuthGuard, RoleGuard("ADMIN", "RECEPTIONIST", "DOCTOR", "PRACTITIONER"))
  @Get("unread-count")
  countUnread() {
    return this.contactService.countUnread();
  }

  @UseGuards(AuthGuard, RoleGuard("ADMIN", "RECEPTIONIST", "DOCTOR", "PRACTITIONER"))
  @Get()
  findAll(@Query("read", new ParseBoolPipe({ optional: true })) read?: boolean) {
    return this.contactService.findAll(read);
  }

  @UseGuards(AuthGuard, RoleGuard("ADMIN", "RECEPTIONIST", "DOCTOR", "PRACTITIONER"))
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.contactService.findOne(id);
  }

  @UseGuards(AuthGuard, RoleGuard("ADMIN", "RECEPTIONIST", "DOCTOR", "PRACTITIONER"))
  @Put(":id/read")
  read(@Param("id") id: string) {
    return this.contactService.read(id);
  }

  @UseGuards(AuthGuard, RoleGuard("ADMIN", "RECEPTIONIST", "DOCTOR", "PRACTITIONER"))
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.contactService.remove(id);
  }
}
