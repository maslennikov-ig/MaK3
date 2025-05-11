import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { FilesModule } from './modules/files/files.module';
import { PipelinesModule } from './modules/pipelines/pipelines.module';
import { DealsModule } from './modules/deals/deals.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { validate } from './config/env.validation';

@Module({
  imports: [
    // Конфигурация с валидацией переменных окружения
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      cache: true,
    }),

    // JWT
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN'),
        },
      }),
    }),

    // BullMQ для очередей
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
        },
      }),
    }),

    // Модули приложения
    PrismaModule,
    AuthModule,
    ContactsModule,
    FilesModule,
    PipelinesModule,
    DealsModule,
  ],
  providers: [
    // Глобальные гварды
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
