import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { DataSource } from "typeorm";
import Redis from "ioredis";

export interface HealthStatus {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  uptime: number;
  version: string;
  service: string;
  dependencies: Record<string, any>;
}

@Injectable()
export class HealthService {
  private readonly startTime = Date.now();
  private redis: Redis;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService
  ) {
    // Initialize Redis connection
    const redisUrl = this.configService.get(
      "REDIS_URL",
      "redis://localhost:6379"
    );
    this.redis = new Redis(redisUrl);
  }

  async getHealthStatus(): Promise<HealthStatus> {
    const uptime = Date.now() - this.startTime;
    const [dbHealth, redisHealth] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
    ]);

    // Determine overall status
    let status: "healthy" | "unhealthy" | "degraded" = "healthy";
    if (dbHealth.status === "unhealthy" || redisHealth.status === "unhealthy") {
      status = "unhealthy";
    } else if (
      dbHealth.status === "degraded" ||
      redisHealth.status === "degraded"
    ) {
      status = "degraded";
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime,
      version: "1.0.0",
      service: "progress-service",
      dependencies: {
        database: dbHealth,
        redis: redisHealth,
        memory: this.getMemoryUsage(),
        nodejs: process.version,
      },
    };
  }

  private async checkDatabase(): Promise<any> {
    try {
      const startTime = Date.now();

      // Check if database is connected
      if (!this.dataSource.isInitialized) {
        return {
          status: "unhealthy",
          error: "Database not initialized",
          responseTime: "N/A",
        };
      }

      // Simple query to test connection
      await this.dataSource.query("SELECT 1");
      const responseTime = Date.now() - startTime;

      return {
        status: responseTime < 100 ? "healthy" : "degraded",
        responseTime: `${responseTime}ms`,
        type: "postgresql",
        connected: true,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown database error";
      return {
        status: "unhealthy",
        error: errorMessage,
        type: "postgresql",
        connected: false,
      };
    }
  }

  private async checkRedis(): Promise<any> {
    try {
      const startTime = Date.now();

      // Test Redis connection with ping
      const result = await this.redis.ping();
      const responseTime = Date.now() - startTime;

      if (result !== "PONG") {
        return {
          status: "unhealthy",
          error: "Redis ping failed",
          responseTime: `${responseTime}ms`,
        };
      }

      return {
        status: responseTime < 50 ? "healthy" : "degraded",
        responseTime: `${responseTime}ms`,
        type: "redis",
        connected: true,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown Redis error";
      return {
        status: "unhealthy",
        error: errorMessage,
        type: "redis",
        connected: false,
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

  async onModuleDestroy() {
    // Clean up Redis connection
    if (this.redis) {
      await this.redis.disconnect();
    }
  }
}
