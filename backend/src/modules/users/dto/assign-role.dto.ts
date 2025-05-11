import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../models/user.model';

export class AssignRoleDto {
  @ApiProperty({
    description: 'ID пользователя',
    example: 'f8c7d6e5-b4a3-2c1d-0e9f-8g7h6i5j4k3l',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'ID пользователя обязателен' })
  userId: string;

  @ApiProperty({
    description: 'Роль пользователя',
    example: 'MANAGER',
    enum: UserRole,
  })
  @IsEnum(UserRole, { message: 'Недопустимая роль' })
  @IsNotEmpty({ message: 'Роль обязательна' })
  role: UserRole;
}
