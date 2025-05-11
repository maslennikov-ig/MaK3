import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';
import { SearchHit, SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import { PrismaService } from '../prisma/prisma.service';
import { Contact } from '@prisma/client';

// Интерфейс для результатов поиска
interface SearchResult {
  total: number;
  results: Array<Record<string, unknown>>;
}

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private readonly esClient: Client;
  private readonly indexName = 'contacts';

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    // Инициализация клиента Elasticsearch
    this.esClient = new Client({
      node: this.configService.get<string>('ELASTICSEARCH_NODE', 'http://localhost:9200'),
      auth: {
        username: this.configService.get<string>('ELASTICSEARCH_USERNAME', ''),
        password: this.configService.get<string>('ELASTICSEARCH_PASSWORD', ''),
      },
    });
  }

  /**
   * Инициализация индекса при запуске приложения
   */
  async onModuleInit() {
    try {
      // Проверяем существование индекса
      const indexExists = await this.esClient.indices.exists({
        index: this.indexName,
      });

      // Если индекс не существует, создаем его
      if (!indexExists) {
        await this.createIndex();
        // Индексируем все существующие контакты
        await this.indexAllContacts();
      }
    } catch (error) {
      this.logger.error(`Ошибка при инициализации Elasticsearch: ${error.message}`);
    }
  }

  /**
   * Создание индекса с маппингом полей
   */
  private async createIndex(): Promise<void> {
    try {
      // Создаем индекс с настройками
      await this.esClient.indices.create({
        index: this.indexName,
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0,
          analysis: {
            analyzer: {
              russian_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'russian_stop', 'russian_stemmer'],
              },
            },
            filter: {
              russian_stop: {
                type: 'stop',
                stopwords: '_russian_',
              },
              russian_stemmer: {
                type: 'stemmer',
                language: 'russian',
              },
            },
          },
        },
        mappings: {
          properties: {
            id: { type: 'keyword' },
            firstName: {
              type: 'text',
              analyzer: 'russian_analyzer',
              fields: {
                keyword: { type: 'keyword' },
              },
            },
            lastName: {
              type: 'text',
              analyzer: 'russian_analyzer',
              fields: {
                keyword: { type: 'keyword' },
              },
            },
            middleName: {
              type: 'text',
              analyzer: 'russian_analyzer',
              fields: {
                keyword: { type: 'keyword' },
              },
            },
            phone: { type: 'keyword' },
            email: { type: 'keyword' },
            source: { type: 'keyword' },
            statusClient: { type: 'keyword' },
            notes: {
              type: 'text',
              analyzer: 'russian_analyzer',
            },
            isLead: { type: 'boolean' },
            assignedToId: { type: 'keyword' },
            partnerId: { type: 'keyword' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' },
          },
        },
      });
      this.logger.log(`Индекс ${this.indexName} успешно создан`);
    } catch (error) {
      this.logger.error(`Ошибка при создании индекса: ${error.message}`);
      throw error;
    }
  }

  /**
   * Индексация всех существующих контактов
   */
  private async indexAllContacts() {
    try {
      // Получаем все контакты из базы данных
      const contacts = await this.prisma.contact.findMany();
      
      if (contacts.length === 0) {
        this.logger.log('Нет контактов для индексации');
        return;
      }

      // Подготавливаем данные для bulk индексации
      const body = contacts.flatMap(contact => [
        { index: { _index: this.indexName, _id: contact.id } },
        this.prepareContactForIndexing(contact),
      ]);

      // Выполняем bulk индексацию
      const { errors } = await this.esClient.bulk({ refresh: true, body });
      
      if (errors) {
        this.logger.error('Ошибки при bulk индексации контактов');
      } else {
        this.logger.log(`Успешно проиндексировано ${contacts.length} контактов`);
      }
    } catch (error) {
      this.logger.error(`Ошибка при индексации контактов: ${error.message}`);
      throw error;
    }
  }

  /**
   * Индексация одного контакта
   */
  async indexContact(contact: Contact): Promise<void> {
    try {
      // Подготавливаем контакт для индексации
      const contactData = this.prepareContactForIndexing(contact);

      // Индексируем контакт
      await this.esClient.index({
        index: this.indexName,
        id: contact.id,
        document: contactData,
      });
      this.logger.log(`Контакт ${contact.id} успешно проиндексирован`);
    } catch (error) {
      this.logger.error(`Ошибка при индексации контакта ${contact.id}: ${error.message}`);
    }
  }

  /**
   * Обновление индекса при изменении контакта
   */
  async updateContact(contact: Contact) {
    return this.indexContact(contact);
  }

  /**
   * Удаление контакта из индекса
   */
  async deleteContact(contactId: string) {
    try {
      await this.esClient.delete({
        index: this.indexName,
        id: contactId,
        refresh: true,
      });
      this.logger.log(`Контакт ${contactId} успешно удален из индекса`);
    } catch (error) {
      this.logger.error(`Ошибка при удалении контакта ${contactId} из индекса: ${error.message}`);
    }
  }

  /**
   * Поиск контактов по запросу
   */
  async searchContacts(query: string, limit = 10, offset = 0): Promise<SearchResult> {
    try {
      // Выполняем поиск
      const { hits } = await this.esClient.search<Record<string, unknown>>({  
        index: this.indexName,
        from: offset,
        size: limit,
        query: {
          multi_match: {
            query,
            fields: ['firstName', 'lastName', 'middleName', 'phone', 'email', 'notes'],
            type: 'best_fields',
            fuzziness: 'AUTO',
          },
        },
        highlight: {
          fields: {
            firstName: {},
            lastName: {},
            middleName: {},
            phone: {},
            email: {},
            notes: {},
          },
        },
      });  

      const total = hits.total as { value: number };
      const results = hits.hits.map((hit: SearchHit<Record<string, unknown>>) => ({
        ...(hit._source as Record<string, unknown>),
        score: hit._score,
        highlights: hit.highlight,
      }));

      return {
        total: total.value,
        results,
      };
    } catch (error) {
      this.logger.error(`Ошибка при поиске контактов: ${error.message}`);
      throw error;
    }
  }

  /**
   * Подготовка контакта для индексации
   */
  private prepareContactForIndexing(contact: Contact) {
    // Удаляем поля, которые не нужно индексировать
    const { historyData, ...indexableContact } = contact;
    return indexableContact;
  }
}
