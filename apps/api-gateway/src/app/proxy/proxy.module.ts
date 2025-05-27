import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { PassportModule } from "@nestjs/passport";
import { ProxyController } from "./proxy.controller";
import { ProxyService } from "./proxy.service";
import { RouteConfigService } from "./route-config.service";
import { CircuitBreakerService } from "./circuit-breaker.service";
import { DynamicAuthGuard } from "../auth/guards/dynamic-auth.guard";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [HttpModule, AuthModule, PassportModule],
  controllers: [ProxyController],
  providers: [
    ProxyService,
    RouteConfigService,
    CircuitBreakerService,
    DynamicAuthGuard,
  ],
  exports: [ProxyService],
})
export class ProxyModule {}
