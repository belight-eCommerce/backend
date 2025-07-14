import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { ConflictException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let userService: UserService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
  };

  const mockUserService = {
    findByEmail: jest.fn(),
    findByPhone: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login with req.user', async () => {
      const user = { id: 1, username: 'test' };
      const req = { user };
      mockAuthService.login.mockResolvedValue('token');
      const result = await controller.login(req);
      expect(mockAuthService.login).toHaveBeenCalledWith(user);
      expect(result).toBe('token');
    });
  });

  describe('register', () => {
    it('should throw ConflictException if email exists', async () => {
      const dto = { email: 'test@example.com' };
      mockUserService.findByEmail.mockResolvedValue({ id: 1 });
      await expect(controller.register(dto as any)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if phone exists', async () => {
      const dto = { phone: '1234567890' };
      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.findByPhone.mockResolvedValue({ id: 1 });
      await expect(controller.register(dto as any)).rejects.toThrow(ConflictException);
    });

    it('should call authService.register if email and phone are unique', async () => {
      const dto = { email: 'unique@example.com', phone: '1234567890' };
      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.findByPhone.mockResolvedValue(null);
      mockAuthService.register.mockResolvedValue('registered');
      const result = await controller.register(dto as any);
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
      expect(result).toBe('registered');
    });
  });
});