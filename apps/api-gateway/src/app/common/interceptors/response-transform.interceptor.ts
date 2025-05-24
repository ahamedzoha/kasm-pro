import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import type { Response } from "express";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  path: string;
  statusCode: number;
}

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data) => ({
        success: response.statusCode < 400,
        data,
        timestamp: new Date().toISOString(),
        path: request.url,
        statusCode: response.statusCode,
      }))
    );
  }
}
