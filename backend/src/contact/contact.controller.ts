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
} from "@nestjs/common";
import { ContactService } from "./contact.service";
import { CreateContactDto } from "./dto/create-contact.dto";
import { AuthGuard } from "@/auth/auth.guard";
import { RoleGuard } from "@/auth/role.guard";

@Controller("contacts")
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  create(@Body() createContactDto: CreateContactDto) {
    return this.contactService.create(createContactDto);
  }

  @UseGuards(AuthGuard, RoleGuard("ADMIN", "RECEPTIONIST"))
  @Get()
  findAll(@Query("read") read: boolean) {
    return this.contactService.findAll(read);
  }

  @UseGuards(AuthGuard, RoleGuard("ADMIN", "RECEPTIONIST"))
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.contactService.findOne(+id);
  }

  @UseGuards(AuthGuard, RoleGuard("ADMIN", "RECEPTIONIST"))
  @Put(":id/read")
  read(@Param("id") id: string) {
    return this.contactService.read(+id);
  }
}
