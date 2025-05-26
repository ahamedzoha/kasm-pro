import { Controller, Get } from "@nestjs/common";
import { HealthService } from "./health.service";

@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async getHealth() {
    return await this.healthService.getHealthStatus();
  }

  @Get("ready")
  async getReadiness() {
    return {
      status: "ready",
      timestamp: new Date().toISOString(),
      service: "auth-service",
    };
  }

  @Get("live")
  async getLiveness() {
    return {
      status: "alive",
      timestamp: new Date().toISOString(),
      service: "auth-service",
    };
  }
}
