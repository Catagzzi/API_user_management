import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from '@app/common';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthenticationService {
  private readonly SALT_ROUNDS = 10;

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async register(createUserDto: CreateUserDto) {
    const email = createUserDto.email;

    const existingUser = await this.userModel.findOne({ email });

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

    const newUser = new this.userModel({
      email: createUserDto.email,
      password: hashedPassword,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
    });
    const savedUser = await newUser.save();

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
    const users = await this.userModel.find().exec();

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
