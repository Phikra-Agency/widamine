import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from "@nestjs/common";
import { SessionService } from "./session.service";
import { CreateSessionDto, UpdateSessionDto } from "./dto/create-session.dto";
import { RoleGuard } from "@/auth/role.guard";
import { AuthGuard } from "@/auth/auth.guard";

@UseGuards(AuthGuard, RoleGuard("ADMIN"))
@Controller("sessions")
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  create(@Body() createSessionDto: CreateSessionDto) {
    return this.sessionService.create(createSessionDto);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() updateSessionDto: UpdateSessionDto) {
    return this.sessionService.update(id, updateSessionDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.sessionService.remove(id);
  }
}
