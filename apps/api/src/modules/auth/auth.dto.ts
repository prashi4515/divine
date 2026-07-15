import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({ example: "admin@divine.local" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "DivineAdmin123!" })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: "admin@divine.local" })
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  token!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password!: string;
}

export class AuthUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  displayName!: string;

  @ApiProperty({ type: [String] })
  roles!: string[];

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional({ nullable: true })
  avatarUrl!: string | null;

  @ApiPropertyOptional({ nullable: true })
  preferredLanguage!: string | null;

  @ApiPropertyOptional({ nullable: true })
  timeZone!: string | null;

  @ApiPropertyOptional({ nullable: true })
  lastLoginAt!: string | null;
}

export class AuthSessionDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty({ description: "Access token expiry (ISO)" })
  expiresAt!: string;

  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;
}

export class AuthSessionResponseDto {
  @ApiProperty({ type: AuthSessionDto })
  data!: AuthSessionDto;
}

export class MeResponseDto {
  @ApiProperty({ type: AuthUserDto })
  data!: AuthUserDto;
}
