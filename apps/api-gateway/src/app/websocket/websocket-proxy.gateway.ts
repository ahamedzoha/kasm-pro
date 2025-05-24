import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { ConfigService } from "@nestjs/config";
import { io as ioClient, Socket as ClientSocket } from "socket.io-client";

@WebSocketGateway({
  cors: {
    origin: "*",
    credentials: true,
  },
  path: "/terminal/socket.io",
})
export class WebSocketProxyGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(WebSocketProxyGateway.name);
  private readonly terminalConnections = new Map<string, ClientSocket>();

  constructor(private readonly configService: ConfigService) {}

  async handleConnection(client: Socket): Promise<void> {
    this.logger.log(`Client connected: ${client.id}`);

    try {
      // Connect to terminal service
      const terminalServiceUrl = this.configService.get(
        "TERMINAL_SERVICE_URL",
        "http://terminal-service:3004"
      );

      const terminalClient = ioClient(terminalServiceUrl, {
        transports: ["websocket"],
      });

      // Store the connection
      this.terminalConnections.set(client.id, terminalClient);

      // Forward messages from terminal service to client
      terminalClient.onAny((event: string, ...args: any[]) => {
        client.emit(event, ...args);
      });

      // Handle terminal service connection events
      terminalClient.on("connect", () => {
        this.logger.log(
          `Connected to terminal service for client: ${client.id}`
        );
      });

      terminalClient.on("disconnect", () => {
        this.logger.log(
          `Disconnected from terminal service for client: ${client.id}`
        );
      });

      terminalClient.on("error", (error: unknown) => {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        this.logger.error(
          `Terminal service error for client ${client.id}:`,
          errorMessage
        );
        client.emit("error", { message: "Terminal service connection error" });
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error(
        `Failed to connect to terminal service for client ${client.id}:`,
        errorMessage
      );
      client.emit("error", {
        message: "Failed to connect to terminal service",
      });
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket): Promise<void> {
    this.logger.log(`Client disconnected: ${client.id}`);

    const terminalClient = this.terminalConnections.get(client.id);
    if (terminalClient) {
      terminalClient.disconnect();
      this.terminalConnections.delete(client.id);
    }
  }

  @SubscribeMessage("terminal:input")
  handleTerminalInput(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket
  ): void {
    const terminalClient = this.terminalConnections.get(client.id);
    if (terminalClient && terminalClient.connected) {
      terminalClient.emit("terminal:input", data);
    } else {
      client.emit("error", { message: "Terminal service not connected" });
    }
  }

  @SubscribeMessage("terminal:resize")
  handleTerminalResize(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket
  ): void {
    const terminalClient = this.terminalConnections.get(client.id);
    if (terminalClient && terminalClient.connected) {
      terminalClient.emit("terminal:resize", data);
    }
  }

  @SubscribeMessage("terminal:create")
  handleTerminalCreate(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket
  ): void {
    const terminalClient = this.terminalConnections.get(client.id);
    if (terminalClient && terminalClient.connected) {
      terminalClient.emit("terminal:create", data);
    }
  }
}
