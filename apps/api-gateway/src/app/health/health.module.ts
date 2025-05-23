import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { HealthController } from "./health.controller";
import { HealthService } from "./health.service";

@Module({
  imports: [HttpModule],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
