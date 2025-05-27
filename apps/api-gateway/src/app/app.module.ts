import { Module } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { HttpModule } from "@nestjs/axios";
import { JwtModule } from "@nestjs/jwt";
import { CacheModule, CacheInterceptor } from "@nestjs/cache-manager";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { createKeyv } from "@keyv/redis";
import { Keyv } from "keyv";
import { CacheableMemory } from "cacheable";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ProxyModule } from "./proxy/proxy.module";
import { AuthModule } from "./auth/auth.module";
import { HealthModule } from "./health/health.module";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { CacheService } from "./common/services/cache.service";

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
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisHost = configService.get("REDIS_HOST", "localhost");
        const redisPort = configService.get<number>("REDIS_PORT", 6379);

        return {
          stores: [
            // In-memory fallback store
            new Keyv({
              store: new CacheableMemory({ ttl: 300000, lruSize: 5000 }),
            }),
            // Redis primary store
            createKeyv(`redis://${redisHost}:${redisPort}`),
          ],
          ttl: 300000, // 5 minutes in milliseconds (cache-manager v5+ uses milliseconds)
        };
      },
      isGlobal: true,
    }),

    // Custom modules
    ProxyModule,
    AuthModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    CacheService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
