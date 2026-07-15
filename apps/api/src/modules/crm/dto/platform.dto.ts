import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
} from "class-validator";

export class PlatformLogsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}

export class ListAdminsQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(["createdAt", "email", "displayName", "login", "firstName"])
  orderBy?: "createdAt" | "email" | "displayName" | "login" | "firstName";

  @IsOptional()
  @IsIn(["asc", "desc"])
  orderDir?: "asc" | "desc";

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  login!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;
}

export class PatchAdminDto {
  @IsOptional()
  @IsString()
  login?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}

export class CreateSiteDto {
  @IsString()
  @IsNotEmpty()
  domain!: string;

  @IsOptional()
  @IsString()
  repo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  apiPort?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  webPort?: number;

  @IsOptional()
  @IsUrl({ require_tld: false })
  apiBaseUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  extraDomains?: string[];

  @IsOptional()
  @IsBoolean()
  provision?: boolean;
}

export class PatchSiteDto {
  @IsOptional()
  @IsString()
  repo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  apiPort?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  webPort?: number;

  @IsOptional()
  @IsUrl({ require_tld: false })
  apiBaseUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  extraDomains?: string[];
}
