import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface User {
  id: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly jwtService: JwtService) {}

  async validateToken(token: string): Promise<User | null> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);

      const user: User = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      this.logger.debug(`✅ Token validated for user: ${user.email}`);
      return user;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.warn(`❌ Token validation failed: ${errorMessage}`);
      return null;
    }
  }

  async validateUser(payload: JwtPayload): Promise<User | null> {
    // In a real application, you might want to check if the user still exists
    // and is active in your database
    const user: User = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    this.logger.debug(`🔍 User validated: ${user.email}`);
    return user;
  }

  extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(" ");
    return type === "Bearer" ? token : null;
  }
}
