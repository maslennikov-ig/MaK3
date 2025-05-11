import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import * as bcrypt from 'bcrypt';
import * as Sentry from '@sentry/node';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Регистрация нового пользователя
   */
  async register(registerUserDto: RegisterUserDto): Promise<AuthResponseDto> {
    try {
      // Проверяем, существует ли пользователь с таким email
      const existingUser = await this.prismaService.user.findUnique({
        where: { email: registerUserDto.email },
      });

      if (existingUser) {
        throw new BadRequestException('Пользователь с таким email уже существует');
      }

      // Хешируем пароль
      const hashedPassword = await this.hashPassword(registerUserDto.password);

      // Создаем нового пользователя
      const newUser = await this.prismaService.user.create({
        data: {
          email: registerUserDto.email,
          password: hashedPassword,
          firstName: registerUserDto.firstName,
          lastName: registerUserDto.lastName,
          role: 'USER', // По умолчанию роль USER
          isActive: true,
        },
      });

      // Генерируем токены
      const tokens = await this.generateTokens(newUser.id, newUser.email);

      // Сохраняем refresh токен в базе
      await this.updateRefreshToken(newUser.id, tokens.refreshToken);

      // Возвращаем данные пользователя и токены
      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
        },
      };
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  }

  /**
   * Аутентификация пользователя
   */
  async login(loginUserDto: LoginUserDto): Promise<AuthResponseDto> {
    try {
      // Проверяем учетные данные пользователя
      const user = await this.validateUser(loginUserDto.email, loginUserDto.password);

      if (!user) {
        throw new UnauthorizedException('Неверный email или пароль');
      }

      // Генерируем токены
      const tokens = await this.generateTokens(user.id, user.email);

      // Сохраняем refresh токен в базе
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      // Возвращаем данные пользователя и токены
      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      };
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  }

  /**
   * Обновление токенов с помощью refresh токена
   */
  async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    try {
      // Проверяем refresh токен
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Получаем пользователя
      const user = await this.prismaService.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.refreshToken) {
        throw new ForbiddenException('Доступ запрещен');
      }

      // Проверяем, совпадает ли refresh токен с сохраненным в базе
      const refreshTokenMatches = await bcrypt.compare(
        refreshTokenDto.refreshToken,
        user.refreshToken
      );

      if (!refreshTokenMatches) {
        throw new ForbiddenException('Доступ запрещен');
      }

      // Генерируем новые токены
      const tokens = await this.generateTokens(user.id, user.email);

      // Сохраняем новый refresh токен в базе
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      // Возвращаем данные пользователя и новые токены
      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      };
    } catch (error) {
      Sentry.captureException(error);
      throw new ForbiddenException('Доступ запрещен');
    }
  }

  /**
   * Выход пользователя (удаление refresh токена)
   */
  async logout(userId: string): Promise<boolean> {
    try {
      await this.prismaService.user.update({
        where: { id: userId },
        data: { refreshToken: null },
      });
      return true;
    } catch (error) {
      Sentry.captureException(error);
      return false;
    }
  }

  /**
   * Валидация пользователя по email и паролю
   */
  async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    // Ищем пользователя по email
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    // Если пользователь не найден или не активен, возвращаем null
    if (!user || !user.isActive) {
      return null;
    }

    // Проверяем пароль
    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return null;
    }

    // Исключаем пароль из возвращаемого объекта
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...result } = user;
    return result;
  }

  /**
   * Генерация JWT токенов
   */
  private async generateTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: `${this.configService.get<number>('JWT_ACCESS_EXPIRATION')}s`,
        }
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: `${this.configService.get<number>('JWT_REFRESH_EXPIRATION')}s`,
        }
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Обновление refresh токена в базе данных
   */
  private async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    // Хешируем refresh токен перед сохранением
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.prismaService.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }

  /**
   * Хеширование пароля
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
