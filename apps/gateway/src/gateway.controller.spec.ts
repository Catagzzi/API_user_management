import { Test, TestingModule } from '@nestjs/testing';
import { GatewayController } from './gateway.controller';
import { of } from 'rxjs';
import {
  HealthCheckService,
  MicroserviceHealthIndicator,
} from '@nestjs/terminus';

describe('GatewayController', () => {
  let controller: GatewayController;
  let mockAuthClient: any;
  let mockHealthCheckService: any;
  let mockMicroserviceHealthIndicator: any;

  beforeEach(async () => {
    mockAuthClient = {
      send: jest.fn(),
    };

    mockHealthCheckService = {
      check: jest.fn(),
    };

    mockMicroserviceHealthIndicator = {
      pingCheck: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GatewayController],
      providers: [
        {
          provide: 'AUTH_SERVICE',
          useValue: mockAuthClient,
        },
        {
          provide: HealthCheckService,
          useValue: mockHealthCheckService,
        },
        {
          provide: MicroserviceHealthIndicator,
          useValue: mockMicroserviceHealthIndicator,
        },
      ],
    }).compile();

    controller = module.get<GatewayController>(GatewayController);
  });

  describe('register', () => {
    it('should call AUTH_SERVICE with register_user command', () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const mockUser = {
        _id: 'mock-id',
        email: createUserDto.email,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        isActive: true,
        roles: ['user'],
      };

      mockAuthClient.send.mockReturnValue(of(mockUser));

      controller.register(createUserDto);

      expect(mockAuthClient.send).toHaveBeenCalledWith(
        { cmd: 'register_user' },
        createUserDto,
      );
    });
  });

  describe('login', () => {
    it('should call AUTH_SERVICE with login command', () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          _id: 'mock-id',
          email: loginDto.email,
        },
      };

      mockAuthClient.send.mockReturnValue(of(mockResponse));

      controller.login(loginDto);

      expect(mockAuthClient.send).toHaveBeenCalledWith(
        { cmd: 'login' },
        loginDto,
      );
    });
  });

  describe('refresh', () => {
    it('should call AUTH_SERVICE with refresh_token command', () => {
      const refreshTokenDto = {
        refreshToken: 'mock-refresh-token',
      };

      const mockTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      mockAuthClient.send.mockReturnValue(of(mockTokens));

      controller.refresh(refreshTokenDto);

      expect(mockAuthClient.send).toHaveBeenCalledWith(
        { cmd: 'refresh_token' },
        refreshTokenDto,
      );
    });
  });

  describe('getProfile', () => {
    it('should return user from request', () => {
      const mockRequest = {
        user: {
          userId: 'mock-id',
          email: 'test@example.com',
        },
      };

      const result = controller.getProfile(mockRequest);

      expect(result).toEqual(mockRequest.user);
    });
  });

  describe('getUsers', () => {
    it('should call AUTH_SERVICE with get_users command', () => {
      const mockUsers = [
        {
          _id: 'id1',
          email: 'user1@example.com',
          firstName: 'User',
          lastName: 'One',
          isActive: true,
          roles: ['user'],
        },
      ];

      mockAuthClient.send.mockReturnValue(of(mockUsers));

      controller.getUsers();

      expect(mockAuthClient.send).toHaveBeenCalledWith(
        { cmd: 'get_users' },
        {},
      );
    });
  });
});
