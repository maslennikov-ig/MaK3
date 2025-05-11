import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Email пользователя',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Некорректный email' })
  @IsNotEmpty({ message: 'Email обязателен' })
  email: string;

  @ApiProperty({
    description: 'Имя пользователя',
    example: 'Иван',
  })
  @IsString({ message: 'Имя должно быть строкой' })
  @IsNotEmpty({ message: 'Имя обязательно' })
  firstName: string;

  @ApiProperty({
    description: 'Фамилия пользователя',
    example: 'Иванов',
  })
  @IsString({ message: 'Фамилия должна быть строкой' })
  @IsNotEmpty({ message: 'Фамилия обязательна' })
  lastName: string;

  @ApiProperty({
    description: 'Пароль пользователя',
    example: 'Password123!',
  })
  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль обязателен' })
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Пароль должен содержать хотя бы одну заглавную букву, одну строчную букву и одну цифру',
  })
  password: string;
}
