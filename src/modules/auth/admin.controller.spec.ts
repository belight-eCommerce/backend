import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { UserService } from '../user/user.service';


describe('AdminController', () => {
  
  let controller: AdminController;
  let userService: UserService;

  const mockUserService = {
    findByEmail: jest.fn(),
    findByPhone: jest.fn(),
    create: jest.fn(),
    findAllByRole: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    userService = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  describe('createAdmin', () => {
    it('should throw if email already exists', async () => {
      const dto = { email: 'admin@test.com', phone: '123', password: 'pass' };
      mockUserService.findByEmail.mockResolvedValue({ id: 1 });
      await expect(controller.createAdmin(dto as any)).rejects.toThrow('Email already exists');
    });

    it('should throw if phone already exists', async () => {
      const dto = { email: 'admin@test.com', phone: '123', password: 'pass' };
      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.findByPhone.mockResolvedValue({ id: 2 });
      await expect(controller.createAdmin(dto as any)).rejects.toThrow('Phone number already exists');
    });

    it('should call userService.create with role admin', async () => {
      const dto = { email: 'admin@test.com', phone: '123', password: 'pass' };
      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.findByPhone.mockResolvedValue(null);
      mockUserService.create.mockResolvedValue({ id: 1, ...dto, role: 'admin' });

      const result = await controller.createAdmin(dto as any);
      expect(userService.create).toHaveBeenCalledWith({ ...dto, role: 'admin' });
      expect(result).toEqual({ id: 1, ...dto, role: 'admin' });
    });
  });

  describe('listAdmins', () => {
    it('should return all admins', async () => {
      const admins = [{ id: 1, role: 'admin' }];
      mockUserService.findAllByRole.mockResolvedValue(admins);
      const result = await controller.listAdmins();
      expect(userService.findAllByRole).toHaveBeenCalledWith('admin');
      expect(result).toEqual(admins);
    });
  });

  describe('updateAdmin', () => {
    it('should throw if role is not admin', async () => {
      const dto = { role: 'user' };
      await expect(controller.updateAdmin('1', dto as any)).rejects.toThrow('Cannot change role to anything other than admin');
    });

    it('should call userService.update with role admin', async () => {
      const dto = { email: 'admin@test.com' };
      mockUserService.update.mockResolvedValue({ id: 1, ...dto, role: 'admin' });
      const result = await controller.updateAdmin('1', dto as any);
      expect(userService.update).toHaveBeenCalledWith('1', { ...dto, role: 'admin' });
      expect(result).toEqual({ id: 1, ...dto, role: 'admin' });
    });
  });

  describe('deactivateAdmin', () => {
    it('should call userService.update with isActive false', async () => {
      mockUserService.update.mockResolvedValue({ id: 1, isActive: false });
      const result = await controller.deactivateAdmin('1');
      expect(userService.update).toHaveBeenCalledWith('1', { isActive: false });
      expect(result).toEqual({ id: 1, isActive: false });
    });
  });

  describe('activateAdmin', () => {
    it('should call userService.update with isActive true', async () => {
      mockUserService.update.mockResolvedValue({ id: 1, isActive: true });
      const result = await controller.activateAdmin('1');
      expect(userService.update).toHaveBeenCalledWith('1', { isActive: true });
      expect(result).toEqual({ id: 1, isActive: true });
    });
  });
});