import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from './models/user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      // Поле role в схеме Prisma является строкой, а не связью
    });

    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден`);
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      // Поле role в схеме Prisma является строкой, а не связью
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      // Поле role в схеме Prisma является строкой, а не связью
    });
  }

  async create(createUserDto: CreateUserDto) {
    // Проверяем, существует ли пользователь с таким email
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new BadRequestException(`Пользователь с email ${createUserDto.email} уже существует`);
    }

    // Хешируем пароль
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    // Создаем пользователя
    const newUser = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        role: createUserDto.role || UserRole.USER,
        isActive: true,
      },
      // Поле role в схеме Prisma является строкой, а не связью
    });

    // Исключаем пароль из возвращаемого объекта
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...result } = newUser;
    return result;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Проверяем, существует ли пользователь
    await this.findById(id);

    // Подготавливаем данные для обновления
    const updateData: Record<string, unknown> = {};

    // Копируем все поля из DTO, кроме пароля
    if (updateUserDto.email) updateData.email = updateUserDto.email;
    if (updateUserDto.firstName) updateData.firstName = updateUserDto.firstName;
    if (updateUserDto.lastName) updateData.lastName = updateUserDto.lastName;
    if (updateUserDto.role) updateData.role = updateUserDto.role;
    if (updateUserDto.isActive !== undefined) updateData.isActive = updateUserDto.isActive;

    // Если в данных для обновления есть пароль, хешируем его
    if (updateUserDto.password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(updateUserDto.password, saltRounds);
    }

    // Обновляем пользователя
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Исключаем пароль из возвращаемого объекта
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...result } = updatedUser;
    return result;
  }

  async remove(id: string) {
    // Проверяем, существует ли пользователь
    await this.findById(id);

    return this.prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Назначение роли пользователю
   */
  async assignRole(userId: string, role: UserRole): Promise<Record<string, unknown>> {
    // Проверяем, существует ли пользователь
    await this.findById(userId);

    // Проверяем валидность роли
    if (!Object.values(UserRole).includes(role)) {
      throw new BadRequestException(`Роль ${role} не существует`);
    }

    // Обновляем роль пользователя
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  /**
   * Проверка, может ли пользователь управлять другим пользователем
   * @param userId ID пользователя, который хочет управлять
   * @param targetId ID целевого пользователя
   * @returns Объект с результатом проверки
   */
  async canManageUser(
    userId: string,
    targetId: string
  ): Promise<{ canManage: boolean; reason?: string }> {
    // Получаем данные обоих пользователей
    const [user, targetUser] = await Promise.all([this.findById(userId), this.findById(targetId)]);

    // Администратор может управлять всеми пользователями
    if (user.role === UserRole.ADMIN) {
      return { canManage: true };
    }

    // Менеджер может управлять обычными пользователями
    if (user.role === UserRole.MANAGER && targetUser.role === UserRole.USER) {
      return { canManage: true };
    }

    // В остальных случаях управление запрещено
    return {
      canManage: false,
      reason: 'Недостаточно прав для управления этим пользователем',
    };
  }
}
