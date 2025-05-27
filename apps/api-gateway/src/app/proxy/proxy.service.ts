import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
  Inject,
} from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { AxiosResponse } from "axios";
import { firstValueFrom } from "rxjs";
import { RouteConfigService, ServiceEndpoint } from "./route-config.service";
import { CircuitBreakerService } from "./circuit-breaker.service";

export interface ProxyRequest {
  method: string;
  path: string;
  headers: Record<string, string>;
  body?: any;
  query?: Record<string, string>;
}

export interface ProxyResponse {
  statusCode: number;
  data: any;
  headers: Record<string, string>;
}

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly routeConfigService: RouteConfigService,
    private readonly circuitBreakerService: CircuitBreakerService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async forwardRequest(request: ProxyRequest): Promise<ProxyResponse> {
    const { method, path, headers, body, query } = request;

    // Find matching route configuration
    const routeConfig = this.routeConfigService.findRoute(path, method);
    if (!routeConfig) {
      throw new HttpException(
        `Route not found: ${method} ${path}`,
        HttpStatus.NOT_FOUND
      );
    }

    // Get service endpoint
    const serviceEndpoint = this.routeConfigService.getServiceEndpoint(
      routeConfig.service
    );
    if (!serviceEndpoint) {
      throw new HttpException(
        `Service not configured: ${routeConfig.service}`,
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    // Check cache for GET requests
    if (method.toLowerCase() === "get") {
      const cachedResponse = await this.getCachedResponse(path, query);
      if (cachedResponse) {
        this.logger.debug(`💾 Cache hit for ${method} ${path}`);
        return cachedResponse;
      }
    }

    // Build target URL
    const targetUrl = this.buildTargetUrl(serviceEndpoint, path, query);

    this.logger.log(`🔄 Proxying ${method} ${path} -> ${targetUrl}`);

    // Execute request with circuit breaker
    try {
      const response =
        await this.circuitBreakerService.executeWithCircuitBreaker(
          routeConfig.service,
          () => this.makeHttpRequest(method, targetUrl, headers, body)
        );

      const proxyResponse: ProxyResponse = {
        statusCode: response.status,
        data: response.data,
        headers: this.sanitizeHeaders(response.headers),
      };

      // Cache successful GET responses
      if (method.toLowerCase() === "get" && response.status === 200) {
        await this.cacheResponse(path, query, proxyResponse);
      }

      return proxyResponse;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`❌ Proxy request failed: ${errorMessage}`);

      if (errorMessage.includes("Circuit breaker is OPEN")) {
        throw new HttpException(
          "Service temporarily unavailable",
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }

      // Handle different types of errors
      if (error && typeof error === "object" && "response" in error) {
        // Axios error with response
        const axiosError = error as any;
        throw new HttpException(
          axiosError.response?.data || "Downstream service error",
          axiosError.response?.status || HttpStatus.BAD_GATEWAY
        );
      } else if (error && typeof error === "object" && "code" in error) {
        const codeError = error as any;
        if (
          codeError.code === "ECONNREFUSED" ||
          codeError.code === "ENOTFOUND"
        ) {
          throw new HttpException(
            "Service unavailable",
            HttpStatus.SERVICE_UNAVAILABLE
          );
        }
      }

      throw new HttpException(
        "Internal server error",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async makeHttpRequest(
    method: string,
    url: string,
    headers: Record<string, string>,
    body?: any
  ): Promise<AxiosResponse> {
    const requestConfig = {
      method: method.toLowerCase(),
      url,
      headers: this.sanitizeRequestHeaders(headers),
      data: body,
      timeout: 10000, // 10 second timeout
      validateStatus: () => true, // Accept all status codes
    };

    return await firstValueFrom(this.httpService.request(requestConfig));
  }

  private buildTargetUrl(
    serviceEndpoint: ServiceEndpoint,
    targetPath: string,
    query?: Record<string, string>,
    originalPath?: string,
    routePath?: string
  ): string {
    let finalPath = targetPath;

    // Handle parameter substitution if originalPath and routePath are provided
    if (originalPath && routePath) {
      finalPath = this.substitutePathParameters(
        targetPath,
        originalPath,
        routePath
      );
    }

    let targetUrl = `${serviceEndpoint.baseUrl}${finalPath}`;

    if (query && Object.keys(query).length > 0) {
      const queryString = new URLSearchParams(query).toString();
      targetUrl += `?${queryString}`;
    }

    return targetUrl;
  }

  private substitutePathParameters(
    targetPath: string,
    originalPath: string,
    routePath: string
  ): string {
    // Handle wildcard routes
    if (routePath.includes("*")) {
      // Extract the base path and wildcard part
      const routeBase = routePath.replace("/*", "");
      const targetBase = targetPath.replace("/*", "");

      if (originalPath.startsWith(routeBase)) {
        const wildcardPart = originalPath.substring(routeBase.length);
        return targetBase + wildcardPart;
      }
    }

    // Extract parameters from the original path using the route pattern
    const routeParts = routePath.split("/");
    const originalParts = originalPath.split("/");

    const params: Record<string, string> = {};

    // Build parameter map
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(":")) {
        const paramName = routeParts[i].substring(1);
        if (originalParts[i]) {
          params[paramName] = originalParts[i];
        }
      }
    }

    // Substitute parameters in target path
    let result = targetPath;
    Object.entries(params).forEach(([key, value]) => {
      result = result.replace(`:${key}`, value);
    });

    return result;
  }

  private sanitizeRequestHeaders(
    headers: Record<string, string>
  ): Record<string, string> {
    const sanitized = { ...headers };

    // Remove headers that shouldn't be forwarded
    delete sanitized.host;
    delete sanitized["content-length"];
    delete sanitized.connection;

    return sanitized;
  }

  private sanitizeHeaders(headers: any): Record<string, string> {
    const sanitized: Record<string, string> = {};

    // Only forward safe headers
    const allowedHeaders = [
      "content-type",
      "cache-control",
      "expires",
      "last-modified",
      "etag",
    ];

    Object.keys(headers).forEach((key) => {
      if (allowedHeaders.includes(key.toLowerCase())) {
        sanitized[key] = headers[key];
      }
    });

    return sanitized;
  }

  private async getCachedResponse(
    path: string,
    query?: Record<string, string>
  ): Promise<ProxyResponse | null> {
    try {
      const cacheKey = this.generateCacheKey(path, query);
      return await this.cacheManager.get<ProxyResponse>(cacheKey);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown cache error";
      this.logger.warn(`Cache get error: ${errorMessage}`);
      return null;
    }
  }

  private async cacheResponse(
    path: string,
    query: Record<string, string> | undefined,
    response: ProxyResponse
  ): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(path, query);
      await this.cacheManager.set(cacheKey, response, 300); // 5 minute TTL
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown cache error";
      this.logger.warn(`Cache set error: ${errorMessage}`);
    }
  }

  private generateCacheKey(
    path: string,
    query?: Record<string, string>
  ): string {
    let key = `proxy:${path}`;
    if (query && Object.keys(query).length > 0) {
      const sortedQuery = Object.keys(query)
        .sort()
        .reduce((acc, k) => {
          acc[k] = query[k];
          return acc;
        }, {} as Record<string, string>);
      key += `:${JSON.stringify(sortedQuery)}`;
    }
    return key;
  }

  async getServiceHealth(): Promise<Record<string, any>> {
    const services = this.routeConfigService.getAllServices();
    const healthChecks: Record<string, any> = {};

    for (const service of services) {
      try {
        const healthUrl = `${service.baseUrl}${service.healthPath}`;
        const response = await firstValueFrom(
          this.httpService.get(healthUrl, { timeout: 3000 })
        );

        healthChecks[service.name] = {
          status: "healthy",
          responseTime: response.headers["x-response-time"] || "unknown",
          circuit: this.circuitBreakerService.getCircuitStatus(service.name),
          data: response.data,
        };
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown health check error";
        healthChecks[service.name] = {
          status: "unhealthy",
          error: errorMessage,
          circuit: this.circuitBreakerService.getCircuitStatus(service.name),
        };
      }
    }

    return healthChecks;
  }
}
