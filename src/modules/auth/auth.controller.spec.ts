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
describe('register (role validation)', () => {
  it('should throw ConflictException if role is missing', async () => {
    const dto = { email: 'test@example.com', phone: '1234567890' };
    await expect(controller.register(dto as any)).rejects.toThrow(ConflictException);
  });

  it('should throw ConflictException if role is not buyer or seller', async () => {
    const dto = { email: 'test@example.com', phone: '1234567890', role: 'admin' };
    await expect(controller.register(dto as any)).rejects.toThrow(ConflictException);
  });

  it('should allow registration if role is "buyer"', async () => {
    const dto = { email: 'unique@example.com', phone: '1234567890', role: 'buyer' };
    mockUserService.findByEmail.mockResolvedValue(null);
    mockUserService.findByPhone.mockResolvedValue(null);
    mockAuthService.register.mockResolvedValue('registered');
    const result = await controller.register(dto as any);
    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    expect(result).toBe('registered');
  });

  it('should allow registration if role is "seller"', async () => {
    const dto = { email: 'unique2@example.com', phone: '0987654321', role: 'seller' };
    mockUserService.findByEmail.mockResolvedValue(null);
    mockUserService.findByPhone.mockResolvedValue(null);
    mockAuthService.register.mockResolvedValue('registered2');
    const result = await controller.register(dto as any);
    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    expect(result).toBe('registered2');
  });

  it('should allow registration if role is "BUYER" (case-insensitive)', async () => {
    const dto = { email: 'unique3@example.com', phone: '1112223333', role: 'BUYER' };
    mockUserService.findByEmail.mockResolvedValue(null);
    mockUserService.findByPhone.mockResolvedValue(null);
    mockAuthService.register.mockResolvedValue('registered3');
    const result = await controller.register(dto as any);
    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    expect(result).toBe('registered3');
  
  });
});
});