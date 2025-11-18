import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { RegisterUserDto } from '@app/common';
import { RpcException } from '@nestjs/microservices';
@Injectable()
export class AuthenticationService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async register(registerUserDto: RegisterUserDto) {
    const email = registerUserDto.email;
    const existingUser = await this.userModel.findOne({
      email,
    });

    if (existingUser) {
      throw new RpcException({
        statusCode: 409,
        message: 'Email already registered',
        error: 'Conflict',
      });
    }

    const newUser = new this.userModel({
      email: registerUserDto.email,
      password: registerUserDto.password,
      name: registerUserDto.name,
    });

    return await newUser.save();
  }

  async getUsers() {
    return await this.userModel.find().exec();
  }
}
