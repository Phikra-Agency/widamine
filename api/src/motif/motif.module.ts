import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { MotifService } from "./motif.service";
import { MotifController } from "./motif.controller";
import { PublicMotifController } from "./public-motif.controller";

@Module({
  imports: [PrismaModule],
  controllers: [MotifController, PublicMotifController],
  providers: [MotifService],
})
export class MotifModule {}
