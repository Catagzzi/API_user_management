import {
  Controller,
  Get,
  Post,
  Body,
  Inject,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  CreateUserDto,
  UserDto,
  LoginDto,
  LoginResponseDto,
  TokensDto,
  RefreshTokenDto,
} from '@common';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';
import { JwtAuthGuard } from '@core';

@Controller('auth')
export class GatewayController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto): Observable<UserDto> {
    return this.authClient.send<UserDto>(
      { cmd: 'register_user' },
      createUserDto,
    );
  }

  @Post('login')
  login(@Body() loginDto: LoginDto): Observable<LoginResponseDto> {
    return this.authClient.send({ cmd: 'login' }, loginDto);
  }

  @Post('refresh')
  refresh(@Body() refreshTokenDto: RefreshTokenDto): Observable<TokensDto> {
    return this.authClient.send<TokensDto>(
      { cmd: 'refresh_token' },
      refreshTokenDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req): {
    userId: string;
    email: string;
  } {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  getUsers(): Observable<UserDto[]> {
    return this.authClient
      .send<UserDto[]>({ cmd: 'get_users' }, {})
      .pipe(retry(3));
  }
}
