import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { SearchService } from './search.service';

// Интерфейс для результатов поиска
interface SearchResult {
  total: number;
  results: Array<Record<string, unknown>>;
}

@ApiTags('search')
@Controller('search')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('contacts')
  @ApiOperation({ summary: 'Поиск контактов' })
  @ApiResponse({ status: 200, description: 'Список найденных контактов' })
  @ApiQuery({ name: 'query', required: true, type: String, description: 'Поисковый запрос' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество результатов на странице' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Смещение для пагинации' })
  @Roles(['ADMIN', 'MANAGER', 'PARTNER', 'PARTNER_EMPLOYEE'])
  async searchContacts(
    @Query('query') query: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @CurrentUser() currentUser?: User,
  ): Promise<SearchResult> {
    // Проверяем, что запрос не пустой
    if (!query || query.trim() === '') {
      return {
        total: 0,
        results: [],
      };
    }

    // Выполняем поиск
    const searchResults = await this.searchService.searchContacts(
      query,
      limit ? parseInt(limit, 10) : 10,
      offset ? parseInt(offset, 10) : 0,
    );

    // Возвращаем результаты
    return searchResults;
  }
}
