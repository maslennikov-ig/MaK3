import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePipelineDto {
  @ApiProperty({ description: 'Название воронки продаж' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Описание воронки продаж', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Активна ли воронка', default: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
