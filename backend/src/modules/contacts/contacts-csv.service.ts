import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Contact, ContactSource, ClientStatus, User } from '@prisma/client';
import * as Papa from 'papaparse';
import * as ExcelJS from 'exceljs';
import { CreateContactDto } from './dto';

@Injectable()
export class ContactsCsvService {
  private readonly logger = new Logger(ContactsCsvService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Парсит CSV-файл и возвращает массив объектов
   */
  parseCsvFile(fileBuffer: Buffer): Record<string, string>[] {
    try {
      const csvString = fileBuffer.toString();
      const result = Papa.parse<Record<string, string>>(csvString, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim().toLowerCase(),
      });

      if (result.errors && result.errors.length > 0) {
        this.logger.error('Ошибки при парсинге CSV-файла', result.errors);
        throw new BadRequestException('Ошибка при парсинге CSV-файла: ' + result.errors[0].message);
      }

      return result.data;
    } catch (error) {
      this.logger.error('Ошибка при парсинге CSV-файла', error);
      throw new BadRequestException('Ошибка при парсинге CSV-файла: ' + error.message);
    }
  }

  /**
   * Парсит Excel-файл и возвращает массив объектов
   */
  async parseExcelFile(fileBuffer: Buffer): Promise<Record<string, string>[]> {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(fileBuffer);
      
      // Получаем первый лист
      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new BadRequestException('Excel-файл не содержит листов');
      }
      
      // Проверяем, что есть данные
      if (worksheet.rowCount < 2) {
        throw new BadRequestException('Excel-файл не содержит данных или заголовков');
      }
      
      // Получаем заголовки (первая строка)
      const headers: string[] = [];
      worksheet.getRow(1).eachCell((cell, colNumber) => {
        headers[colNumber - 1] = String(cell.value).trim().toLowerCase();
      });
      
      // Преобразуем остальные строки в объекты
      const result: Record<string, string>[] = [];
      
      // Начинаем со второй строки (индекс 2)
      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        const obj: Record<string, string> = {};
        
        // Если строка пустая, пропускаем
        if (row.cellCount === 0) continue;
        
        row.eachCell((cell, colNumber) => {
          const headerIndex = colNumber - 1;
          if (headerIndex < headers.length) {
            const headerName = headers[headerIndex];
            obj[headerName] = String(cell.value || '');
          }
        });
        
