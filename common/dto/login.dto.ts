import { IsEmail, IsString, MinLength } from 'class-validator';
import { UserDto } from './user.dto';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}
