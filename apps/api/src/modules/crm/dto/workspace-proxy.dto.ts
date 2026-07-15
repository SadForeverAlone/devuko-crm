import { Type } from "class-transformer";
import {
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";

const LOGIN_RE = /^[a-zA-Z0-9._-]{3,32}$/;

export class CreateWorkspaceUserDto {
  @IsString()
  @Matches(LOGIN_RE)
  login!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @Length(1, 120)
  displayName!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  permissions?: number;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  adminNote?: string | null;

  @IsOptional()
  @IsString()
  @Length(0, 80)
  country?: string | null;

  @IsOptional()
  @IsString()
  @Length(0, 2048)
  avatarUrl?: string | null;
}

export class PatchWorkspaceUserDto {
  @IsOptional()
  @IsString()
  @Matches(LOGIN_RE)
  login?: string | null;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  displayName?: string;

  @IsOptional()
  @IsString()
  @Length(0, 2048)
  avatarUrl?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  permissions?: number;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  adminNote?: string | null;

  @IsOptional()
  @IsString()
  @Length(0, 80)
  country?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}

class WorkspaceSettingItemDto {
  @IsString()
  @Length(1, 128)
  key!: string;

  @IsString()
  @Length(0, 8192)
  value!: string;
}

export class PatchWorkspaceSettingsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkspaceSettingItemDto)
  items!: WorkspaceSettingItemDto[];

  @IsOptional()
  @IsString()
  @Length(1, 128)
  workspaceId?: string;
}
