import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { ProductsRepository } from './repository/product.repository';
import { CloudinaryService } from './cloudinary.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsQueryDto } from './dto/get-products-query.dto';
import { Product } from './schemas/product.schema';

describe('ProductService', () => {
  let service: ProductService;
  let repo: ProductsRepository;
  let cloudinary: CloudinaryService;

  const mockRepo = {
    create: jest.fn(),
    findAndCount: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockCloudinary = {
    uploadImage: jest.fn(),
    deleteImageByUrl: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: ProductsRepository, useValue: mockRepo },
        { provide: CloudinaryService, useValue: mockCloudinary },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repo = module.get<ProductsRepository>(ProductsRepository);
    cloudinary = module.get<CloudinaryService>(CloudinaryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createWithImages', () => {
    it('should upload images and create product', async () => {
      const dto = {} as CreateProductDto;
      const files = [{}, {}];
      const ownerId = 'ownerId';
      mockCloudinary.uploadImage.mockResolvedValue('url');
      mockRepo.create.mockResolvedValue({ id: '1' });

      const result = await service.createWithImages(dto, files, ownerId);

      expect(cloudinary.uploadImage).toHaveBeenCalledTimes(files.length);
      expect(repo.create).toHaveBeenCalledWith({ ...dto, images: ['url', 'url'] }, ownerId);
      expect(result).toEqual({ id: '1' });
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const query = {} as GetProductsQueryDto;
      mockRepo.findAndCount.mockResolvedValue({ items: [], total: 0 });

      const result = await service.findAll(query);

      expect(repo.findAndCount).toHaveBeenCalled();
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
    });
  });

  describe('getByIdOrFail', () => {
    it('should return product if found', async () => {
      const id = 'productId';
      const product = {
        id,
        name: 'Test Product',
        description: 'A test product',
        price: 100,
        category: 'Test Category',
        images: [],
        owner: { toString: () => 'ownerId' }, // or a valid ObjectId mock
        createdAt: new Date(),
        updatedAt: new Date(),
        stock_quantity: 10,
        ratings: 0,
        num_reviews: 0,
        is_available: true,
      } as unknown as Product;
      mockRepo.findById.mockResolvedValue(product);

      const result = await service.getByIdOrFail(id);

      expect(repo.findById).toHaveBeenCalledWith(id);
      expect(result).toBe(product);
    });

    it('should throw if not found', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.getByIdOrFail('notfound')).rejects.toThrow();
    });
  });

  describe('updateWithImages', () => {
    it('should update product and images', async () => {
      const id = 'productId';
      const dto = {} as UpdateProductDto;
      const files = [];
      const userId = 'ownerId';
      const userRole = 'admin';
      const product = {
        id,
        images: [],
        owner: { toString: () => userId },
      } as unknown as Product;
      jest.spyOn(service, 'getByIdOrFail').mockResolvedValue(product);
      mockRepo.update.mockResolvedValue({ id });

      const result = await service.updateWithImages(id, dto, files, userId, userRole);

      expect(service.getByIdOrFail).toHaveBeenCalledWith(id);
      expect(repo.update).toHaveBeenCalled();
      expect(result).toEqual({ id });
    });
  });

  describe('deleteById', () => {
    it('should delete product and images', async () => {
      const id = 'productId';
      const userId = 'ownerId';
      const userRole = 'admin';
      const product = {
        id,
        images: ['url1', 'url2'],
        owner: { toString: () => userId },
      } as unknown as Product;
      jest.spyOn(service, 'getByIdOrFail').mockResolvedValue(product);
      mockRepo.remove.mockResolvedValue(undefined);

      await service.deleteById(id, userId, userRole);

      expect(service.getByIdOrFail).toHaveBeenCalledWith(id);
      expect(cloudinary.deleteImageByUrl).toHaveBeenCalledTimes(2);
      expect(repo.remove).toHaveBeenCalledWith(id);
    });
  });
});