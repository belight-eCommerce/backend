import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';
import { CartModule } from './modules/cart/cart.module';
import { PaymentModule } from './modules/payment/payment.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import mongodbConfig from './config/mongodb.config';
import { MongooseModule } from '@nestjs/mongoose';




@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mongodbConfig],
    }), 
    
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('mongodb.uri'),
      }),
      inject: [ConfigService],
    }),
    AuthModule, 
    UserModule, 
    ProductModule, 
    OrderModule, 
    CartModule, 
    PaymentModule],
  
})
export class AppModule {}
