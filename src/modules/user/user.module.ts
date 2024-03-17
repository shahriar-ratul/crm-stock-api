import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserVerifyController } from './user-verify.controller';
import { WalletController } from './wallet.controller';

@Module({
  controllers: [UserController, UserVerifyController, WalletController],
  providers: [UserService],
  exports: [UserService],

})
export class UserModule { }
