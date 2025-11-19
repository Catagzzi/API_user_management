import { Controller, Get, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto, UserDto } from '@common';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';

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

  @Get('users')
  getUsers(): Observable<UserDto[]> {
    return this.authClient
      .send<UserDto[]>({ cmd: 'get_users' }, {})
      .pipe(retry(3));
  }
}
