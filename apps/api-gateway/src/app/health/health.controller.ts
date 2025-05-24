import { Controller, Get } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { HealthService } from "./health.service";

@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  async getHealth() {
    return await this.healthService.getHealthStatus();
  }

  @Get("ready")
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async getReadiness() {
    // Kubernetes readiness probe
    return {
      status: "ready",
      timestamp: new Date().toISOString(),
    };
  }

  @Get("live")
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async getLiveness() {
    // Kubernetes liveness probe
    return {
      status: "alive",
      timestamp: new Date().toISOString(),
    };
  }
}
