import { NotFoundException, ConflictException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`User with ID ${id} not found`);
  }
}

export class UserConflictException extends ConflictException {
  constructor(field: 'email' | 'phone') {
    super(`${field.charAt(0).toUpperCase() + field.slice(1)} already exists`);
  }
}
