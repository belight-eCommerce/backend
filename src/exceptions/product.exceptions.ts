import {NotFoundException,ForbiddenException,BadRequestException,} from '@nestjs/common';

export class ProductNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Product with ID ${id} not found`);
  }
}

export class ProductOwnershipException extends ForbiddenException {
  constructor() {
    super('You do not have permission to modify this product');
  }
}

export class ProductImageLimitException extends BadRequestException {
  constructor() {
    super('You can upload up to 3 images per product.');
  }
}
