import { Module } from '@nestjs/common';
import { DealsController } from './deals.controller';
import { DealsService } from './deals.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [PrismaModule, FilesModule],
  controllers: [DealsController],
  providers: [DealsService],
  exports: [DealsService],
})
export class DealsModule {}
