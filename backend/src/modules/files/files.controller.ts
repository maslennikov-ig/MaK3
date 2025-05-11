import { Controller, Get, Param, Res, NotFoundException, UseGuards, StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('files')
@Controller('files')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get(':filename')
  @ApiOperation({ summary: 'Получить файл по имени' })
  @ApiResponse({ status: 200, description: 'Файл найден и отправлен' })
  @ApiResponse({ status: 404, description: 'Файл не найден' })
  @ApiParam({ name: 'filename', description: 'Имя файла' })
  @Roles(['ADMIN', 'MANAGER', 'PARTNER', 'PARTNER_EMPLOYEE'])
  async getFile(@Param('filename') filename: string, @Res({ passthrough: true }) res: Response) {
    try {
      const filePath = this.filesService.getLocalFilePath(filename);
      
      if (!fs.existsSync(filePath)) {
        throw new NotFoundException(`Файл ${filename} не найден`);
      }
      
      const fileStream = fs.createReadStream(filePath);
      const mimeType = this.getMimeType(path.extname(filename));
      
      res.set({
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${filename}"`,
      });
      
      return new StreamableFile(fileStream);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Не удалось получить файл: ${error.message}`);
    }
  }

  /**
   * Определяет MIME-тип по расширению файла
   * @param extension Расширение файла
   * @returns MIME-тип
   */
  private getMimeType(extension: string): string {
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
    };
    
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }
}
