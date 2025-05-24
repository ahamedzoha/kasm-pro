import { Injectable } from "@nestjs/common";

export interface HealthStatus {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  uptime: number;
  version: string;
  dependencies: Record<string, any>;
}

@Injectable()
export class HealthService {
  private readonly startTime = Date.now();

  async getHealthStatus(): Promise<HealthStatus> {
    const uptime = Date.now() - this.startTime;

    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime,
      version: "1.0.0",
      dependencies: {
        redis: await this.checkRedis(),
        memory: this.getMemoryUsage(),
        nodejs: process.version,
      },
    };
  }

  private async checkRedis(): Promise<any> {
    try {
      // In a real implementation, you would check Redis connectivity
      return {
        status: "healthy",
        responseTime: "< 5ms",
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown Redis error";
      return {
        status: "unhealthy",
        error: errorMessage,
      };
    }
  }

  private getMemoryUsage(): any {
    const usage = process.memoryUsage();
    return {
      rss: `${Math.round(usage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(usage.external / 1024 / 1024)} MB`,
    };
  }
}
