import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule }      from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService }    from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy }  from './strategies/local.strategy';
import { JwtStrategy }    from './strategies/jwt.strategy';
import { User, UserSchema } from '../user/schemas/user.schema';
import { UserModule }       from '../user/user.module';

@Module({
  imports: [
    ConfigModule, 
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UserModule,
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
