import { IsEmail, IsNotEmpty, IsString, Length, Matches } from "class-validator";

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  login!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class OtpRequestDto extends LoginDto {}

export class OtpVerifyDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  code!: string;
}
