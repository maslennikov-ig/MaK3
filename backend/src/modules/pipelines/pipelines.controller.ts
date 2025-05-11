import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PipelinesService } from './pipelines.service';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { UpdatePipelineDto } from './dto/update-pipeline.dto';
import { CreatePipelineStageDto } from './dto/create-pipeline-stage.dto';
import { UpdatePipelineStageDto } from './dto/update-pipeline-stage.dto';

@ApiTags('pipelines')
@Controller('pipelines')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PipelinesController {
  constructor(private readonly pipelinesService: PipelinesService) {}

  @Post()
  @ApiOperation({ summary: 'Создание новой воронки продаж' })
  @ApiResponse({ status: 201, description: 'Воронка успешно создана' })
  @Roles(['ADMIN', 'MANAGER'])
  async createPipeline(@Body() createPipelineDto: CreatePipelineDto) {
    return this.pipelinesService.createPipeline(createPipelineDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получение всех воронок продаж' })
  @ApiResponse({ status: 200, description: 'Список воронок продаж' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean, description: 'Включать неактивные воронки' })
  @Roles(['ADMIN', 'MANAGER', 'PARTNER', 'PARTNER_EMPLOYEE'])
  async findAllPipelines(@Query('includeInactive') includeInactive?: boolean) {
    return this.pipelinesService.findAllPipelines(includeInactive === true);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение воронки продаж по ID' })
  @ApiResponse({ status: 200, description: 'Воронка продаж' })
  @ApiResponse({ status: 404, description: 'Воронка не найдена' })
  @ApiParam({ name: 'id', description: 'ID воронки продаж' })
  @Roles(['ADMIN', 'MANAGER', 'PARTNER', 'PARTNER_EMPLOYEE'])
  async findPipelineById(@Param('id') id: string) {
    return this.pipelinesService.findPipelineById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновление воронки продаж' })
  @ApiResponse({ status: 200, description: 'Воронка успешно обновлена' })
  @ApiResponse({ status: 404, description: 'Воронка не найдена' })
  @ApiParam({ name: 'id', description: 'ID воронки продаж' })
  @Roles(['ADMIN', 'MANAGER'])
  async updatePipeline(@Param('id') id: string, @Body() updatePipelineDto: UpdatePipelineDto) {
    return this.pipelinesService.updatePipeline(id, updatePipelineDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удаление воронки продаж' })
  @ApiResponse({ status: 200, description: 'Воронка успешно удалена или деактивирована' })
  @ApiResponse({ status: 404, description: 'Воронка не найдена' })
  @ApiParam({ name: 'id', description: 'ID воронки продаж' })
  @Roles(['ADMIN'])
  async deletePipeline(@Param('id') id: string) {
    return this.pipelinesService.deletePipeline(id);
  }

  // Эндпоинты для работы с этапами воронки

  @Post('stages')
  @ApiOperation({ summary: 'Создание нового этапа воронки' })
  @ApiResponse({ status: 201, description: 'Этап успешно создан' })
  @Roles(['ADMIN', 'MANAGER'])
  async createPipelineStage(@Body() createStageDto: CreatePipelineStageDto) {
    return this.pipelinesService.createPipelineStage(createStageDto);
  }

  @Get(':pipelineId/stages')
  @ApiOperation({ summary: 'Получение всех этапов воронки' })
  @ApiResponse({ status: 200, description: 'Список этапов воронки' })
  @ApiResponse({ status: 404, description: 'Воронка не найдена' })
  @ApiParam({ name: 'pipelineId', description: 'ID воронки продаж' })
  @Roles(['ADMIN', 'MANAGER', 'PARTNER', 'PARTNER_EMPLOYEE'])
  async findAllPipelineStages(@Param('pipelineId') pipelineId: string) {
    return this.pipelinesService.findAllPipelineStages(pipelineId);
  }

  @Get('stages/:id')
  @ApiOperation({ summary: 'Получение этапа воронки по ID' })
  @ApiResponse({ status: 200, description: 'Этап воронки' })
  @ApiResponse({ status: 404, description: 'Этап не найден' })
  @ApiParam({ name: 'id', description: 'ID этапа воронки' })
  @Roles(['ADMIN', 'MANAGER', 'PARTNER', 'PARTNER_EMPLOYEE'])
  async findPipelineStageById(@Param('id') id: string) {
    return this.pipelinesService.findPipelineStageById(id);
  }

  @Patch('stages/:id')
  @ApiOperation({ summary: 'Обновление этапа воронки' })
  @ApiResponse({ status: 200, description: 'Этап успешно обновлен' })
  @ApiResponse({ status: 404, description: 'Этап не найден' })
  @ApiParam({ name: 'id', description: 'ID этапа воронки' })
  @Roles(['ADMIN', 'MANAGER'])
  async updatePipelineStage(@Param('id') id: string, @Body() updateStageDto: UpdatePipelineStageDto) {
    return this.pipelinesService.updatePipelineStage(id, updateStageDto);
  }

  @Delete('stages/:id')
  @ApiOperation({ summary: 'Удаление этапа воронки' })
  @ApiResponse({ status: 200, description: 'Этап успешно удален' })
  @ApiResponse({ status: 404, description: 'Этап не найден или имеет связанные сделки' })
  @ApiParam({ name: 'id', description: 'ID этапа воронки' })
  @Roles(['ADMIN', 'MANAGER'])
  async deletePipelineStage(@Param('id') id: string) {
    return this.pipelinesService.deletePipelineStage(id);
  }

  @Post(':pipelineId/stages/reorder')
  @ApiOperation({ summary: 'Изменение порядка этапов воронки' })
  @ApiResponse({ status: 200, description: 'Порядок этапов успешно изменен' })
  @ApiResponse({ status: 404, description: 'Воронка или один из этапов не найден' })
  @ApiParam({ name: 'pipelineId', description: 'ID воронки продаж' })
  @Roles(['ADMIN', 'MANAGER'])
  async reorderPipelineStages(
    @Param('pipelineId') pipelineId: string,
    @Body() stageIds: string[],
  ) {
    return this.pipelinesService.reorderPipelineStages(pipelineId, stageIds);
  }
}
