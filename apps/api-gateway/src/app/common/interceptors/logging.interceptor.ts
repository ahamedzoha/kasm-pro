import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { Request, Response } from "express";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, headers, body } = request;
    const userAgent = headers["user-agent"] || "";
    const ip = request.ip || request.connection.remoteAddress;

    const startTime = Date.now();

    // Log incoming request
    this.logger.log(
      `🔵 Incoming: ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`
    );

    // Log request body for POST/PUT/PATCH (excluding sensitive data)
    if (["POST", "PUT", "PATCH"].includes(method) && body) {
      const sanitizedBody = this.sanitizeRequestBody(body);
      this.logger.debug(`📦 Request Body: ${JSON.stringify(sanitizedBody)}`);
    }

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const { statusCode } = response;

        this.logger.log(
          `🟢 Outgoing: ${method} ${url} - Status: ${statusCode} - Duration: ${duration}ms`
        );
      })
    );
  }

  private sanitizeRequestBody(body: any): any {
    if (typeof body !== "object" || body === null) {
      return body;
    }

    const sensitiveFields = [
      "password",
      "token",
      "secret",
      "key",
      "authorization",
    ];
    const sanitized = { ...body };

    Object.keys(sanitized).forEach((key) => {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
        sanitized[key] = "[REDACTED]";
      }
    });

    return sanitized;
  }
}
