import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  override canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

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
