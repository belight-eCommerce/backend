import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsQueryDto } from './dto/get-products-query.dto';
import { PaginatedResult } from 'src/common/dto/pagination.dto';
import { Product } from './schemas/product.schema';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  const mockProductService = {
    createWithImages: jest.fn(),
    findAll: jest.fn(),
    getByIdOrFail: jest.fn(),
    updateWithImages: jest.fn(),
    deleteById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        { provide: ProductService, useValue: mockProductService },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.createWithImages with correct params', async () => {
      const dto = {} as CreateProductDto;
      const files = [];
      const req = { user: { userId: 'user1' } };
      const result = { id: '1' };
      mockProductService.createWithImages.mockResolvedValue(result);
      const res = await controller.create(dto, files, req);
      expect(service.createWithImages).toHaveBeenCalledWith(dto, files, 'user1');
      expect(res).toBe(result);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with query', async () => {
      const query = {} as GetProductsQueryDto;
      const result = {
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
        data: [],
      } as PaginatedResult<Product>;
      mockProductService.findAll.mockResolvedValue(result);
      const res = await controller.findAll(query);
      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(res).toBe(result);
    });
  });

  describe('getOne', () => {
    it('should call service.getByIdOrFail with id', async () => {
      const id = 'productId';
      const result = {
        id,
        name: 'Test Product',
        description: 'A test product',
        price: 100,
        category: 'Test Category',
        images: [],
        owner: { toString: () => 'ownerId' }, // <-- fix here
        createdAt: new Date(),
        updatedAt: new Date(),
        stock_quantity: 10,
        ratings: 0,
        num_reviews: 0,
        is_available: true,
      } as unknown as Product;
      mockProductService.getByIdOrFail.mockResolvedValue(result);
      const res = await controller.getOne(id);
      expect(service.getByIdOrFail).toHaveBeenCalledWith(id);
      expect(res).toBe(result);
    });
  });

  describe('update', () => {
    it('should call service.updateWithImages with correct params', async () => {
      const id = 'productId';
      const dto = {} as UpdateProductDto;
      const files = [];
      const req = { user: { userId: 'user1', role: 'seller' } };
      const result = { id };
      mockProductService.updateWithImages.mockResolvedValue(result);
      const res = await controller.update(id, dto, files, req);
      expect(service.updateWithImages).toHaveBeenCalledWith(id, dto, files, 'user1', 'seller');
      expect(res).toBe(result);
    });
  });

  describe('delete', () => {
    it('should call service.deleteById with correct params', async () => {
      const id = 'productId';
      const req = { user: { userId: 'user1', role: 'admin' } };
      const result = { deleted: true };
      mockProductService.deleteById.mockResolvedValue(result);
      const res = await controller.delete(id, req);
      expect(service.deleteById).toHaveBeenCalledWith(id, 'user1', 'admin');
      expect(res).toBe(result);
    });
  });
});
