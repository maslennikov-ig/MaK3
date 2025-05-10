import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    // Исключаем пароль из возвращаемого объекта
    const { passwordHash, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    const payload = { sub: user.id, email: user.email, role: user.role.name };
    
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRES_IN'),
      },
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
      },
      accessToken,
      refreshToken,
    };
  }

  async register(registerDto: RegisterDto) {
    // Проверяем, существует ли пользователь с таким email
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new UnauthorizedException('Пользователь с таким email уже существует');
    }

    // Создаем нового пользователя
    const user = await this.usersService.create(registerDto);

    // Генерируем токены
    const payload = { sub: user.id, email: user.email, role: user.role.name };
    
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRES_IN'),
      },
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string) {
    try {
      // Проверяем refresh token
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      });

      // Получаем пользователя
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Пользователь не найден');
      }

      // Генерируем новые токены
      const newPayload = { sub: user.id, email: user.email, role: user.role.name };
      
      const accessToken = this.jwtService.sign(newPayload);
      const refreshToken = this.jwtService.sign(
        { sub: user.id },
        {
          secret: this.configService.get('REFRESH_TOKEN_SECRET'),
          expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRES_IN'),
        },
      );

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Недействительный refresh token');
    }
  }

  async logout() {
    // В будущем здесь может быть логика для инвалидации токенов
    // Например, добавление токена в черный список
    return { success: true };
  }
}
