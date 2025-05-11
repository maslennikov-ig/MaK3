import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AssignRoleDto } from './dto/assign-role.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { UserRole } from './models/user.model';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(['ADMIN'])
  @ApiOperation({ summary: 'Получить всех пользователей' })
  @ApiResponse({ status: 200, description: 'Список всех пользователей' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(['ADMIN', 'MANAGER'])
  @ApiOperation({ summary: 'Получить пользователя по ID' })
  @ApiResponse({ status: 200, description: 'Данные пользователя' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @Roles(['ADMIN'])
  @ApiOperation({ summary: 'Создать нового пользователя' })
  @ApiResponse({ status: 201, description: 'Пользователь успешно создан' })
  @ApiResponse({ status: 400, description: 'Некорректные данные или пользователь уже существует' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  @Roles(['ADMIN'])
  @ApiOperation({ summary: 'Обновить данные пользователя' })
  @ApiResponse({ status: 200, description: 'Данные пользователя обновлены' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(['ADMIN'])
  @ApiOperation({ summary: 'Удалить пользователя' })
  @ApiResponse({ status: 200, description: 'Пользователь удален' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post('assign-role')
  @Roles(['ADMIN'])
  @ApiOperation({ summary: 'Назначить роль пользователю' })
  @ApiResponse({ status: 200, description: 'Роль успешно назначена' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  assignRole(@Body() assignRoleDto: AssignRoleDto) {
    return this.usersService.assignRole(assignRoleDto.userId, assignRoleDto.role);
  }

  @Get(':id/can-manage/:targetId')
  @Roles(['ADMIN', 'PARTNER'])
  @ApiOperation({ summary: 'Проверить, может ли пользователь управлять другим пользователем' })
  @ApiResponse({ status: 200, description: 'Результат проверки' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  canManageUser(@Param('id') id: string, @Param('targetId') targetId: string) {
    return this.usersService.canManageUser(id, targetId);
  }
}
