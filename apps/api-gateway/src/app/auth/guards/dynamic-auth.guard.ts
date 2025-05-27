import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { RouteConfigService } from "../../proxy/route-config.service";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class DynamicAuthGuard extends AuthGuard("jwt") {
  private readonly logger = new Logger(DynamicAuthGuard.name);

  constructor(
    private reflector: Reflector,
    private routeConfigService: RouteConfigService
  ) {
    super();
  }

  override canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    // Check if the route is explicitly marked as public via decorator
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.debug(
        `🔓 Route marked as public: ${request.method} ${request.path}`
      );
      return true;
    }

    // Check route configuration to see if auth is required
    const routeConfig = this.routeConfigService.findRoute(
      request.path,
      request.method
    );

    if (routeConfig && !routeConfig.requiresAuth) {
      this.logger.debug(
        `🔓 Route configured as public: ${request.method} ${request.path}`
      );
      return true;
    }

    // If no route config found, default to requiring auth
    if (!routeConfig) {
      this.logger.warn(
        `⚠️ No route config found for ${request.method} ${request.path}, requiring auth by default`
      );
    }

    this.logger.debug(
      `🔒 Authentication required for: ${request.method} ${request.path}`
    );
    return super.canActivate(context);
  }

  override handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext
  ) {
    const request = context.switchToHttp().getRequest();

    if (err || !user) {
      this.logger.warn(
        `🔒 Authentication failed for ${request.method} ${request.url}: ${
          info?.message || err?.message || "Unknown error"
        }`
      );
      throw err || new UnauthorizedException("Invalid token");
    }

    this.logger.debug(`🔓 Authentication successful for user: ${user.email}`);
    return user;
  }
}
