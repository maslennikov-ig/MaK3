import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../modules/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

// Определение типа для пользователя
interface UserWithRole {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string | { name: string };
  isActive: boolean;
  [key: string]: unknown;
}

// Определение типа для результата валидации
type UserValidationResult = Omit<UserWithRole, 'password'>;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async validateUser(email: string, password: string): Promise<UserValidationResult | null> {
    const user = (await this.usersService.findByEmail(email)) as UserWithRole;
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    // Исключаем пароль из возвращаемого объекта
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto): Promise<Record<string, unknown>> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    // Определяем роль как строку
    const roleValue =
      typeof user.role === 'string' ? user.role : (user.role as { name: string }).name;

    const payload = { sub: user.id, email: user.email, role: roleValue };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRES_IN'),
      }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: roleValue,
      },
      accessToken,
      refreshToken,
    };
  }

  async register(registerDto: RegisterDto): Promise<Record<string, unknown>> {
    // Проверяем, существует ли пользователь с таким email
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new UnauthorizedException('Пользователь с таким email уже существует');
    }

    // Создаем нового пользователя
    const userResult = await this.usersService.create(registerDto);
    // Добавляем поле password для соответствия типу UserWithRole
    const user = { ...userResult, password: '' } as UserWithRole;

    // Определяем роль как строку
    const roleValue =
      typeof user.role === 'string' ? user.role : (user.role as { name: string }).name;

    // Генерируем токены
    const payload = { sub: user.id, email: user.email, role: roleValue };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRES_IN'),
      }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: roleValue,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string): Promise<Record<string, string>> {
    try {
      // Проверяем refresh token
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      }) as { sub: string };

      // Получаем пользователя
      const userResult = await this.usersService.findById(payload.sub);
      // Добавляем поле password для соответствия типу UserWithRole
      const user = { ...userResult, password: '' } as UserWithRole;
      if (!user) {
        throw new UnauthorizedException('Пользователь не найден');
      }

      // Определяем роль как строку
      const roleValue =
        typeof user.role === 'string' ? user.role : (user.role as { name: string }).name;

      // Генерируем новые токены
      const newPayload = { sub: user.id, email: user.email, role: roleValue };

      const accessToken = this.jwtService.sign(newPayload);
      const refreshToken = this.jwtService.sign(
        { sub: user.id },
        {
          secret: this.configService.get('REFRESH_TOKEN_SECRET'),
          expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRES_IN'),
        }
      );

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Недействительный refresh token');
    }
  }

  async logout(): Promise<{ success: boolean }> {
    // В будущем здесь может быть логика для инвалидации токенов
    // Например, добавление токена в черный список
    return { success: true };
  }
}
