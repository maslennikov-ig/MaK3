import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../../modules/users/users.service';

// Определение типа для payload JWT токена
interface JwtPayload {
  sub: string;
  email?: string;
  role?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService, private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<Record<string, unknown>> {
    const user = await this.usersService.findById(payload.sub);
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      user,
    };
  }
}
