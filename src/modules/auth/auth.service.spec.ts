import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockUserService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      const user = {
        toObject: () => ({ email: 'test', password: 'hashed' }),
        password: 'hashed',
      };
      mockUserService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test', 'password');
      expect(result).toEqual({ email: 'test' });
    });

    it('should return null if user not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);
      const result = await service.validateUser('test', 'password');
      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      const user = {
        toObject: () => ({ email: 'test', password: 'hashed' }),
        password: 'hashed',
      };
      mockUserService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test', 'wrongpassword');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access_token', async () => {
      const user = { _id: '1', email: 'test', role: 'user' };
      mockJwtService.sign.mockReturnValue('jwt-token');
      const result = await service.login(user as any);
      expect(result).toEqual({ access_token: 'jwt-token' });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: user._id,
        email: user.email,
        role: user.role,
      });
    });
  });

  describe('register', () => {
    it('should hash password and call userService.create', async () => {
      const dto = { email: 'test', password: 'plain' };
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockUserService.create.mockResolvedValue('user');
      const result = await service.register(dto as any);
      expect(bcrypt.hash).toHaveBeenCalledWith('plain', 10);
      expect(mockUserService.create).toHaveBeenCalledWith({ ...dto, password: 'hashed' });
      expect(result).toBe('user');
    });
  });
});
