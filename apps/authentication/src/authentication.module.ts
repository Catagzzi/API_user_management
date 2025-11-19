import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { MongooseModule } from '@nestjs/mongoose';
import { getMongoUri } from '@config';
import { DatabaseModule } from '@core';
import { User, UserSchema } from './schemas/user.schema';
import { UserRepository } from './repositories/user.repository';

@Module({
  imports: [
    DatabaseModule.forRoot(getMongoUri()),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, UserRepository],
})
export class AuthenticationModule {}
