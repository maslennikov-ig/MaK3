import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDealDto {
  @ApiProperty({ description: 'Название сделки' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Сумма сделки', required: false })
  @IsOptional()
  @IsDecimal()
  @Type(() => Number)
  amount?: number;

  @ApiProperty({ description: 'Описание сделки', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'ID этапа воронки продаж' })
  @IsNotEmpty()
  @IsString()
  stageId: string;

  @ApiProperty({ description: 'ID контакта, связанного со сделкой' })
  @IsNotEmpty()
  @IsString()
  contactId: string;

  @ApiProperty({ description: 'ID ответственного пользователя', required: false })
  @IsOptional()
  @IsString()
  assignedToId?: string;

  @ApiProperty({ description: 'ID партнера', required: false })
  @IsOptional()
  @IsString()
  partnerId?: string;
}
