import { Global, Module, forwardRef } from '@nestjs/common';
import { AdminsService } from './admin/admins.service';
import { AdminsController } from './admin/admins.controller';
import { PermissionsController } from './permission/permissions.controller';
import { RolesController } from './role/roles.controller';
import { PermissionsService } from './permission/permissions.service';
import { RolesService } from './role/roles.service';
import { TokenService } from './token/token.service';
import { AuthModule } from '../auth/auth.module';
import { AdminModuleController } from './list/admin-module.controller';


@Global()
@Module({
  controllers: [
    AdminsController,
    PermissionsController,
    RolesController,
    AdminModuleController,
  ],
  imports: [
    forwardRef(() => AuthModule),
  ],

  providers: [
    // services
    AdminsService,
    PermissionsService,
    RolesService,
    TokenService,
  ],
  exports: [
    // services
    AdminsService,
    TokenService,
    PermissionsService,
    RolesService,
    AdminsService,
  ],
})
export class AdminsModule { }
