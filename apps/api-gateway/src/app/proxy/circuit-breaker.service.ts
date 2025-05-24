import { Injectable, Logger } from "@nestjs/common";

enum CircuitState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

interface CircuitConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

interface CircuitStatus {
  state: CircuitState;
  failureCount: number;
  lastFailureTime: number;
  nextAttemptTime: number;
}

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private readonly circuits: Map<string, CircuitStatus> = new Map();
  private readonly config: CircuitConfig = {
    failureThreshold: 5, // Open circuit after 5 failures
    resetTimeout: 60000, // Try to reset after 1 minute
    monitoringPeriod: 300000, // 5 minute monitoring window
  };

  async executeWithCircuitBreaker<T>(
    serviceName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const circuit = this.getOrCreateCircuit(serviceName);

    if (this.shouldRejectRequest(circuit)) {
      throw new Error(`Circuit breaker is OPEN for service: ${serviceName}`);
    }

    try {
      const result = await operation();
      this.onSuccess(serviceName);
      return result;
    } catch (error) {
      this.onFailure(serviceName);
      throw error;
    }
  }

  private getOrCreateCircuit(serviceName: string): CircuitStatus {
    if (!this.circuits.has(serviceName)) {
      this.circuits.set(serviceName, {
        state: CircuitState.CLOSED,
        failureCount: 0,
        lastFailureTime: 0,
        nextAttemptTime: 0,
      });
    }
    return this.circuits.get(serviceName)!;
  }

  private shouldRejectRequest(circuit: CircuitStatus): boolean {
    const now = Date.now();

    switch (circuit.state) {
      case CircuitState.CLOSED:
        return false;

      case CircuitState.OPEN:
        if (now >= circuit.nextAttemptTime) {
          // Transition to HALF_OPEN
          circuit.state = CircuitState.HALF_OPEN;
          this.logger.log(`🔄 Circuit breaker transitioning to HALF_OPEN`);
          return false;
        }
        return true;

      case CircuitState.HALF_OPEN:
        return false;

      default:
        return false;
    }
  }

  private onSuccess(serviceName: string): void {
    const circuit = this.circuits.get(serviceName);
    if (!circuit) return;

    if (circuit.state === CircuitState.HALF_OPEN) {
      // Reset circuit on successful call in HALF_OPEN state
      circuit.state = CircuitState.CLOSED;
      circuit.failureCount = 0;
      this.logger.log(`✅ Circuit breaker CLOSED for service: ${serviceName}`);
    }
  }

  private onFailure(serviceName: string): void {
    const circuit = this.circuits.get(serviceName);
    if (!circuit) return;

    const now = Date.now();
    circuit.failureCount++;
    circuit.lastFailureTime = now;

    this.logger.warn(
      `❌ Failure recorded for service: ${serviceName} (${circuit.failureCount}/${this.config.failureThreshold})`
    );

    if (circuit.failureCount >= this.config.failureThreshold) {
      circuit.state = CircuitState.OPEN;
      circuit.nextAttemptTime = now + this.config.resetTimeout;

      this.logger.error(
        `🔴 Circuit breaker OPEN for service: ${serviceName}. Next attempt at: ${new Date(
          circuit.nextAttemptTime
        ).toISOString()}`
      );
    }
  }

  getCircuitStatus(serviceName: string): CircuitStatus | null {
    return this.circuits.get(serviceName) || null;
  }

  getAllCircuitStatuses(): Map<string, CircuitStatus> {
    return new Map(this.circuits);
  }

  resetCircuit(serviceName: string): void {
    const circuit = this.circuits.get(serviceName);
    if (circuit) {
      circuit.state = CircuitState.CLOSED;
      circuit.failureCount = 0;
      circuit.lastFailureTime = 0;
      circuit.nextAttemptTime = 0;
      this.logger.log(
        `🔄 Circuit breaker manually reset for service: ${serviceName}`
      );
    }
  }
}
