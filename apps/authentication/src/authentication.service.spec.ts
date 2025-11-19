import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';
import { UserRepository } from './repositories/user.repository';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let userRepository: UserRepository;
  let refreshTokenRepository: RefreshTokenRepository;
  let jwtService: JwtService;

  const mockUserRepository = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findAll: jest.fn(),
  };

  const mockRefreshTokenRepository = {
    create: jest.fn(),
    findByToken: jest.fn(),
    revokeToken: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: RefreshTokenRepository,
          useValue: mockRefreshTokenRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
    userRepository = module.get<UserRepository>(UserRepository);
    refreshTokenRepository = module.get<RefreshTokenRepository>(
      RefreshTokenRepository,
    );
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a new user successfully', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const mockUser = {
        _id: {
          toString: () => '507f1f77bcf86cd799439011',
        },
        email: createUserDto.email,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        isActive: true,
        roles: ['user'],
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);

      const result = await service.register(createUserDto);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should throw error if user already exist', async () => {
      const createUserDto = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      mockUserRepository.findByEmail.mockResolvedValue({
        email: createUserDto.email,
      });

      await expect(service.register(createUserDto)).rejects.toThrow(
        RpcException,
      );
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        _id: {
          toString: () => '507f1f77bcf86cd799439022',
        },
        email: loginDto.email,
        password: await bcrypt.hash(loginDto.password, 10),
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
        roles: ['user'],
      };

      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockJwtService.signAsync
        .mockResolvedValueOnce(mockTokens.accessToken)
        .mockResolvedValueOnce(mockTokens.refreshToken);
      mockRefreshTokenRepository.create.mockResolvedValue({});

      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(loginDto.email);
    });

    it('should throw error for invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(RpcException);
    });
  });

  describe('getUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [
        {
          _id: {
            toString: () => '507f1f77bcf86cd799439033',
          },
          email: 'user1@example.com',
          firstName: 'User',
          lastName: 'One',
          isActive: true,
          roles: ['user'],
        },
        {
          _id: {
            toString: () => '507f1f77bcf86cd799439044',
          },
          email: 'user2@example.com',
          firstName: 'User',
          lastName: 'Two',
          isActive: true,
          roles: ['user'],
        },
      ];

      mockUserRepository.findAll.mockResolvedValue(mockUsers);

      const result = await service.getUsers();

      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.findAll).toHaveBeenCalled();
    });
  });
});