        // Добавляем объект только если он не пустой
        if (Object.keys(obj).length > 0) {
          result.push(obj);
        }
      }
      
      return result;
    } catch (error) {
      this.logger.error('Ошибка при парсинге Excel-файла', error);
      throw new BadRequestException('Ошибка при парсинге Excel-файла: ' + error.message);
    }
  }

  /**
   * Преобразует сырые данные из CSV/Excel в объекты CreateContactDto
   */
  mapRowsToContactDtos(
    rows: Record<string, string>[],
    defaultSource: ContactSource = ContactSource.EXTERNAL_UPLOAD,
    defaultStatus: ClientStatus = ClientStatus.NEW_NO_PROCESSING,
    isLead: boolean = true,
  ): CreateContactDto[] {
    return rows.map((row) => {
      // Маппинг полей из CSV/Excel в поля DTO
      const dto: CreateContactDto = {
        firstName: row.firstname || row.firstName || row['first name'] || row['имя'] || '',
        lastName: row.lastname || row.lastName || row['last name'] || row['фамилия'] || '',
        middleName: row.middlename || row.middleName || row['middle name'] || row['отчество'] || undefined,
        phone: row.phone || row['телефон'] || '',
        email: row.email || row['почта'] || row['email'] || undefined,
        notes: row.notes || row.note || row['примечания'] || row['комментарий'] || undefined,
        source: defaultSource,
        statusClient: defaultStatus,
        isLead: isLead,
      };

      // Проверка обязательных полей
      if (!dto.firstName || !dto.lastName || !dto.phone) {
        throw new BadRequestException(
          `Строка с данными не содержит обязательных полей (имя, фамилия, телефон): ${JSON.stringify(row)}`,
        );
      }

      return dto;
    });
  }

  /**
   * Импортирует контакты из CSV/Excel-файла
   */
  async importContacts(
    dtos: CreateContactDto[],
    currentUser: User,
  ): Promise<{ total: number; created: number; errors: string[] }> {
    const result = {
      total: dtos.length,
      created: 0,
      errors: [],
    };

    // Используем транзакцию для атомарности операции
    await this.prisma.$transaction(async (prisma) => {
      for (const dto of dtos) {
        try {
          // Проверяем, существует ли контакт с таким телефоном или email
          const existingContact = await prisma.contact.findFirst({
            where: {
              OR: [
                { phone: dto.phone },
                ...(dto.email ? [{ email: dto.email }] : []),
              ],
            },
          });

          if (existingContact) {
            result.errors.push(
              `Контакт с телефоном ${dto.phone} или email ${dto.email} уже существует`,
            );
            continue;
          }

          // Создаем контакт
          await prisma.contact.create({
            data: {
              ...dto,
              // Если не указан assignedToId, назначаем текущего пользователя
              assignedToId: dto.assignedToId || currentUser.id,
              // Если пользователь партнер, устанавливаем его ID как partnerId
              partnerId: dto.partnerId || (currentUser.role === 'PARTNER' ? currentUser.id : undefined),
            },
          });

          result.created++;
        } catch (error) {
          this.logger.error('Ошибка при импорте контакта', error);
          result.errors.push(`Ошибка при импорте контакта: ${error.message}`);
        }
      }
    });

    return result;
  }

  /**
   * Экспортирует контакты в CSV-формат
   */
  async exportContactsToCsv(contacts: Contact[]): Promise<string> {
    // Преобразуем контакты в плоскую структуру для CSV
    type CsvContact = {
      id: string;
      firstName: string;
      lastName: string;
      middleName: string;
      phone: string;
      email: string;
      source: string;
      statusClient: string;
      isLead: string;
      notes: string;
      createdAt: string;
      updatedAt: string;
    };
    
    const data: CsvContact[] = contacts.map((contact) => ({
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      middleName: contact.middleName || '',
      phone: contact.phone,
      email: contact.email || '',
      source: contact.source,
      statusClient: contact.statusClient,
      isLead: contact.isLead ? 'Да' : 'Нет',
      notes: contact.notes || '',
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString(),
    }));

    // Генерируем CSV
    const csv = Papa.unparse(data, {
      header: true,
      delimiter: ',',
    });

    return csv;
  }

  /**
   * Экспортирует контакты в Excel-формат
   */
  async exportContactsToExcel(contacts: Contact[]): Promise<Buffer> {
    // Создаем новую рабочую книгу
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Контакты');
    
    // Определяем заголовки
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 36 },
      { header: 'Имя', key: 'firstName', width: 15 },
      { header: 'Фамилия', key: 'lastName', width: 15 },
      { header: 'Отчество', key: 'middleName', width: 15 },
      { header: 'Телефон', key: 'phone', width: 15 },
      { header: 'Email', key: 'email', width: 20 },
      { header: 'Источник', key: 'source', width: 15 },
      { header: 'Статус', key: 'statusClient', width: 20 },
      { header: 'Лид', key: 'isLead', width: 5 },
      { header: 'Примечания', key: 'notes', width: 30 },
      { header: 'Создан', key: 'createdAt', width: 20 },
      { header: 'Обновлен', key: 'updatedAt', width: 20 },
    ];
    
    // Добавляем стиль для заголовков
    worksheet.getRow(1).font = { bold: true };
    
    // Добавляем данные
    contacts.forEach(contact => {
      worksheet.addRow({
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        middleName: contact.middleName || '',
        phone: contact.phone,
        email: contact.email || '',
        source: contact.source,
        statusClient: contact.statusClient,
        isLead: contact.isLead ? 'Да' : 'Нет',
        notes: contact.notes || '',
        createdAt: contact.createdAt.toISOString(),
        updatedAt: contact.updatedAt.toISOString(),
      });
    });
    
    // Применяем автофильтр к заголовкам
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: 12 },
    };
    
    // Записываем в буфер
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as Buffer;
  }
}
