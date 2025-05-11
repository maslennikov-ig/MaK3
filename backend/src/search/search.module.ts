import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [SearchService],
  controllers: [SearchController],
  exports: [SearchService],
})
export class SearchModule {}
