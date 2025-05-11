import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Access токен для аутентификации',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh токен для обновления access токена',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Информация о пользователе',
    example: {
      id: 'f8c7d6e5-b4a3-2c1d-0e9f-8g7h6i5j4k3l',
      email: 'user@example.com',
      firstName: 'Иван',
      lastName: 'Иванов',
      role: 'MANAGER',
    },
  })
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}
