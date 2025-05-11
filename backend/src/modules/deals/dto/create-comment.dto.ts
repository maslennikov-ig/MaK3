import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDealCommentDto {
  @ApiProperty({ description: 'Содержание комментария' })
  @IsNotEmpty()
  @IsString()
  content: string;
}
