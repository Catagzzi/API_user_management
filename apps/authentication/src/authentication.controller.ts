import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthenticationService } from './authentication.service';
import { CreateUserDto, LoginDto } from '@common';

@Controller()
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @MessagePattern({ cmd: 'register_user' })
  async register(@Payload() data: CreateUserDto) {
    return await this.authenticationService.register(data);
  }

  @MessagePattern({ cmd: 'login' })
  async login(@Payload() data: LoginDto) {
    return await this.authenticationService.login(data);
  }

  @MessagePattern({ cmd: 'refresh_token' })
  async refreshToken(@Payload() data: { refreshToken: string }) {
    return await this.authenticationService.refreshToken(data.refreshToken);
  }

  @MessagePattern({ cmd: 'get_users' })
  async getUsers() {
    return await this.authenticationService.getUsers();
  }
}
