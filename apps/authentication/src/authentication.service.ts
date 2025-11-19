import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '@common';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class AuthenticationService {
  private readonly SALT_ROUNDS = 10;

  constructor(private readonly userRepository: UserRepository) {}

  async register(createUserDto: CreateUserDto) {
    const email = createUserDto.email;

    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new RpcException({
        statusCode: 409,
        message: 'Email already registered',
        error: 'Conflict',
      });
    }

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      this.SALT_ROUNDS,
    );

    const savedUser = await this.userRepository.create({
      email: createUserDto.email,
      password: hashedPassword,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
    });

    return {
      _id: savedUser._id,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      isActive: savedUser.isActive,
      roles: savedUser.roles,
    };
  }

  async getUsers() {
    const users = await this.userRepository.findAll();

    return users.map((user) => ({
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      roles: user.roles,
    }));
  }
}
