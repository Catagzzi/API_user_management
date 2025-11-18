import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthenticationService } from './authentication.service';
import { CreateUserDto } from '@app/common';

@Controller()
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @MessagePattern({ cmd: 'register_user' })
  async register(@Payload() data: CreateUserDto) {
    return await this.authenticationService.register(data);
  }

  @MessagePattern({ cmd: 'get_users' })
  async getUsers() {
    return await this.authenticationService.getUsers();
  }
}
