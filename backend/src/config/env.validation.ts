import { plainToClass } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_SECRET: string;

  @IsNumber()
  JWT_ACCESS_EXPIRATION: number;

  @IsNumber()
  JWT_REFRESH_EXPIRATION: number;

  @IsString()
  @IsOptional()
  SENTRY_DSN: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(
    EnvironmentVariables,
    {
      ...config,
      PORT: config.PORT ? parseInt(config.PORT as string, 10) : undefined,
      JWT_ACCESS_EXPIRATION: config.JWT_ACCESS_EXPIRATION
        ? parseInt(config.JWT_ACCESS_EXPIRATION as string, 10)
        : undefined,
      JWT_REFRESH_EXPIRATION: config.JWT_REFRESH_EXPIRATION
        ? parseInt(config.JWT_REFRESH_EXPIRATION as string, 10)
        : undefined,
    },
    { enableImplicitConversion: false }
  );

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
