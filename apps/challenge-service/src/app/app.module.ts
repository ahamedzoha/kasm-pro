import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env.local",
    }),

    // Database
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get("MONGODB_URI"),
        retryAttempts: 3,
        retryDelay: 3000,
      }),
      inject: [ConfigService],
    }),

    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
