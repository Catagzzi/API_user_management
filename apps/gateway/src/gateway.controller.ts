import {
  Controller,
  Get,
  Post,
  Body,
  Inject,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RegisterUserDto } from '@app/common';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Controller('auth')
export class GatewayController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto): Observable<any> {
    return this.authClient.send({ cmd: 'register_user' }, registerUserDto);
  }

  @Get('users')
  getUsers(): Observable<any> {
    return this.authClient.send({ cmd: 'get_users' }, {}).pipe(
      retry(3),
      catchError((err) => {
        console.error('Failed after 3 retries:', err);
        return throwError(
          () => new ServiceUnavailableException('Service unavailable'),
        );
      }),
    );
  }
}
