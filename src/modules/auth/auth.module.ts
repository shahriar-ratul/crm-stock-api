import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AdminsModule } from '../admins/admins.module';

import 'dotenv/config';
import { AbilityFactory } from './ability/ability.factory';
import { JwtStrategy } from './strategies/jwt-strategy';
import { RefreshJwtStrategy } from './strategies/refreshToken.strategy';

@Global()
@Module({
  imports: [
    //  JwtModule.registerAsync(jwtConfig),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: {
          expiresIn: '1d',
        },
        global: true,
      }),
    }),
    AdminsModule,
  ],
  providers: [AuthService, JwtStrategy, RefreshJwtStrategy, AbilityFactory],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, AbilityFactory, JwtStrategy],
})
export class AuthModule { }
