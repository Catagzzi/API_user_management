import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';

describe('AuthenticationController', () => {
  let controller: AuthenticationController;
  let service: AuthenticationService;

  const mockAuthenticationService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    getUsers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        {
          provide: AuthenticationService,
          useValue: mockAuthenticationService,
        },
      ],
    }).compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
    service = module.get<AuthenticationService>(AuthenticationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should call authenticationService.register', async () => {
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

      mockAuthenticationService.register.mockResolvedValue(mockUser);

      const result = await controller.register(createUserDto);

      expect(service.register).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should call authenticationService.login', async () => {
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

      mockAuthenticationService.login.mockResolvedValue(mockResponse);

      const result = await controller.login(loginDto);

      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('refreshToken', () => {
    it('should call authenticationService.refreshToken', async () => {
      const refreshTokenData = {
        refreshToken: 'mock-refresh-token',
      };

      const mockTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      mockAuthenticationService.refreshToken.mockResolvedValue(mockTokens);

      const result = await controller.refreshToken(refreshTokenData);

      expect(service.refreshToken).toHaveBeenCalledWith(
        refreshTokenData.refreshToken,
      );
      expect(result).toEqual(mockTokens);
    });
  });

  describe('getUsers', () => {
    it('should call authenticationService.getUsers', async () => {
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

      mockAuthenticationService.getUsers.mockResolvedValue(mockUsers);

      const result = await controller.getUsers();

      expect(service.getUsers).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });
});
