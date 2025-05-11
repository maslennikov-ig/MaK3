import { IsEnum, IsOptional } from 'class-validator';
import { ContactSource, ClientStatus } from '@prisma/client';

export class ImportContactsDto {
  @IsOptional()
  @IsEnum(ContactSource)
  defaultSource?: ContactSource = ContactSource.EXTERNAL_UPLOAD;

  @IsOptional()
  @IsEnum(ClientStatus)
  defaultStatus?: ClientStatus = ClientStatus.NEW_NO_PROCESSING;

  @IsOptional()
  isLead?: boolean = true;
}
