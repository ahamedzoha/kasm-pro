import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";

export interface ErrorResponse {
  success: boolean;
  error: {
    message: string;
    code: string;
    statusCode: number;
    timestamp: string;
    path: string;
    details?: any;
  };
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    let code = "INTERNAL_ERROR";
    let details: any;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "string") {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === "object") {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || responseObj.error || message;
        code = responseObj.code || this.getErrorCode(status);
        details = responseObj.details;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      code = "APPLICATION_ERROR";
    }

    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        message,
        code,
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        ...(details && { details }),
      },
    };

    this.logger.error(
      `HTTP Exception: ${status} ${message} - ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : exception
    );

    response.status(status).json(errorResponse);
  }

  private getErrorCode(status: number): string {
    const statusCodeMap: Record<number, string> = {
      400: "BAD_REQUEST",
      401: "UNAUTHORIZED",
      403: "FORBIDDEN",
      404: "NOT_FOUND",
      409: "CONFLICT",
      422: "VALIDATION_ERROR",
      429: "RATE_LIMITED",
      500: "INTERNAL_ERROR",
      502: "BAD_GATEWAY",
      503: "SERVICE_UNAVAILABLE",
      504: "GATEWAY_TIMEOUT",
    };

    return statusCodeMap[status] || "UNKNOWN_ERROR";
  }
}
