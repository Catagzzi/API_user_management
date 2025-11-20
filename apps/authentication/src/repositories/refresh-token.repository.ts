import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  RefreshToken,
  RefreshTokenDocument,
} from '../schemas/refresh-token.schema';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  async create(
    token: string,
    userId: Types.ObjectId,
    expiresAt: Date,
  ): Promise<RefreshTokenDocument> {
    const refreshToken = new this.refreshTokenModel({
      token,
      userId,
      expiresAt,
    });
    return refreshToken.save();
  }

  async findByToken(token: string): Promise<RefreshTokenDocument | null> {
    return this.refreshTokenModel.findOne({ token, isRevoked: false }).exec();
  }

  async revokeToken(token: string): Promise<void> {
    await this.refreshTokenModel
      .updateOne({ token }, { isRevoked: true })
      .exec();
  }
}
