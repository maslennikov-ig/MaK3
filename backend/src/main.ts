import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Инициализация Sentry
  const sentryDsn = configService.get<string>('SENTRY_DSN');
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      integrations: [new ProfilingIntegration()],
      // Настройки окружения
      environment: configService.get<string>('NODE_ENV', 'development'),
      // Процент транзакций для профилирования
      profilesSampleRate: 1.0,
      // Процент запросов для трассировки
      tracesSampleRate: 1.0,
    });
  }

  // Глобальные пайпы для валидации
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  // CORS
  app.enableCors({
    origin: configService.get('FRONTEND_URL') || 'http://localhost:3000',
    credentials: true,
  });

  // Префикс API
  app.setGlobalPrefix('api');

  // Swagger документация
  const config = new DocumentBuilder()
    .setTitle('MaK 3 CRM API')
    .setDescription('API для CRM-системы MaK 3')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Запуск сервера
  const port = configService.get('API_PORT') || 3001;
  await app.listen(port);
  // Используем Logger вместо console.log
  const logger = new Logger('Bootstrap');
  logger.log(`Приложение запущено на порту: ${port}`);
}
bootstrap();
