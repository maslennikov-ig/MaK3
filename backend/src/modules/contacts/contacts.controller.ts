import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseUUIDPipe, UseInterceptors, UploadedFile, Res, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContactsService } from './contacts.service';
import { ContactsCsvService } from './contacts-csv.service';
import { CreateContactDto, UpdateContactDto, ImportContactsDto, CreateCommentDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, ContactSource, ClientStatus } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';

// Расширяем тип User для поддержки поля partnerId
interface ExtendedUser extends User {
  partnerId?: string;
}

@ApiTags('contacts')
@Controller('contacts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContactsController {
  constructor(
    private readonly contactsService: ContactsService,
    private readonly contactsCsvService: ContactsCsvService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Создать новый контакт' })
  @ApiResponse({ status: 201, description: 'Контакт успешно создан' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @Roles(['ADMIN', 'MANAGER', 'PARTNER', 'PARTNER_EMPLOYEE'])
  create(@Body() createContactDto: CreateContactDto, @CurrentUser() user: ExtendedUser) {
    return this.contactsService.create(createContactDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список всех контактов' })
  @ApiResponse({ status: 200, description: 'Список контактов получен' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'isLead', required: false, type: Boolean })
  @ApiQuery({ name: 'source', required: false, enum: ContactSource })
  @ApiQuery({ name: 'statusClient', required: false, enum: ClientStatus })
  @ApiQuery({ name: 'search', required: false, type: String })
  @Roles(['ADMIN', 'MANAGER', 'PARTNER', 'PARTNER_EMPLOYEE'])
  findAll(
    @CurrentUser() user: ExtendedUser,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('isLead') isLead?: boolean,
    @Query('source') source?: ContactSource,
    @Query('statusClient') statusClient?: ClientStatus,
    @Query('search') search?: string,
  ) {
    return this.contactsService.findAll(user, {
      skip: skip ? +skip : undefined,
      take: take ? +take : undefined,
      isLead,
      source,
      statusClient,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить контакт по ID' })
  @ApiResponse({ status: 200, description: 'Контакт найден' })
  @ApiResponse({ status: 404, description: 'Контакт не найден' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @ApiParam({ name: 'id', type: String, description: 'ID контакта' })
  @Roles(['ADMIN', 'MANAGER', 'PARTNER', 'PARTNER_EMPLOYEE'])
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: ExtendedUser) {
    return this.contactsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить контакт по ID' })
  @ApiResponse({ status: 200, description: 'Контакт обновлен' })
  @ApiResponse({ status: 404, description: 'Контакт не найден' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @ApiParam({ name: 'id', type: String, description: 'ID контакта' })
  @Roles(['ADMIN', 'MANAGER', 'PARTNER', 'PARTNER_EMPLOYEE'])
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateContactDto: UpdateContactDto,
    @CurrentUser() user: ExtendedUser,
  ) {
    return this.contactsService.update(id, updateContactDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить контакт по ID' })
  @ApiResponse({ status: 200, description: 'Контакт удален' })
  @ApiResponse({ status: 404, description: 'Контакт не найден' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @ApiParam({ name: 'id', type: String, description: 'ID контакта' })
  @Roles(['ADMIN'])
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: ExtendedUser) {
    return this.contactsService.remove(id, user);
  }

  @Get('sources/list')
  @ApiOperation({ summary: 'Получить список всех возможных источников контактов' })
  @ApiResponse({ status: 200, description: 'Список источников получен' })
  @Roles(['ADMIN', 'MANAGER', 'PARTNER', 'PARTNER_EMPLOYEE'])
  getSources() {
    return this.contactsService.getSources();
  }

  @Get('statuses/list')
  @ApiOperation({ summary: 'Получить список всех возможных статусов клиентов' })
  @ApiResponse({ status: 200, description: 'Список статусов получен' })
  @Roles(['ADMIN', 'MANAGER', 'PARTNER', 'PARTNER_EMPLOYEE'])
  getStatuses() {
    return this.contactsService.getStatuses();
  }

  @Post('upload-csv')
  @ApiOperation({ summary: 'Загрузить контакты из CSV файла' })
  @ApiResponse({ status: 201, description: 'Контакты успешно импортированы' })
  @ApiResponse({ status: 400, description: 'Неверный формат файла или данных' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSV файл с контактами',
        },
        defaultSource: {
          type: 'string',
          enum: Object.values(ContactSource),
          description: 'Источник контактов по умолчанию',
        },
        defaultStatus: {
          type: 'string',
          enum: Object.values(ClientStatus),
          description: 'Статус контактов по умолчанию',
        },
        isLead: {
          type: 'boolean',
          description: 'Являются ли импортируемые контакты лидами',
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN', 'MANAGER'])
  @UseInterceptors(FileInterceptor('file'))
  async uploadCsv(
    @UploadedFile() file: Express.Multer.File,
    @Body() importDto: ImportContactsDto,
    @CurrentUser() user: ExtendedUser,
  ) {
    if (!file) {
      throw new BadRequestException('Файл не найден');
    }

    // Проверяем тип файла
    const isCsv = file.mimetype === 'text/csv' || file.originalname.endsWith('.csv');
    const isExcel = file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                   file.mimetype === 'application/vnd.ms-excel' || 
                   file.originalname.endsWith('.xlsx') || 
                   file.originalname.endsWith('.xls');

    if (!isCsv && !isExcel) {
      throw new BadRequestException('Поддерживаются только файлы CSV и Excel (XLSX/XLS)');
    }

    // Парсим файл
    const rows = isCsv
      ? this.contactsCsvService.parseCsvFile(file.buffer)
      : await this.contactsCsvService.parseExcelFile(file.buffer);

    // Преобразуем строки в DTO
    const contactDtos = this.contactsCsvService.mapRowsToContactDtos(
      rows,
      importDto.defaultSource,
      importDto.defaultStatus,
      importDto.isLead,
    );

    // Импортируем контакты
    const result = await this.contactsCsvService.importContacts(contactDtos, user);

    return result;
  }

  @Get('export-csv')
  @ApiOperation({ summary: 'Экспортировать контакты в CSV файл' })
  @ApiResponse({ status: 200, description: 'CSV файл с контактами' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @ApiQuery({ name: 'isLead', required: false, type: Boolean })
  @ApiQuery({ name: 'source', required: false, enum: ContactSource })
  @ApiQuery({ name: 'statusClient', required: false, enum: ClientStatus })
  @ApiQuery({ name: 'search', required: false, type: String })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN', 'MANAGER', 'PARTNER', 'PARTNER_EMPLOYEE'])
  async exportCsv(
    @Res() res: Response,
    @CurrentUser() user: ExtendedUser,
    @Query('isLead') isLead?: boolean,
    @Query('source') source?: ContactSource,
    @Query('statusClient') statusClient?: ClientStatus,
    @Query('search') search?: string,
  ) {
    // Получаем контакты с учетом фильтров и прав доступа
    const { contacts } = await this.contactsService.findAll(user, {
      isLead,
      source,
      statusClient,
      search,
    });

    // Экспортируем контакты в CSV
    const csv = await this.contactsCsvService.exportContactsToCsv(contacts);

    // Отправляем файл
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
    return res.send(csv);
  }

  @Get('export-excel')
  @ApiOperation({ summary: 'Экспортировать контакты в Excel файл' })
  @ApiResponse({ status: 200, description: 'Excel файл с контактами' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @ApiQuery({ name: 'isLead', required: false, type: Boolean })
  @ApiQuery({ name: 'source', required: false, enum: ContactSource })
  @ApiQuery({ name: 'statusClient', required: false, enum: ClientStatus })
  @ApiQuery({ name: 'search', required: false, type: String })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN', 'MANAGER', 'PARTNER', 'PARTNER_EMPLOYEE'])
  async exportExcel(
    @Res() res: Response,
    @CurrentUser() user: ExtendedUser,
    @Query('isLead') isLead?: boolean,
    @Query('source') source?: ContactSource,
    @Query('statusClient') statusClient?: ClientStatus,
    @Query('search') search?: string,
  ) {
    // Получаем контакты с учетом фильтров и прав доступа
    const { contacts } = await this.contactsService.findAll(user, {
      isLead,
      source,
      statusClient,
      search,
    });

    // Экспортируем контакты в Excel
    const excelBuffer = await this.contactsCsvService.exportContactsToExcel(contacts);

    // Отправляем файл
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=contacts.xlsx');
    return res.send(excelBuffer);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Получить историю изменений контакта' })
  @ApiResponse({ status: 200, description: 'История изменений получена' })
  @ApiResponse({ status: 404, description: 'Контакт не найден' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @ApiParam({ name: 'id', type: String, description: 'ID контакта' })
  @Roles(['ADMIN', 'MANAGER', 'PARTNER', 'PARTNER_EMPLOYEE'])
  getHistory(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: ExtendedUser) {
    return this.contactsService.getHistory(id, user);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Получить комментарии к контакту' })
  @ApiResponse({ status: 200, description: 'Комментарии получены' })
  @ApiResponse({ status: 404, description: 'Контакт не найден' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @ApiParam({ name: 'id', type: String, description: 'ID контакта' })
  @Roles(['ADMIN', 'MANAGER', 'PARTNER', 'PARTNER_EMPLOYEE'])
  getComments(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: ExtendedUser) {
    return this.contactsService.getComments(id, user);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Добавить комментарий к контакту' })
  @ApiResponse({ status: 201, description: 'Комментарий добавлен' })
  @ApiResponse({ status: 404, description: 'Контакт не найден' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @ApiParam({ name: 'id', type: String, description: 'ID контакта' })
  @Roles(['ADMIN', 'MANAGER', 'PARTNER', 'PARTNER_EMPLOYEE'])
  addComment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: ExtendedUser,
  ) {
    return this.contactsService.addComment(id, createCommentDto.text, user);
  }

  @Get(':id/attachments')
  @ApiOperation({ summary: 'Получить вложения контакта' })
  @ApiResponse({ status: 200, description: 'Вложения получены' })
  @ApiResponse({ status: 404, description: 'Контакт не найден' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @ApiParam({ name: 'id', type: String, description: 'ID контакта' })
  @Roles(['ADMIN', 'MANAGER', 'PARTNER', 'PARTNER_EMPLOYEE'])
  getAttachments(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: ExtendedUser) {
    return this.contactsService.getAttachments(id, user);
  }

  @Post(':id/attachments')
  @ApiOperation({ summary: 'Добавить вложение к контакту' })
  @ApiResponse({ status: 201, description: 'Вложение добавлено' })
  @ApiResponse({ status: 404, description: 'Контакт не найден' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @ApiParam({ name: 'id', type: String, description: 'ID контакта' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Файл для загрузки',
        },
      },
    },
  })
  @Roles(['ADMIN', 'MANAGER', 'PARTNER', 'PARTNER_EMPLOYEE'])
  @UseInterceptors(FileInterceptor('file'))
  async addAttachment(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: ExtendedUser,
  ) {
    if (!file) {
      throw new BadRequestException('Файл не найден');
    }
    
    return this.contactsService.addAttachment(id, file, user);
  }

  @Delete(':id/attachments/:attachmentId')
  @ApiOperation({ summary: 'Удалить вложение контакта' })
  @ApiResponse({ status: 200, description: 'Вложение удалено' })
  @ApiResponse({ status: 404, description: 'Контакт или вложение не найдены' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @ApiParam({ name: 'id', type: String, description: 'ID контакта' })
  @ApiParam({ name: 'attachmentId', type: String, description: 'ID вложения' })
  @Roles(['ADMIN', 'MANAGER', 'PARTNER', 'PARTNER_EMPLOYEE'])
  removeAttachment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('attachmentId', ParseUUIDPipe) attachmentId: string,
    @CurrentUser() user: ExtendedUser,
  ) {
    return this.contactsService.removeAttachment(id, attachmentId, user);
  }
}
