import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { ResourceService } from "./resource.service";
import { ResourceController } from "./resource.controller";

@Module({
  imports: [PrismaModule],
  controllers: [ResourceController],
  providers: [ResourceService],
})
export class ResourceModule {}
