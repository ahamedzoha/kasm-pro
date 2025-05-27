import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from "@nestjs/common";

@Controller("api/v1/auth")
export class AuthController {
  @Get("status")
  getStatus() {
    return {
      service: "auth-service",
      status: "healthy",
      timestamp: new Date().toISOString(),
      message: "Auth service is running",
    };
  }

  @Get("test/:id")
  getTestWithId(@Param("id") id: string) {
    return {
      service: "auth-service",
      endpoint: "test-with-id",
      id,
      timestamp: new Date().toISOString(),
    };
  }

  @Get("*")
  handleWildcard() {
    return {
      service: "auth-service",
      endpoint: "wildcard",
      message: "Caught by wildcard route",
      timestamp: new Date().toISOString(),
    };
  }
}

@Controller("api/v1/user")
export class UserController {
  @Post("login")
  login(@Body() loginDto: any) {
    return {
      service: "auth-service",
      endpoint: "login",
      message: "Login endpoint reached",
      body: loginDto,
      timestamp: new Date().toISOString(),
    };
  }

  @Post("register")
  register(@Body() registerDto: any) {
    return {
      service: "auth-service",
      endpoint: "register",
      message: "Register endpoint reached",
      body: registerDto,
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  getUser() {
    return {
      service: "auth-service",
      endpoint: "get-user",
      message: "Get user endpoint reached",
      timestamp: new Date().toISOString(),
    };
  }

  @Get(":id")
  getUserById(@Param("id") id: string) {
    return {
      service: "auth-service",
      endpoint: "get-user-by-id",
      id,
      message: "Get user by ID endpoint reached",
      timestamp: new Date().toISOString(),
    };
  }

  @Put(":id")
  updateUser(@Param("id") id: string, @Body() updateDto: any) {
    return {
      service: "auth-service",
      endpoint: "update-user",
      id,
      body: updateDto,
      message: "Update user endpoint reached",
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(":id")
  deleteUser(@Param("id") id: string) {
    return {
      service: "auth-service",
      endpoint: "delete-user",
      id,
      message: "Delete user endpoint reached",
      timestamp: new Date().toISOString(),
    };
  }
}
