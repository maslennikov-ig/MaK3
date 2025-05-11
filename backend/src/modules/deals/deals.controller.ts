import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@prisma/client';

// Расширенный интерфейс пользователя с полем partnerId
interface ExtendedUser extends User {
  partnerId?: string | null;
}
import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { CreateDealCommentDto } from './dto/create-comment.dto';

@ApiTags('deals')
@Controller('deals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post()
  @ApiOperation({ summary: 'Создание новой сделки' })
  @ApiResponse({ status: 201, description: 'Сделка успешно создана' })
  @Roles(['ADMIN', 'MANAGER', 'PARTNER', 'PARTNER_EMPLOYEE'])
  async createDeal(@Body() createDealDto: CreateDealDto, @CurrentUser() currentUser: ExtendedUser) {
    return this.dealsService.createDeal(createDealDto, currentUser);
  }

  @Get()
  @ApiOperation({ summary: 'Получение списка сделок с фильтрацией и пагинацией' })
  @ApiResponse({ status: 200, description: 'Список сделок' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Номер страницы' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество элементов на странице' })
  @ApiQuery({ name: 'stageId', required: false, type: String, description: 'Фильтр по ID этапа воронки' })
  @ApiQuery({ name: 'contactId', required: false, type: String, description: 'Фильтр по ID контакта' })
  @ApiQuery({ name: 'assignedToId', required: false, type: String, description: 'Фильтр по ID ответственного' })
  @ApiQuery({ name: 'partnerId', required: false, type: String, description: 'Фильтр по ID партнера' })
  @Roles(['ADMIN', 'MANAGER', 'PARTNER', 'PARTNER_EMPLOYEE'])
  async findAllDeals(
    @CurrentUser() currentUser: ExtendedUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('stageId') stageId?: string,
    @Query('contactId') contactId?: string,
    @Query('assignedToId') assignedToId?: string,
    @Query('partnerId') partnerId?: string,
  ) {
    return this.dealsService.findAllDeals(
      currentUser,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      stageId,
      contactId,
      assignedToId,
      partnerId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение сделки по ID' })
  @ApiResponse({ status: 200, description: 'Сделка' })
  @ApiResponse({ status: 404, description: 'Сделка не найдена' })
  @ApiParam({ name: 'id', description: 'ID сделки' })
  @Roles(['ADMIN', 'MANAGER', 'PARTNER', 'PARTNER_EMPLOYEE'])
  async findDealById(@Param('id') id: string, @CurrentUser() currentUser: ExtendedUser) {
    return this.dealsService.findDealById(id, currentUser);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновление сделки' })
  @ApiResponse({ status: 200, description: 'Сделка успешно обновлена' })
  @ApiResponse({ status: 404, description: 'Сделка не найдена' })
  @ApiParam({ name: 'id', description: 'ID сделки' })
  @Roles(['ADMIN', 'MANAGER', 'PARTNER', 'PARTNER_EMPLOYEE'])
  async updateDeal(
    @Param('id') id: string,
    @Body() updateDealDto: UpdateDealDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.dealsService.updateDeal(id, updateDealDto, currentUser);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удаление сделки' })
  @ApiResponse({ status: 200, description: 'Сделка успешно удалена' })
  @ApiResponse({ status: 404, description: 'Сделка не найдена' })
  @ApiParam({ name: 'id', description: 'ID сделки' })
  @Roles(['ADMIN', 'MANAGER'])
  async deleteDeal(@Param('id') id: string, @CurrentUser() currentUser: ExtendedUser) {
    return this.dealsService.deleteDeal(id, currentUser);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Получение истории изменений сделки' })
  @ApiResponse({ status: 200, description: 'История изменений' })
  @ApiResponse({ status: 404, description: 'Сделка не найдена' })
  @ApiParam({ name: 'id', description: 'ID сделки' })
  @Roles(['ADMIN', 'MANAGER', 'PARTNER', 'PARTNER_EMPLOYEE'])
  async getDealHistory(@Param('id') id: string, @CurrentUser() currentUser: ExtendedUser) {
    return this.dealsService.getDealHistory(id, currentUser);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Получение комментариев к сделке' })
  @ApiResponse({ status: 200, description: 'Список комментариев' })
  @ApiResponse({ status: 404, description: 'Сделка не найдена' })
  @ApiParam({ name: 'id', description: 'ID сделки' })
  @Roles(['ADMIN', 'MANAGER', 'PARTNER', 'PARTNER_EMPLOYEE'])
  async getDealComments(@Param('id') id: string, @CurrentUser() currentUser: ExtendedUser) {
    return this.dealsService.getDealComments(id, currentUser);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Добавление комментария к сделке' })
  @ApiResponse({ status: 201, description: 'Комментарий успешно добавлен' })
  @ApiResponse({ status: 404, description: 'Сделка не найдена' })
  @ApiParam({ name: 'id', description: 'ID сделки' })
  @Roles(['ADMIN', 'MANAGER', 'PARTNER', 'PARTNER_EMPLOYEE'])
  async addDealComment(
    @Param('id') id: string,
    @Body() commentDto: CreateDealCommentDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.dealsService.addDealComment(id, commentDto, currentUser);
  }

  @Get(':id/attachments')
  @ApiOperation({ summary: 'Получение вложений сделки' })
  @ApiResponse({ status: 200, description: 'Список вложений' })
  @ApiResponse({ status: 404, description: 'Сделка не найдена' })
  @ApiParam({ name: 'id', description: 'ID сделки' })
  @Roles(['ADMIN', 'MANAGER', 'PARTNER', 'PARTNER_EMPLOYEE'])
  async getDealAttachments(@Param('id') id: string, @CurrentUser() currentUser: ExtendedUser) {
    return this.dealsService.getDealAttachments(id, currentUser);
  }

  @Post(':id/attachments')
  @ApiOperation({ summary: 'Добавление вложения к сделке' })
  @ApiResponse({ status: 201, description: 'Вложение успешно добавлено' })
  @ApiResponse({ status: 404, description: 'Сделка не найдена' })
  @ApiParam({ name: 'id', description: 'ID сделки' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @Roles(['ADMIN', 'MANAGER', 'PARTNER', 'PARTNER_EMPLOYEE'])
  async addDealAttachment(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() currentUser: User,
  ) {
    return this.dealsService.addDealAttachment(id, file, currentUser);
  }

  @Delete(':id/attachments/:attachmentId')
  @ApiOperation({ summary: 'Удаление вложения сделки' })
  @ApiResponse({ status: 200, description: 'Вложение успешно удалено' })
  @ApiResponse({ status: 404, description: 'Сделка или вложение не найдены' })
  @ApiParam({ name: 'id', description: 'ID сделки' })
  @ApiParam({ name: 'attachmentId', description: 'ID вложения' })
  @Roles(['ADMIN', 'MANAGER', 'PARTNER', 'PARTNER_EMPLOYEE'])
  async deleteDealAttachment(
    @Param('id') id: string,
    @Param('attachmentId') attachmentId: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.dealsService.deleteDealAttachment(id, attachmentId, currentUser);
  }
}
