import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

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

  @Patch(':id')
  @Roles(['ADMIN'])
  @ApiOperation({ summary: 'Обновить данные пользователя' })
  @ApiResponse({ status: 200, description: 'Данные пользователя обновлены' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  update(@Param('id') id: string, @Body() updateUserDto: any) {
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
}
