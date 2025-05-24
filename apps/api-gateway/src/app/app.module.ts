import { Module } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { HttpModule } from "@nestjs/axios";
import { JwtModule } from "@nestjs/jwt";
import { CacheModule } from "@nestjs/cache-manager";
import { ConfigModule } from "@nestjs/config";
import * as redisStore from "cache-manager-redis-store";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ProxyModule } from "./proxy/proxy.module";
import { AuthModule } from "./auth/auth.module";
import { HealthModule } from "./health/health.module";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        name: "short",
        ttl: 1000, // 1 second
        limit: 3,
      },
      {
        name: "medium",
        ttl: 10000, // 10 seconds
        limit: 20,
      },
      {
        name: "long",
        ttl: 60000, // 1 minute
        limit: 100,
      },
    ]),

    // HTTP Client for proxy requests
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),

    // JWT Authentication
    JwtModule.register({
      secret: process.env.JWT_SECRET || "your-jwt-secret",
      signOptions: { expiresIn: "1h" },
    }),

    // Redis Caching
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || 6379,
      ttl: 300, // 5 minutes default
    }),

    // Custom modules
    ProxyModule,
    AuthModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
