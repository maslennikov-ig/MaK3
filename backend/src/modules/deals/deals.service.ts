import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { CreateDealCommentDto } from './dto/create-comment.dto';
import { Deal, DealComment, DealAttachment, DealHistory, User } from '@prisma/client';
import { FilesService } from '../files/files.service';

// Расширенный интерфейс пользователя с полем partnerId
interface ExtendedUser extends User {
  partnerId?: string | null;
}

@Injectable()
export class DealsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly filesService: FilesService,
  ) {}

  /**
   * Создание новой сделки
   */
  async createDeal(createDealDto: CreateDealDto, currentUser: ExtendedUser): Promise<Deal> {
    // Проверяем существование контакта
    const contact = await this.prisma.contact.findUnique({
      where: { id: createDealDto.contactId },
    });

    if (!contact) {
      throw new NotFoundException(`Контакт с ID ${createDealDto.contactId} не найден`);
    }

    // Проверяем существование этапа воронки
    const stage = await this.prisma.pipelineStage.findUnique({
      where: { id: createDealDto.stageId },
    });

    if (!stage) {
      throw new NotFoundException(`Этап воронки с ID ${createDealDto.stageId} не найден`);
    }

    // Создаем сделку
    return this.prisma.deal.create({
      data: {
        ...createDealDto,
        // Если не указан ответственный, назначаем текущего пользователя
        assignedToId: createDealDto.assignedToId || currentUser.id,
      },
    });
  }

  /**
   * Получение всех сделок с фильтрацией и пагинацией
   */
  async findAllDeals(
    currentUser: ExtendedUser,
    page = 1,
    limit = 10,
    stageId?: string,
    contactId?: string,
    assignedToId?: string,
    partnerId?: string,
  ): Promise<{ deals: Deal[]; total: number }> {
    const skip = (page - 1) * limit;

    // Формируем условия фильтрации
    const where: Record<string, unknown> = {};

    if (stageId) {
      where.stageId = stageId;
    }

    if (contactId) {
      where.contactId = contactId;
    }

    if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    if (partnerId) {
      where.partnerId = partnerId;
    }

    // Если пользователь не админ и не менеджер, показываем только его сделки или сделки его партнера
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
      if (currentUser.role === 'PARTNER' || currentUser.role === 'PARTNER_EMPLOYEE') {
        where.partnerId = currentUser.partnerId;
      } else {
        where.assignedToId = currentUser.id;
      }
    }

    // Получаем общее количество сделок
    const total = await this.prisma.deal.count({ where });

    // Получаем сделки с пагинацией
    const deals = await this.prisma.deal.findMany({
      where,
      skip,
      take: limit,
      include: {
        stage: true,
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            phone: true,
            email: true,
          },
        },
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
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return { deals, total };
  }

  /**
   * Получение сделки по ID
   */
  async findDealById(id: string, currentUser: ExtendedUser): Promise<Deal> {
    const deal = await this.prisma.deal.findUnique({
      where: { id },
      include: {
        stage: {
          include: {
            pipeline: true,
          },
        },
        contact: true,
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
          },
        },
      },
    });

    if (!deal) {
      throw new NotFoundException(`Сделка с ID ${id} не найдена`);
    }

    // Проверяем права доступа
    this.checkDealAccess(deal, currentUser);

    return deal;
  }

  /**
   * Обновление сделки
   */
  async updateDeal(id: string, updateDealDto: UpdateDealDto, currentUser: ExtendedUser): Promise<Deal> {
    // Получаем текущую сделку
    const currentDeal = await this.findDealById(id, currentUser);

    // Проверяем существование этапа воронки, если он указан
    if (updateDealDto.stageId && updateDealDto.stageId !== currentDeal.stageId) {
      const stage = await this.prisma.pipelineStage.findUnique({
        where: { id: updateDealDto.stageId },
      });

      if (!stage) {
        throw new NotFoundException(`Этап воронки с ID ${updateDealDto.stageId} не найден`);
      }
    }

    // Проверяем существование контакта, если он указан
    if (updateDealDto.contactId && updateDealDto.contactId !== currentDeal.contactId) {
      const contact = await this.prisma.contact.findUnique({
        where: { id: updateDealDto.contactId },
      });

      if (!contact) {
        throw new NotFoundException(`Контакт с ID ${updateDealDto.contactId} не найден`);
      }
    }

    // Создаем записи в истории изменений
    const historyRecords = [];
    for (const [key, value] of Object.entries(updateDealDto)) {
      if (value !== undefined && currentDeal[key as keyof Deal] !== value) {
        historyRecords.push({
          dealId: id,
          field: key,
          oldValue: String(currentDeal[key as keyof Deal] || ''),
          newValue: String(value),
          changedBy: currentUser.id,
        });
      }
    }

    // Обновляем сделку и добавляем записи в историю
    const [updatedDeal] = await this.prisma.$transaction([
      this.prisma.deal.update({
        where: { id },
        data: updateDealDto,
        include: {
          stage: true,
          contact: true,
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
            },
          },
        },
      }),
      ...historyRecords.map(record => this.prisma.dealHistory.create({ data: record })),
    ]);

    return updatedDeal;
  }

  /**
   * Удаление сделки
   */
  async deleteDeal(id: string, currentUser: ExtendedUser): Promise<Deal> {
    // Проверяем существование и права доступа
    await this.findDealById(id, currentUser);

    // Проверяем, есть ли у пользователя права на удаление
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
      throw new BadRequestException('У вас нет прав на удаление сделок');
    }

    // Удаляем сделку и все связанные данные
    return this.prisma.deal.delete({
      where: { id },
    });
  }

  /**
   * Получение истории изменений сделки
   */
  async getDealHistory(id: string, currentUser: ExtendedUser): Promise<DealHistory[]> {
    // Проверяем существование и права доступа
    await this.findDealById(id, currentUser);

    return this.prisma.dealHistory.findMany({
      where: { dealId: id },
      orderBy: { changedAt: 'desc' },
      include: {
        deal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  /**
   * Получение комментариев к сделке
   */
  async getDealComments(id: string, currentUser: ExtendedUser): Promise<DealComment[]> {
    // Проверяем существование и права доступа
    await this.findDealById(id, currentUser);

    return this.prisma.dealComment.findMany({
      where: { dealId: id },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Добавление комментария к сделке
   */
  async addDealComment(id: string, commentDto: CreateDealCommentDto, currentUser: ExtendedUser): Promise<DealComment> {
    // Проверяем существование и права доступа
    await this.findDealById(id, currentUser);

    return this.prisma.dealComment.create({
      data: {
        dealId: id,
        content: commentDto.content,
        createdBy: currentUser.id,
      },
    });
  }

  /**
   * Получение вложений сделки
   */
  async getDealAttachments(id: string, currentUser: ExtendedUser): Promise<DealAttachment[]> {
    // Проверяем существование и права доступа
    await this.findDealById(id, currentUser);

    return this.prisma.dealAttachment.findMany({
      where: { dealId: id },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  /**
   * Добавление вложения к сделке
   */
  async addDealAttachment(
    id: string,
    file: Express.Multer.File,
    currentUser: ExtendedUser,
  ): Promise<DealAttachment> {
    // Проверяем существование и права доступа
    await this.findDealById(id, currentUser);

    // Загружаем файл
    const fileInfo = await this.filesService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    // Создаем запись о вложении
    return this.prisma.dealAttachment.create({
      data: {
        dealId: id,
        filename: fileInfo.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: fileInfo.path,
        uploadedBy: currentUser.id,
      },
    });
  }

  /**
   * Удаление вложения сделки
   */
  async deleteDealAttachment(dealId: string, attachmentId: string, currentUser: ExtendedUser): Promise<DealAttachment> {
    // Проверяем существование и права доступа к сделке
    await this.findDealById(dealId, currentUser);

    // Проверяем существование вложения
    const attachment = await this.prisma.dealAttachment.findFirst({
      where: {
        id: attachmentId,
        dealId,
      },
    });

    if (!attachment) {
      throw new NotFoundException(`Вложение с ID ${attachmentId} не найдено для сделки ${dealId}`);
    }

    // Удаляем файл
    await this.filesService.deleteFile(attachment.filename);

    // Удаляем запись о вложении
    return this.prisma.dealAttachment.delete({
      where: { id: attachmentId },
    });
  }

  /**
   * Проверка прав доступа к сделке
   */
  private checkDealAccess(deal: Deal, currentUser: ExtendedUser): void {
    // Админы и менеджеры имеют доступ ко всем сделкам
    if (currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER') {
      return;
    }

    // Партнеры имеют доступ к своим сделкам
    if (
      (currentUser.role === 'PARTNER' || currentUser.role === 'PARTNER_EMPLOYEE') &&
      deal.partnerId === currentUser.partnerId
    ) {
      return;
    }

    // Обычные пользователи имеют доступ только к своим сделкам
    if (deal.assignedToId === currentUser.id) {
      return;
    }

    throw new BadRequestException('У вас нет доступа к этой сделке');
  }
}
