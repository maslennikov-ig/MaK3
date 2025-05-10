import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден`);
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  }

  async create(registerDto: RegisterDto) {
    // Хешируем пароль
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(registerDto.password, saltRounds);

    // Находим роль "MANAGER" (по умолчанию для новых пользователей)
    const managerRole = await this.prisma.role.findUnique({
      where: { name: 'MANAGER' },
    });

    if (!managerRole) {
      // Если роль не найдена, создаем ее
      const createdRole = await this.prisma.role.create({
        data: {
          name: 'MANAGER',
          description: 'Менеджер системы',
        },
      });

      // Создаем пользователя с новой ролью
      return this.prisma.user.create({
        data: {
          email: registerDto.email,
          passwordHash,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          roleId: createdRole.id,
        },
        include: { role: true },
      });
    }

    // Создаем пользователя с существующей ролью
    return this.prisma.user.create({
      data: {
        email: registerDto.email,
        passwordHash,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        roleId: managerRole.id,
      },
      include: { role: true },
    });
  }

  async update(id: string, updateData: any) {
    // Проверяем, существует ли пользователь
    await this.findById(id);

    // Если в данных для обновления есть пароль, хешируем его
    if (updateData.password) {
      const saltRounds = 10;
      updateData.passwordHash = await bcrypt.hash(updateData.password, saltRounds);
      delete updateData.password;
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      include: { role: true },
    });
  }

  async remove(id: string) {
    // Проверяем, существует ли пользователь
    await this.findById(id);

    return this.prisma.user.delete({
      where: { id },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: { role: true },
    });
  }
}
