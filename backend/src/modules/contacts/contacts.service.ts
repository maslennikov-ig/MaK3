import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContactDto, UpdateContactDto } from './dto';
import { Contact, ContactSource, ClientStatus, User, ContactHistory, Comment, Attachment } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { FilesService } from '../files/files.service';

// Расширяем тип User для поддержки поля partnerId
interface ExtendedUser extends User {
  partnerId?: string;
}

@Injectable()
export class ContactsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly filesService: FilesService,
  ) {}

  /**
   * Создает новый контакт (клиент или лид)
   */
  async create(createContactDto: CreateContactDto, currentUser: ExtendedUser): Promise<Contact> {
    try {
      // Если пользователь не админ, то проверяем права доступа
      if (currentUser.role !== 'ADMIN') {
        // Если указан partnerId, проверяем, что пользователь имеет доступ к этому партнеру
        if (createContactDto.partnerId && 
            currentUser.role !== 'PARTNER' && 
            createContactDto.partnerId !== currentUser.partnerId) {
          throw new ForbiddenException('У вас нет прав для создания контакта для данного партнера');
        }

        // Если пользователь партнер, устанавливаем его ID как partnerId
        if (currentUser.role === 'PARTNER' && !createContactDto.partnerId) {
          createContactDto.partnerId = currentUser.id;
        }
      }

      // Создаем контакт
      return this.prisma.contact.create({
        data: {
          ...createContactDto,
          // Если assignedToId не указан, назначаем текущего пользователя
          assignedToId: createContactDto.assignedToId || currentUser.id,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Контакт с таким телефоном или email уже существует');
        }
      }
      throw error;
    }
  }

  /**
   * Получает список всех контактов с учетом прав доступа
   */
  async findAll(currentUser: ExtendedUser, params: {
    skip?: number;
    take?: number;
    isLead?: boolean;
    source?: ContactSource;
    statusClient?: ClientStatus;
    search?: string;
  } = {}): Promise<{ contacts: Contact[]; total: number }> {
    const { skip = 0, take = 50, isLead, source, statusClient, search } = params;

    // Формируем условия фильтрации
    const where: any = {};

    // Фильтр по типу (лид/клиент)
    if (isLead !== undefined) {
      where.isLead = isLead;
    }

    // Фильтр по источнику
    if (source) {
      where.source = source;
    }

    // Фильтр по статусу
    if (statusClient) {
      where.statusClient = statusClient;
    }

    // Поиск по имени, фамилии, телефону или email
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Применяем фильтрацию по правам доступа
    if (currentUser.role !== 'ADMIN') {
      if (currentUser.role === 'MANAGER') {
        // Менеджер видит только назначенные ему контакты
        where.assignedToId = currentUser.id;
      } else if (currentUser.role === 'PARTNER') {
        // Партнер видит только свои контакты
        where.partnerId = currentUser.id;
      } else if (currentUser.role === 'PARTNER_EMPLOYEE') {
        // Сотрудник партнера видит контакты своего партнера
        where.partnerId = currentUser.partnerId;
      }
    }

    // Получаем контакты с учетом фильтрации и пагинации
    const [contacts, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          partner: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
      }),
      this.prisma.contact.count({ where }),
    ]);

    return { contacts, total };
  }

  /**
   * Получает контакт по ID с учетом прав доступа
   */
  async findOne(id: string, currentUser: ExtendedUser): Promise<Contact> {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        partner: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        comments: true,
        attachments: true,
      },
    });

    if (!contact) {
      throw new NotFoundException(`Контакт с ID ${id} не найден`);
    }

    // Проверяем права доступа
    if (currentUser.role !== 'ADMIN') {
      if (
        (currentUser.role === 'MANAGER' && contact.assignedToId !== currentUser.id) ||
        (currentUser.role === 'PARTNER' && contact.partnerId !== currentUser.id) ||
        (currentUser.role === 'PARTNER_EMPLOYEE' && contact.partnerId !== currentUser.partnerId)
      ) {
        throw new ForbiddenException('У вас нет прав для просмотра данного контакта');
      }
    }

    return contact;
  }

  /**
   * Обновляет контакт по ID с учетом прав доступа
   */
  async update(id: string, updateContactDto: UpdateContactDto, currentUser: ExtendedUser): Promise<Contact> {
    // Сначала проверяем, существует ли контакт и есть ли права доступа
    const existingContact = await this.findOne(id, currentUser);

    try {
      // Проверяем дополнительные права для обновления
      if (currentUser.role !== 'ADMIN') {
        // Нельзя изменить partnerId, если пользователь не админ
        if (updateContactDto.partnerId && updateContactDto.partnerId !== existingContact.partnerId) {
          throw new ForbiddenException('У вас нет прав для изменения партнера контакта');
        }

        // Менеджер может обновлять только назначенные ему контакты
        if (currentUser.role === 'MANAGER' && existingContact.assignedToId !== currentUser.id) {
          throw new ForbiddenException('У вас нет прав для обновления данного контакта');
        }

        // Партнер может обновлять только свои контакты
        if (currentUser.role === 'PARTNER' && existingContact.partnerId !== currentUser.id) {
          throw new ForbiddenException('У вас нет прав для обновления данного контакта');
        }

        // Сотрудник партнера может обновлять только контакты своего партнера
        if (currentUser.role === 'PARTNER_EMPLOYEE' && existingContact.partnerId !== currentUser.partnerId) {
          throw new ForbiddenException('У вас нет прав для обновления данного контакта');
        }
      }

      // Обновляем контакт
      return this.prisma.contact.update({
        where: { id },
        data: updateContactDto,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Контакт с таким телефоном или email уже существует');
        }
      }
      throw error;
    }
  }

  /**
   * Удаляет контакт по ID с учетом прав доступа
   */
  async remove(id: string, currentUser: ExtendedUser): Promise<Contact> {
    // Сначала проверяем, существует ли контакт и есть ли права доступа
    const existingContact = await this.findOne(id, currentUser);

    // Проверяем дополнительные права для удаления
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Только администратор может удалять контакты');
    }

    // Удаляем контакт
    return this.prisma.contact.delete({
      where: { id },
    });
  }

  /**
   * Получает список всех возможных источников контактов
   */
  async getSources(): Promise<{ value: string; label: string }[]> {
    const sources = Object.values(ContactSource).map(value => ({
      value,
      label: this.getSourceLabel(value),
    }));
    
    return sources;
  }

  /**
   * Получает список всех возможных статусов клиентов
   */
  async getStatuses(): Promise<{ value: string; label: string }[]> {
    const statuses = Object.values(ClientStatus).map(value => ({
      value,
      label: this.getStatusLabel(value),
    }));
    
    return statuses;
  }

  /**
   * Получает человекочитаемую метку для источника контакта
   */
  private getSourceLabel(source: ContactSource): string {
    const labels = {
      [ContactSource.PARTNER_LEAD_WITH_HISTORY]: 'Лид от партнера с историей',
      [ContactSource.PARTNER_LEAD_NO_HISTORY]: 'Лид от партнера без истории',
      [ContactSource.OWN_LEAD_GEN]: 'Собственная генерация лидов',
      [ContactSource.COLD_BASE]: 'Холодная база',
      [ContactSource.EXTERNAL_UPLOAD]: 'Внешняя загрузка',
      [ContactSource.PURCHASED_BASE]: 'Купленная база',
    };

    return labels[source] || source;
  }

  /**
   * Получает человекочитаемую метку для статуса клиента
   */
  private getStatusLabel(status: ClientStatus): string {
    const labels = {
      [ClientStatus.NEW_NO_PROCESSING]: 'Новый, без обработки',
      [ClientStatus.PARTNER_LEAD]: 'Лид от партнера',
      [ClientStatus.AUCTION]: 'Аукцион',
      [ClientStatus.NOT_BOUGHT_COMPANY_PROCESSING]: 'Не выкуплен, в обработке компании',
      [ClientStatus.IN_PROGRESS]: 'В работе',
      [ClientStatus.SUCCESSFUL]: 'Успешно завершен',
      [ClientStatus.DECLINED]: 'Отклонен',
      [ClientStatus.ON_HOLD]: 'На удержании',
    };

    return labels[status] || status;
  }

  /**
   * Получает историю изменений контакта
   */
  async getHistory(id: string, currentUser: ExtendedUser): Promise<ContactHistory[]> {
    // Проверяем, существует ли контакт и есть ли права доступа
    await this.findOne(id, currentUser);

    // Получаем историю изменений
    const history = await this.prisma.contactHistory.findMany({
      where: { contactId: id },
      orderBy: { changedAt: 'desc' },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Преобразуем историю для фронтенда
    const formattedHistory = await Promise.all(
      history.map(async (record) => {
        // Получаем информацию о пользователе, внесшем изменения
        const user = await this.prisma.user.findUnique({
          where: { id: record.changedBy },
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        });

        return {
          id: record.id,
          field: record.field,
          oldValue: record.oldValue || '',
          newValue: record.newValue || '',
          timestamp: record.changedAt,
          user: user || { id: record.changedBy, firstName: 'Неизвестный', lastName: 'Пользователь' },
        };
      })
    );

    return formattedHistory as any;
  }

  /**
   * Получает комментарии к контакту
   */
  async getComments(id: string, currentUser: ExtendedUser): Promise<Comment[]> {
    // Проверяем, существует ли контакт и есть ли права доступа
    await this.findOne(id, currentUser);

    // Получаем комментарии
    const comments = await this.prisma.comment.findMany({
      where: { contactId: id },
      orderBy: { createdAt: 'desc' },
    });

    // Преобразуем комментарии для фронтенда
    const formattedComments = await Promise.all(
      comments.map(async (comment) => {
        // Получаем информацию о пользователе, создавшем комментарий
        const user = await this.prisma.user.findUnique({
          where: { id: comment.createdBy },
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        });

        return {
          id: comment.id,
          text: comment.content,
          createdAt: comment.createdAt,
          createdBy: user || { id: comment.createdBy, firstName: 'Неизвестный', lastName: 'Пользователь' },
        };
      })
    );

    return formattedComments as any;
  }

  /**
   * Добавляет комментарий к контакту
   */
  async addComment(id: string, text: string, currentUser: ExtendedUser): Promise<Comment> {
    // Проверяем, существует ли контакт и есть ли права доступа
    await this.findOne(id, currentUser);

    // Создаем комментарий
    const comment = await this.prisma.comment.create({
      data: {
        contactId: id,
        content: text,
        createdBy: currentUser.id,
      },
    });

    // Преобразуем комментарий для фронтенда
    const formattedComment = {
      id: comment.id,
      text: comment.content,
      createdAt: comment.createdAt,
      createdBy: {
        id: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
      },
    };

    return formattedComment as any;
  }

  /**
   * Получает вложения контакта
   */
  async getAttachments(id: string, currentUser: ExtendedUser): Promise<Attachment[]> {
    // Проверяем, существует ли контакт и есть ли права доступа
    await this.findOne(id, currentUser);

    // Получаем вложения
    const attachments = await this.prisma.attachment.findMany({
      where: { contactId: id },
      orderBy: { uploadedAt: 'desc' },
    });

    // Преобразуем вложения для фронтенда
    const formattedAttachments = await Promise.all(
      attachments.map(async (attachment) => {
        // Получаем информацию о пользователе, загрузившем файл
        const user = await this.prisma.user.findUnique({
          where: { id: attachment.uploadedBy },
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        });

        return {
          id: attachment.id,
          filename: attachment.originalName,
          path: attachment.path,
          mimeType: attachment.mimeType,
          size: attachment.size,
          createdAt: attachment.uploadedAt,
          createdBy: user || { id: attachment.uploadedBy, firstName: 'Неизвестный', lastName: 'Пользователь' },
        };
      })
    );

    return formattedAttachments as any;
  }

  /**
   * Добавляет вложение к контакту
   */
  async addAttachment(id: string, file: Express.Multer.File, currentUser: ExtendedUser): Promise<Attachment> {
    // Проверяем, существует ли контакт и есть ли права доступа
    await this.findOne(id, currentUser);

    // Загружаем файл в хранилище
    const fileInfo = await this.filesService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    // Создаем запись о вложении в БД
    const attachment = await this.prisma.attachment.create({
      data: {
        contactId: id,
        filename: fileInfo.filename,
        originalName: fileInfo.originalName,
        mimeType: fileInfo.mimeType,
        size: fileInfo.size,
        path: fileInfo.path,
        uploadedBy: currentUser.id,
      },
    });

    // Преобразуем вложение для фронтенда
    const formattedAttachment = {
      id: attachment.id,
      filename: attachment.originalName,
      path: attachment.path,
      mimeType: attachment.mimeType,
      size: attachment.size,
      createdAt: attachment.uploadedAt,
      createdBy: {
        id: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
      },
    };

    return formattedAttachment as any;
  }

  /**
   * Удаляет вложение контакта
   */
  async removeAttachment(id: string, attachmentId: string, currentUser: ExtendedUser): Promise<void> {
    // Проверяем, существует ли контакт и есть ли права доступа
    await this.findOne(id, currentUser);

    // Получаем информацию о вложении
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment || attachment.contactId !== id) {
      throw new NotFoundException(`Вложение с ID ${attachmentId} не найдено`);
    }

    // Удаляем файл из хранилища
    try {
      await this.filesService.deleteFile(attachment.filename);
    } catch (error) {
      // Если файл не найден в хранилище, просто логируем ошибку
      console.error(`Ошибка при удалении файла: ${error.message}`);
    }

    // Удаляем запись о вложении из БД
    await this.prisma.attachment.delete({
      where: { id: attachmentId },
    });
  }
}
