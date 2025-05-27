import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export interface RouteConfig {
  service: string;
  baseUrl: string;
  path: string;
  methods: string[];
  requiresAuth: boolean;
  rateLimit?: {
    ttl: number;
    limit: number;
  };
}

export interface ServiceEndpoint {
  name: string;
  baseUrl: string;
  healthPath: string;
}

@Injectable()
export class RouteConfigService {
  private readonly logger = new Logger(RouteConfigService.name);
  private readonly routes: Map<string, RouteConfig> = new Map();
  private readonly services: Map<string, ServiceEndpoint> = new Map();

  constructor(private readonly configService: ConfigService) {
    this.initializeRoutes();
    this.initializeServices();
  }

  private initializeServices() {
    const services: ServiceEndpoint[] = [
      {
        name: "auth",
        baseUrl: this.configService.get(
          "AUTH_SERVICE_URL",
          "http://auth-service:3000"
        ),
        healthPath: "/api/health",
      },
      {
        name: "environment-service",
        baseUrl: this.configService.get(
          "ENVIRONMENT_SERVICE_URL",
          "http://environment-service:3001"
        ),
        healthPath: "/api/health",
      },
      {
        name: "challenge-service",
        baseUrl: this.configService.get(
          "CHALLENGE_SERVICE_URL",
          "http://challenge-service:3002"
        ),
        healthPath: "/api/health",
      },
      {
        name: "progress-service",
        baseUrl: this.configService.get(
          "PROGRESS_SERVICE_URL",
          "http://progress-service:3003"
        ),
        healthPath: "/api/health",
      },
      {
        name: "terminal-service",
        baseUrl: this.configService.get(
          "TERMINAL_SERVICE_URL",
          "http://terminal-service:3004"
        ),
        healthPath: "/api/health",
      },
    ];

    services.forEach((service) => {
      this.services.set(service.name, service);
    });

    this.logger.log(`🔧 Initialized ${services.length} service endpoints`);
  }

  private initializeRoutes() {
    // Define route mappings with version support
    const routeConfigs: RouteConfig[] = [
      // ======================
      // API VERSION 1 (Current)
      // ======================

      // Auth service routes - v1
      {
        service: "auth",
        baseUrl: "",
        path: "/api/v1/user/login",
        methods: ["POST"],
        requiresAuth: false,
      },
      {
        service: "auth",
        baseUrl: "",
        path: "/api/v1/user/register",
        methods: ["POST"],
        requiresAuth: false,
      },
      {
        service: "auth",
        baseUrl: "",
        path: "/api/v1/user",
        methods: ["GET", "PUT", "DELETE"],
        requiresAuth: true,
      },
      {
        service: "auth",
        baseUrl: "",
        path: "/api/v1/user/:id",
        methods: ["GET", "PUT", "DELETE"],
        requiresAuth: true,
      },
      {
        service: "auth",
        baseUrl: "",
        path: "/api/v1/auth/status",
        methods: ["GET"],
        requiresAuth: false,
      },

      // Environment service routes - v1
      {
        service: "environment-service",
        baseUrl: "",
        path: "/api/v1/environment",
        methods: ["POST", "GET", "PUT", "DELETE"],
        requiresAuth: true,
        rateLimit: { ttl: 60000, limit: 10 },
      },
      {
        service: "environment-service",
        baseUrl: "",
        path: "/api/v1/environments",
        methods: ["GET"],
        requiresAuth: true,
      },

      // Challenge service routes - v1
      {
        service: "challenge-service",
        baseUrl: "",
        path: "/api/v1/challenges",
        methods: ["GET", "POST"],
        requiresAuth: true,
      },
      {
        service: "challenge-service",
        baseUrl: "",
        path: "/api/v1/challenge/:id",
        methods: ["GET", "PUT"],
        requiresAuth: true,
      },

      // Progress service routes - v1
      {
        service: "progress-service",
        baseUrl: "",
        path: "/api/v1/progress",
        methods: ["GET", "POST", "PUT"],
        requiresAuth: true,
      },
      {
        service: "progress-service",
        baseUrl: "",
        path: "/api/v1/analytics",
        methods: ["GET"],
        requiresAuth: true,
      },

      // ======================
      // API VERSION 2 (Future)
      // ======================
      // When ready, add v2 routes that can:
      // - Point to new service versions
      // - Have different auth requirements
      // - Support new features

      // Example v2 routes (commented for now):
      // {
      //   service: "auth-v2", // Could be a new service or same service with v2 controllers
      //   baseUrl: "",
      //   path: "/api/v2/auth/login",
      //   methods: ["POST"],
      //   requiresAuth: false,
      // },
    ];

    routeConfigs.forEach((config) => {
      const key = `${config.path}`;
      this.routes.set(key, config);
    });

    this.logger.log(
      `📋 Initialized ${routeConfigs.length} route configurations`
    );
    this.logger.log(
      `🏷️ Supported API versions: v1 ${this.getSupportedVersions().join(", ")}`
    );
  }

  getSupportedVersions(): string[] {
    const versions = new Set<string>();
    for (const [path] of this.routes.entries()) {
      const versionMatch = path.match(/\/api\/(v\d+)\//);
      if (versionMatch) {
        versions.add(versionMatch[1]);
      }
    }
    return Array.from(versions).sort();
  }

  findRoute(path: string, method: string): RouteConfig | null {
    // Direct match first
    const directMatch = this.routes.get(path);
    if (directMatch && directMatch.methods.includes(method.toUpperCase())) {
      return directMatch;
    }

    // Pattern matching for dynamic routes
    for (const [routePath, config] of this.routes.entries()) {
      if (
        this.isPathMatch(path, routePath) &&
        config.methods.includes(method.toUpperCase())
      ) {
        return config;
      }
    }

    return null;
  }

  getServiceEndpoint(serviceName: string): ServiceEndpoint | null {
    return this.services.get(serviceName) || null;
  }

  getAllServices(): ServiceEndpoint[] {
    return Array.from(this.services.values());
  }

  private isPathMatch(requestPath: string, routePath: string): boolean {
    // Convert route pattern to regex
    // Handle dynamic segments like /api/v1/user/:id
    const regexPattern = routePath
      .replace(/:[^/]+/g, "[^/]+") // Replace :param with regex
      .replace(/\*/g, ".*"); // Replace * with regex

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(requestPath);
  }
}
