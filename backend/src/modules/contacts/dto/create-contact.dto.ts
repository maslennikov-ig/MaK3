import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ContactSource, ClientStatus } from '@prisma/client';

export class CreateContactDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsNotEmpty()
  @IsEnum(ContactSource)
  source: ContactSource;

  @IsNotEmpty()
  @IsEnum(ClientStatus)
  statusClient: ClientStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isLead?: boolean = true;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @IsOptional()
  @IsUUID()
  partnerId?: string;
}
