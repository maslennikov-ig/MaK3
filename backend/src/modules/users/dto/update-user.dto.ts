import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../models/user.model';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Email пользователя',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Некорректный email' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Пароль пользователя',
    example: 'StrongPassword123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Пароль должен содержать минимум 8 символов' })
  @IsOptional()
  password?: string;

  @ApiProperty({
    description: 'Имя пользователя',
    example: 'Иван',
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'Фамилия пользователя',
    example: 'Иванов',
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: 'Роль пользователя',
    example: 'MANAGER',
    enum: UserRole,
  })
  @IsEnum(UserRole, { message: 'Недопустимая роль' })
  @IsOptional()
  role?: UserRole;

  @ApiProperty({
    description: 'Активен ли пользователь',
    example: true,
  })
  @IsOptional()
  isActive?: boolean;
}
