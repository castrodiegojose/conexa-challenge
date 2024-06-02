import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SignInRequestBody {
  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}
