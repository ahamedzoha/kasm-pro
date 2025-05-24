import { IsString, IsOptional, IsObject } from "class-validator";

export class ProxyRequestDto {
  @IsString()
  method!: string;

  @IsString()
  path!: string;

  @IsObject()
  @IsOptional()
  headers?: Record<string, string>;

  @IsOptional()
  body?: any;

  @IsObject()
  @IsOptional()
  query?: Record<string, string>;
}
