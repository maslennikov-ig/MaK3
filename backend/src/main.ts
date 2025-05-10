import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Глобальные пайпы для валидации
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
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
  console.log(`Приложение запущено на порту: ${port}`);
}
bootstrap();
