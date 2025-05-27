import { Module } from "@nestjs/common";
import { AuthController, UserController } from "./auth.controller";

@Module({
  controllers: [AuthController, UserController],
  providers: [],
  exports: [],
})
export class AuthModule {}
