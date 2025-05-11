import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreatePipelineStageDto {
  @ApiProperty({ description: 'Название этапа воронки' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Порядковый номер этапа (для сортировки)', minimum: 0 })
  @IsInt()
  @Min(0)
  order: number;

  @ApiProperty({ description: 'Цвет этапа для отображения (HEX или название)', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ description: 'ID воронки, к которой относится этап' })
  @IsNotEmpty()
  @IsString()
  pipelineId: string;
}
