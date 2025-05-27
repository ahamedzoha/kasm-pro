import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { PassportModule } from "@nestjs/passport";
import { ProxyController } from "./proxy.controller";
import { ProxyService } from "./proxy.service";
import { RouteConfigService } from "./route-config.service";
import { CircuitBreakerService } from "./circuit-breaker.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [HttpModule, AuthModule, PassportModule],
  controllers: [ProxyController],
  providers: [ProxyService, RouteConfigService, CircuitBreakerService],
  exports: [ProxyService, RouteConfigService],
})
export class ProxyModule {}
