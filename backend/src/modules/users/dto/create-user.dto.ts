import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../models/user.model';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email пользователя',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Некорректный email' })
  @IsNotEmpty({ message: 'Email обязателен' })
  email: string;

  @ApiProperty({
    description: 'Пароль пользователя',
    example: 'StrongPassword123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Пароль должен содержать минимум 8 символов' })
  @IsNotEmpty({ message: 'Пароль обязателен' })
  password: string;

  @ApiProperty({
    description: 'Имя пользователя',
    example: 'Иван',
  })
  @IsString()
  @IsNotEmpty({ message: 'Имя обязательно' })
  firstName: string;

  @ApiProperty({
    description: 'Фамилия пользователя',
    example: 'Иванов',
  })
  @IsString()
  @IsNotEmpty({ message: 'Фамилия обязательна' })
  lastName: string;

  @ApiProperty({
    description: 'Роль пользователя',
    example: 'MANAGER',
    enum: UserRole,
    default: 'USER',
  })
  @IsEnum(UserRole, { message: 'Недопустимая роль' })
  @IsOptional()
  role?: UserRole;

  @ApiProperty({
    description: 'Активен ли пользователь',
    example: true,
    default: true,
  })
  @IsOptional()
  isActive?: boolean;
}
