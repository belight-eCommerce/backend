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

  describe('login', () => {
    it('should call authService.login with req.user', async () => {
      const user = { id: 1, email: 'test@test.com' };
      const req = { user };
      mockAuthService.login.mockResolvedValue({ access_token: 'token' });

      const result = await controller.login(req as any);
      expect(authService.login).toHaveBeenCalledWith(user);
      expect(result).toEqual({ access_token: 'token' });
    });
  });

  describe('register', () => {
    it('should throw if role is not buyer or seller', async () => {
      const dto = { email: 'a@a.com', password: '123', role: 'admin' };
      await expect(controller.register(dto as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw if email already exists', async () => {
      const dto = { email: 'a@a.com', password: '123', role: 'buyer' };
      mockUserService.findByEmail.mockResolvedValue({ id: 1 });
      await expect(controller.register(dto as any)).rejects.toThrow(
        'Email already exists',
      );
    });

    it('should throw if phone already exists', async () => {
      const dto = { email: 'a@a.com', phone: '123', password: '123', role: 'seller' };
      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.findByPhone.mockResolvedValue({ id: 2 });
      await expect(controller.register(dto as any)).rejects.toThrow(
        'Phone number already exists',
      );
    });

    it('should call authService.register if valid', async () => {
      const dto = { email: 'a@a.com', phone: '123', password: '123', role: 'buyer' };
      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.findByPhone.mockResolvedValue(null);
      mockAuthService.register.mockResolvedValue({ id: 1, ...dto });

      const result = await controller.register(dto as any);
      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 1, ...dto });
    });
  });
});