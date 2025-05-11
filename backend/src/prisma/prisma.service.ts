import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Метод для очистки базы данных в тестовом окружении
  async cleanDatabase() {
    if (process.env.NODE_ENV !== 'test') {
      return;
    }

    // Порядок важен из-за внешних ключей
    const models = Reflect.ownKeys(this).filter(
      key => key[0] !== '_' && key[0] !== '$' && typeof this[key] === 'object'
    );

    return Promise.all(
      models.map(modelKey => {
        return this[modelKey].deleteMany();
      })
    );
  }
}
