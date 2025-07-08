## Description

This project is a backend API built with [NestJS](https://github.com/nestjs/nest) and TypeScript. It is designed to provide a scalable and maintainable server-side application for managing users, products, orders, carts, and payments.

### Features

- User authentication and management
- Product catalog management
- Shopping cart functionality
- Order processing
- Payment integration

### Database Schemas

The application uses MongoDB with Mongoose for data persistence. Below are the main entities and their planned schemas:

#### User
- `name`: string, required
- `email`: string, unique, required
- `phone`: string, unique, required
- `role`: string, required
- `password`: string, required
- `is_verified`: boolean, default false

#### Product (planned)
- `name`: string, required
- `description`: string
- `price`: number, required
- `category`: string
- `stock`: number
- `images`: [string]

#### Order (planned)
- `user`: ObjectId (ref: User), required
- `products`: [{ product: ObjectId (ref: Product), quantity: number }]
- `total`: number
- `status`: string
- `createdAt`: Date
- `updatedAt`: Date

#### Cart (planned)
- `user`: ObjectId (ref: User), required
- `items`: [{ product: ObjectId (ref: Product), quantity: number }]
- `createdAt`: Date
- `updatedAt`: Date

#### Payment (planned)
- `order`: ObjectId (ref: Order), required
- `amount`: number
- `status`: string
- `paymentMethod`: string
- `transactionId`: string

> **Note:** Only the User schema is currently implemented. Other schemas will be added as development progresses.
