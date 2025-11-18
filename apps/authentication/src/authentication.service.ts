import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class AuthenticationService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  getHello(): string {
    return 'Hello World!';
  }

  async createTestUser() {
    const testUser = new this.userModel({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });
    return await testUser.save();
  }
}
