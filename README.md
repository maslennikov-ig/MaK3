# MaK 3 CRM

## Описание проекта

MaK 3 CRM - современная, масштабируемая CRM-платформа для автоматизации и стандартизации бизнес-процессов в сфере кредитного брокериджа. Система поддерживает расширение за счёт подключения новых компонентов, интеграций и индивидуальных настроек для разных типов пользователей (сотрудников, партнёров, франчайзи).

### Основные возможности

- Ведение учёта клиентов и контрагентов, управление их статусами и историей взаимодействий
- Детальная аналитика (выручка, KPI, эффективность, партнёры, сегменты)
- Верификация заемщиков и управление процессом подачи заявок в банки
- Управление клиентскими базами, сегментация, импорт/экспорт
- Интеграция с AmoCRM и Telegram-ботом
- Возможность расширения через внутренний каталог компонентов

## Технологический стек

### Frontend
- Next.js (React, TypeScript)
- Mantine UI
- TanStack Table
- dnd-kit
- Recharts/Nivo
- React Hook Form
- React Arborist

### Backend
- NestJS (TypeScript)
- REST API
- Prisma ORM

### Базы данных
- PostgreSQL
- Redis
- ElasticSearch
- Object Storage

### Инфраструктура
- Docker
- Kubernetes
- Яндекс.Облако
- CI/CD (GitHub Actions)
- Prometheus, Grafana, Sentry

## Настройка окружения

### Требования
- Node.js v18.x или выше
- Docker и Docker Compose
- Git

### Локальная разработка

1. Клонировать репозиторий:
```bash
git clone <repository-url>
cd MaK3
```

2. Установить зависимости:
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. Запустить проект через Docker Compose:
```bash
docker-compose up -d
```

4. Открыть в браузере:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Swagger документация: http://localhost:3001/api

## Структура проекта

```
MaK3/
├── frontend/             # Next.js приложение
├── backend/              # NestJS приложение
├── docs/                 # Документация
├── .github/              # GitHub Actions конфигурация
└── docker-compose.yml    # Docker Compose конфигурация
```

## Документация

Подробная документация доступна в директории `docs/`:
- [Архитектура](docs/architecture.md)
- [Инфраструктура](docs/infrastructure.md)
- [Дорожная карта](docs/roadmap.md)
- [Задачи](docs/tasks.md)
- [ТЗ](docs/ТЗ_CRM_2025.md)
