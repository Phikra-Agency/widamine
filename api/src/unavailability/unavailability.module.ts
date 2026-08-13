import { Module } from "@nestjs/common";
import { UnavailabilityController } from "./unavailability.controller";
import { UnavailabilityService } from "./unavailability.service";

@Module({
  controllers: [UnavailabilityController],
  providers: [UnavailabilityService],
})
export class UnavailabilityModule {}
