import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ProxyController } from "./proxy.controller";
import { ProxyService } from "./proxy.service";
import { RouteConfigService } from "./route-config.service";
import { CircuitBreakerService } from "./circuit-breaker.service";

@Module({
  imports: [HttpModule],
  controllers: [ProxyController],
  providers: [ProxyService, RouteConfigService, CircuitBreakerService],
  exports: [ProxyService],
})
export class ProxyModule {}
