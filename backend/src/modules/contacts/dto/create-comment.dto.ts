import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Текст комментария',
    example: 'Клиент запросил дополнительную информацию о продукте',
  })
  @IsNotEmpty({ message: 'Текст комментария не может быть пустым' })
  @IsString({ message: 'Текст комментария должен быть строкой' })
  @MaxLength(1000, { message: 'Текст комментария не может быть длиннее 1000 символов' })
  text: string;
}
