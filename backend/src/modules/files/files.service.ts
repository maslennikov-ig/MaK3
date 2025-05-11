import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly localStoragePath: string;
  private readonly useS3Storage: boolean;

  constructor(private readonly prisma: PrismaService) {
    // Проверяем наличие переменных окружения для S3
    this.useS3Storage = process.env.USE_S3_STORAGE === 'true';
    
    if (this.useS3Storage) {
      this.bucketName = process.env.S3_BUCKET_NAME || 'mak3-files';
      
      // Инициализация S3 клиента для Yandex Object Storage (совместим с AWS S3)
      this.s3Client = new S3Client({
        region: process.env.S3_REGION || 'ru-central1',
        endpoint: process.env.S3_ENDPOINT || 'https://storage.yandexcloud.net',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      });
    } else {
      // Если S3 не используется, настраиваем локальное хранилище
      this.localStoragePath = process.env.LOCAL_STORAGE_PATH || path.join(os.tmpdir(), 'mak3-files');
      
      // Создаем директорию, если она не существует
      if (!fs.existsSync(this.localStoragePath)) {
        fs.mkdirSync(this.localStoragePath, { recursive: true });
      }
    }
  }

  /**
   * Загружает файл в хранилище (S3 или локальное)
   * @param file Буфер файла
   * @param originalName Оригинальное имя файла
   * @param mimeType MIME-тип файла
   * @returns Информация о загруженном файле
   */
  async uploadFile(file: Buffer, originalName: string, mimeType: string): Promise<{
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
  }> {
    const filename = `${uuidv4()}${path.extname(originalName)}`;
    const size = file.length;
    
    try {
      let filePath: string;
      
      if (this.useS3Storage) {
        // Загрузка в S3
        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.bucketName,
            Key: filename,
            Body: file,
            ContentType: mimeType,
          })
        );
        
        filePath = `${process.env.S3_PUBLIC_URL || `https://${this.bucketName}.storage.yandexcloud.net`}/${filename}`;
      } else {
        // Сохранение в локальное хранилище
        const localPath = path.join(this.localStoragePath, filename);
        fs.writeFileSync(localPath, file);
        
        filePath = `/api/files/${filename}`;
      }
      
      return {
        filename,
        originalName,
        mimeType,
        size,
        path: filePath,
      };
    } catch (error) {
      this.logger.error(`Ошибка при загрузке файла: ${error.message}`, error.stack);
      throw new Error(`Не удалось загрузить файл: ${error.message}`);
    }
  }

  /**
   * Удаляет файл из хранилища
   * @param filename Имя файла для удаления
   */
  async deleteFile(filename: string): Promise<void> {
    try {
      if (this.useS3Storage) {
        // Удаление из S3
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: filename,
          })
        );
      } else {
        // Удаление из локального хранилища
        const localPath = path.join(this.localStoragePath, filename);
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
        }
      }
    } catch (error) {
      this.logger.error(`Ошибка при удалении файла: ${error.message}`, error.stack);
      throw new Error(`Не удалось удалить файл: ${error.message}`);
    }
  }

  /**
   * Получает путь к локальному файлу
   * @param filename Имя файла
   * @returns Путь к файлу
   */
  getLocalFilePath(filename: string): string {
    if (this.useS3Storage) {
      throw new Error('Метод доступен только для локального хранилища');
    }
    
    return path.join(this.localStoragePath, filename);
  }
}
