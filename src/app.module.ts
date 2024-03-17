import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
// import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
// import { redisStore } from 'cache-manager-redis-yet';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { AdminsModule } from './modules/admins/admins.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { ErrorFilter } from './common/filter/error.filter';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { UserModule } from './modules/user/user.module';
import { WithdrawModule } from './modules/withdraw/withdraw.module';
import { TransactionModule } from './modules/transaction/transaction.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
    }),
    MulterModule.register({
      dest: './public',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'public'),
      exclude: [
        '/api/(.*)',
        '/docs'
      ],
      serveRoot: '/public',
    }),
    // CacheModule.register({
    //   isGlobal: true,
    //   store: redisStore,
    //   host: 'redis',
    //   port: 6379,
    // }),
    // CacheModule.register({
    //   isGlobal: true,
    //   store: redisStore,
    //   socket: { host: "localhost", port: 6379 },
    // }),

    ThrottlerModule.forRoot([{
      ttl: 1,
      limit: 100,
    }]),
    AuthModule,
    AdminsModule,
    UserModule,
    WithdrawModule,
    TransactionModule,

  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: CacheInterceptor,
    // },
    {
      provide: 'APP_GUARD',
      useClass: ThrottlerGuard,
    },

    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: ErrorFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    Reflector,

  ],
  exports: [ConfigModule],

})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

