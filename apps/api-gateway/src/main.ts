/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app/app.module";
import helmet from "helmet";

const compression = require("compression");

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security middleware
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    })
  );

  // Compression middleware
  app.use(compression());

  // CORS configuration
  app.enableCors({
    origin: [
      "http://localhost:3000",
      "http://localhost:4200",
      "http://localhost:3001",
      process.env.FRONTEND_URL || "http://localhost:4200",
      process.env.MARKETING_URL || "http://localhost:3001",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  // No global prefix needed - we handle /api routes in controllers
  // const globalPrefix = "api";
  // app.setGlobalPrefix(globalPrefix);

  // Get port from environment
  const port = process.env.PORT || 9600; // Using port 9600 as specified by user

  await app.listen(port);

  Logger.log(`🚀 API Gateway is running on: http://localhost:${port}`);
  Logger.log(`🏥 Health check available at: http://localhost:${port}/health`);
  Logger.log(`📊 Ready for proxying requests to microservices`);
}

bootstrap();
