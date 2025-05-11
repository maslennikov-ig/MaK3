import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { UpdatePipelineDto } from './dto/update-pipeline.dto';
import { CreatePipelineStageDto } from './dto/create-pipeline-stage.dto';
import { UpdatePipelineStageDto } from './dto/update-pipeline-stage.dto';
import { Pipeline, PipelineStage } from '@prisma/client';

@Injectable()
export class PipelinesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Создание новой воронки продаж
   */
  async createPipeline(createPipelineDto: CreatePipelineDto): Promise<Pipeline> {
    return this.prisma.pipeline.create({
      data: createPipelineDto,
    });
  }

  /**
   * Получение всех воронок продаж
   */
  async findAllPipelines(includeInactive = false): Promise<Pipeline[]> {
    const where = includeInactive ? {} : { isActive: true };
    return this.prisma.pipeline.findMany({
      where,
      include: {
        stages: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  /**
   * Получение воронки продаж по ID
   */
  async findPipelineById(id: string): Promise<Pipeline> {
    const pipeline = await this.prisma.pipeline.findUnique({
      where: { id },
      include: {
        stages: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!pipeline) {
      throw new NotFoundException(`Воронка продаж с ID ${id} не найдена`);
    }

    return pipeline;
  }

  /**
   * Обновление воронки продаж
   */
  async updatePipeline(id: string, updatePipelineDto: UpdatePipelineDto): Promise<Pipeline> {
    await this.findPipelineById(id); // Проверяем существование

    return this.prisma.pipeline.update({
      where: { id },
      data: updatePipelineDto,
      include: {
        stages: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  /**
   * Удаление воронки продаж
   */
  async deletePipeline(id: string): Promise<Pipeline> {
    await this.findPipelineById(id); // Проверяем существование

    // Проверяем, есть ли сделки, связанные с этапами этой воронки
    const stagesWithDeals = await this.prisma.pipelineStage.findMany({
      where: {
        pipelineId: id,
        deals: {
          some: {},
        },
      },
    });

    if (stagesWithDeals.length > 0) {
      // Вместо удаления, деактивируем воронку
      return this.prisma.pipeline.update({
        where: { id },
        data: { isActive: false },
      });
    }

    // Если нет связанных сделок, удаляем воронку и все её этапы
    return this.prisma.pipeline.delete({
      where: { id },
    });
  }

  /**
   * Создание нового этапа воронки
   */
  async createPipelineStage(createStageDto: CreatePipelineStageDto): Promise<PipelineStage> {
    // Проверяем существование воронки
    await this.findPipelineById(createStageDto.pipelineId);

    return this.prisma.pipelineStage.create({
      data: createStageDto,
    });
  }

  /**
   * Получение всех этапов воронки
   */
  async findAllPipelineStages(pipelineId: string): Promise<PipelineStage[]> {
    // Проверяем существование воронки
    await this.findPipelineById(pipelineId);

    return this.prisma.pipelineStage.findMany({
      where: { pipelineId },
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Получение этапа воронки по ID
   */
  async findPipelineStageById(id: string): Promise<PipelineStage> {
    const stage = await this.prisma.pipelineStage.findUnique({
      where: { id },
    });

    if (!stage) {
      throw new NotFoundException(`Этап воронки с ID ${id} не найден`);
    }

    return stage;
  }

  /**
   * Обновление этапа воронки
   */
  async updatePipelineStage(id: string, updateStageDto: UpdatePipelineStageDto): Promise<PipelineStage> {
    await this.findPipelineStageById(id); // Проверяем существование

    return this.prisma.pipelineStage.update({
      where: { id },
      data: updateStageDto,
    });
  }

  /**
   * Удаление этапа воронки
   */
  async deletePipelineStage(id: string): Promise<PipelineStage> {
    const stage = await this.findPipelineStageById(id); // Проверяем существование

    // Проверяем, есть ли сделки, связанные с этим этапом
    const dealsCount = await this.prisma.deal.count({
      where: { stageId: id },
    });

    if (dealsCount > 0) {
      throw new NotFoundException(
        `Невозможно удалить этап, так как с ним связано ${dealsCount} сделок. Переместите сделки на другой этап перед удалением.`,
      );
    }

    return this.prisma.pipelineStage.delete({
      where: { id },
    });
  }

  /**
   * Изменение порядка этапов воронки
   */
  async reorderPipelineStages(pipelineId: string, stageIds: string[]): Promise<PipelineStage[]> {
    // Проверяем существование воронки
    await this.findPipelineById(pipelineId);

    // Проверяем, что все указанные этапы существуют и принадлежат данной воронке
    const stages = await this.prisma.pipelineStage.findMany({
      where: { pipelineId },
    });

    const stageMap = new Map(stages.map(stage => [stage.id, stage]));
    
    // Проверяем, что все ID в списке stageIds принадлежат этапам данной воронки
    for (const stageId of stageIds) {
      if (!stageMap.has(stageId)) {
        throw new NotFoundException(`Этап с ID ${stageId} не найден или не принадлежит воронке ${pipelineId}`);
      }
    }

    // Обновляем порядок этапов
    const updates = stageIds.map((stageId, index) => 
      this.prisma.pipelineStage.update({
        where: { id: stageId },
        data: { order: index },
      })
    );

    await this.prisma.$transaction(updates);

    // Возвращаем обновленный список этапов
    return this.prisma.pipelineStage.findMany({
      where: { pipelineId },
      orderBy: { order: 'asc' },
    });
  }
}
