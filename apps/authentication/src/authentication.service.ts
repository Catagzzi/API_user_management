import { Injectable } from '@nestjs/common';
import { CreateUserDto, LoginDto } from '@common';
import { RpcException } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { appConfig } from '@config';
import { UserRepository } from './repositories/user.repository';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';

@Injectable()
export class AuthenticationService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService,
  ) {}

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

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findByEmail(loginDto.email, true);

    if (!user) {
      throw new RpcException({
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized',
      });
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new RpcException({
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized',
      });
    }

    const tokens = await this.generateTokens(user._id.toString(), user.email);

    return {
      ...tokens,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        roles: user.roles,
      },
    };
  }

  async refreshToken(oldRefreshToken: string) {
    const storedToken = await this.refreshTokenRepository.findByToken(
      oldRefreshToken,
    );

    if (!storedToken || storedToken.isRevoked) {
      throw new RpcException({
        statusCode: 401,
        message: 'Invalid refresh token',
        error: 'Unauthorized',
      });
    }

    if (storedToken.expiresAt < new Date()) {
      throw new RpcException({
        statusCode: 401,
        message: 'Refresh token expired',
        error: 'Unauthorized',
      });
    }

    let payload;
    try {
      payload = this.jwtService.verify(oldRefreshToken, {
        secret: appConfig.jwt.refreshTokenSecret,
      });
    } catch {
      throw new RpcException({
        statusCode: 401,
        message: 'Invalid refresh token',
        error: 'Unauthorized',
      });
    }

    await this.refreshTokenRepository.revokeToken(oldRefreshToken);

    const tokens = await this.generateTokens(payload.sub, payload.email);

    return tokens;
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: appConfig.jwt.accessTokenSecret,
      expiresIn: 900,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: appConfig.jwt.refreshTokenSecret,
      expiresIn: 604800,
    });

    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

    await this.refreshTokenRepository.create(
      refreshToken,
      new Types.ObjectId(userId),
      refreshTokenExpiry,
    );

    return { accessToken, refreshToken };
  }
}
