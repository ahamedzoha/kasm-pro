import {
  All,
  Controller,
  Req,
  Res,
  UseGuards,
  Logger,
  Get,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { Throttle } from "@nestjs/throttler";
import { ProxyService, ProxyRequest } from "./proxy.service";
import { RouteConfigService } from "./route-config.service";
import { JwtAuthGuard, IS_PUBLIC_KEY } from "../auth/guards/jwt-auth.guard";
import { Reflector } from "@nestjs/core";

@Controller()
export class ProxyController {
  private readonly logger = new Logger(ProxyController.name);

  constructor(
    private readonly proxyService: ProxyService,
    private readonly routeConfigService: RouteConfigService,
    private readonly reflector: Reflector
  ) {}

  @Get("health")
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  async getHealth() {
    return {
      status: "OK",
      timestamp: new Date().toISOString(),
      services: await this.proxyService.getServiceHealth(),
    };
  }

  @All("api/*")
  @UseGuards(JwtAuthGuard)
  async proxyApiRequest(@Req() req: Request, @Res() res: Response) {
    try {
      const startTime = Date.now();

      // Check if authentication is required for this route
      const routeConfig = this.routeConfigService.findRoute(
        req.path,
        req.method
      );
      const requiresAuth = routeConfig?.requiresAuth ?? true;

      // Set public key for routes that don't require auth
      if (!requiresAuth) {
        this.reflector.getAllAndOverride(IS_PUBLIC_KEY, []);
      }

      // Build proxy request
      const proxyRequest: ProxyRequest = {
        method: req.method,
        path: req.path,
        headers: req.headers as Record<string, string>,
        body: req.body,
        query: req.query as Record<string, string>,
      };

      // Forward request
      const proxyResponse = await this.proxyService.forwardRequest(
        proxyRequest
      );

      // Set response headers
      Object.entries(proxyResponse.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      // Add custom headers
      res.setHeader("X-Gateway-Response-Time", `${Date.now() - startTime}ms`);
      res.setHeader("X-Gateway-Version", "1.0.0");

      // Send response
      res.status(proxyResponse.statusCode).json(proxyResponse.data);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown proxy error";
      this.logger.error(`❌ Proxy controller error: ${errorMessage}`);

      // Handle error response
      if (error && typeof error === "object" && "getStatus" in error) {
        const httpError = error as any;
        res.status(httpError.getStatus()).json({
          error: httpError.message,
          statusCode: httpError.getStatus(),
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(500).json({
          error: "Internal server error",
          statusCode: 500,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  @All("terminal/*")
  async proxyTerminalRequest(@Req() req: Request, @Res() res: Response) {
    try {
      // Terminal service handles WebSocket connections differently
      // For now, we'll just forward HTTP requests to terminal service
      const proxyRequest: ProxyRequest = {
        method: req.method,
        path: req.path,
        headers: req.headers as Record<string, string>,
        body: req.body,
        query: req.query as Record<string, string>,
      };

      const proxyResponse = await this.proxyService.forwardRequest(
        proxyRequest
      );

      Object.entries(proxyResponse.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      res.status(proxyResponse.statusCode).json(proxyResponse.data);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown terminal proxy error";
      this.logger.error(`❌ Terminal proxy error: ${errorMessage}`);

      if (error && typeof error === "object" && "getStatus" in error) {
        const httpError = error as any;
        res.status(httpError.getStatus()).json({
          error: httpError.message,
          statusCode: httpError.getStatus(),
        });
      } else {
        res.status(500).json({
          error: "Internal server error",
          statusCode: 500,
        });
      }
    }
  }
}
