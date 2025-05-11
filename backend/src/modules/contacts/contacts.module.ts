import { Module } from '@nestjs/common';
import { ContactsController } from 'src/modules/contacts/contacts.controller';
import { ContactsService } from 'src/modules/contacts/contacts.service';
import { ContactsCsvService } from 'src/modules/contacts/contacts-csv.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [PrismaModule, FilesModule],
  controllers: [ContactsController],
  providers: [ContactsService, ContactsCsvService],
  exports: [ContactsService, ContactsCsvService],
})
export class ContactsModule {}
