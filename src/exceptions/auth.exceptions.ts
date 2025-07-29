import { ConflictException, UnauthorizedException } from '@nestjs/common';

export class RoleNotAllowedException extends ConflictException {
  constructor() {
    super('Registration allowed only for Buyer or Seller roles.');
  }
}

export class EmailConflictException extends ConflictException {
  constructor() {
    super('Email already exists');
  }
}

export class PhoneConflictException extends ConflictException {
  constructor() {
    super('Phone number already exists');
  }
}

export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super('Invalid credentials');
  }
}

export class EnviromentVariableNotFoundException extends ReferenceError {
  constructor(variable: string) {
    super(`Environment variable ${variable} not found`);
  }
}
