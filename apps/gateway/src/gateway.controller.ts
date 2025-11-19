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
import {
  HealthCheck,
  HealthCheckService,
  MicroserviceHealthIndicator,
} from '@nestjs/terminus';
import { Transport } from '@nestjs/microservices';
import { appConfig } from '@config';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class GatewayController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    private health: HealthCheckService,
    private microservice: MicroserviceHealthIndicator,
  ) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto): Observable<UserDto> {
    return this.authClient.send<UserDto>(
      { cmd: 'register_user' },
      createUserDto,
    );
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
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

  @Throttle({ default: { limit: 100, ttl: 60000 } })
  @Get('health')
  @HealthCheck()
  checkHealth() {
    return this.health.check([
      () =>
        this.microservice.pingCheck('authentication-service', {
          transport: Transport.TCP,
          options: {
            host: appConfig.authentication.host,
            port: appConfig.authentication.port,
          },
        }),
    ]);
  }
}
