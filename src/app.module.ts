import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';
import { CartModule } from './modules/cart/cart.module';
import { PaymentModule } from './modules/payment/payment.module';

@Module({
  imports: [AuthModule, UserModule, ProductModule, OrderModule, CartModule, PaymentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
