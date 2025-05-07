# ER-диаграмма MaK CRM

## Основные сущности

```mermaid
erDiagram
    User ||--o{ Role : "имеет"
    User ||--o{ Client : "управляет"
    User ||--o{ Deal : "ведет"
    User }|--|| Partner : "может быть"
    
    Role ||--o{ Permission : "включает"
    
    Client ||--o{ Deal : "имеет"
    Client ||--o{ Contact : "имеет"
    Client ||--o{ Document : "имеет"
    Client }|--|| Partner : "принадлежит"
    Client }|--|| Segment : "входит в"
    
    Deal ||--o{ Stage : "находится на"
    Deal ||--o{ Task : "имеет"
    Deal ||--o{ Document : "имеет"
    Deal }|--|| Pipeline : "принадлежит"
    
    Pipeline ||--o{ Stage : "содержит"
    
    Partner ||--o{ User : "имеет сотрудников"
    Partner ||--o{ Client : "имеет"
    Partner ||--o{ Deal : "имеет"
    
    Component ||--o{ Setting : "имеет"
    Component ||--o{ Dependency : "имеет"
    
    Notification }|--|| Template : "использует"
    Notification }|--|| Channel : "отправляется через"
    
    Integration ||--o{ Setting : "имеет"
    Integration ||--o{ Webhook : "имеет"
    
    User {
        int id PK
        string email
        string password_hash
        string first_name
        string last_name
        string phone
        datetime created_at
        datetime updated_at
        boolean is_active
        json settings
    }
    
    Role {
        int id PK
        string name
        string description
        boolean is_system
        int partner_id FK
    }
    
    Permission {
        int id PK
        string resource
        string action
        int role_id FK
    }
    
    Client {
        int id PK
        string name
        string email
        string phone
        string source
        int status_id FK
        int partner_id FK
        int user_id FK
        datetime created_at
        datetime updated_at
        json custom_fields
    }
    
    Contact {
        int id PK
        int client_id FK
        string first_name
        string last_name
        string email
        string phone
        string position
        boolean is_primary
        json custom_fields
    }
    
    Deal {
        int id PK
        string name
        int client_id FK
        int pipeline_id FK
        int stage_id FK
        int user_id FK
        int partner_id FK
        decimal amount
        datetime created_at
        datetime updated_at
        datetime closed_at
        string status
        json custom_fields
    }
    
    Pipeline {
        int id PK
        string name
        string description
        boolean is_active
        int partner_id FK
        json settings
    }
    
    Stage {
        int id PK
        int pipeline_id FK
        string name
        string description
        int order
        string color
        json automation
    }
    
    Task {
        int id PK
        string title
        string description
        datetime due_date
        int user_id FK
        int deal_id FK
        int client_id FK
        string status
        int priority
    }
    
    Document {
        int id PK
        string name
        string file_path
        string mime_type
        int size
        int client_id FK
        int deal_id FK
        int user_id FK
        datetime created_at
    }
    
    Partner {
        int id PK
        string name
        string legal_name
        string tax_id
        string email
        string phone
        string status
        int manager_id FK
        json settings
        datetime created_at
    }
    
    Segment {
        int id PK
        string name
        string description
        json filter_criteria
        int partner_id FK
        boolean is_system
    }
    
    Component {
        int id PK
        string name
        string version
        string description
        string type
        boolean is_active
        string entry_point
        json settings
    }
    
    Setting {
        int id PK
        string key
        string value
        string type
        int component_id FK
        int integration_id FK
    }
    
    Dependency {
        int id PK
        int component_id FK
        int depends_on_id FK
        string version_constraint
    }
    
    Notification {
        int id PK
        int user_id FK
        int template_id FK
        int channel_id FK
        string status
        json data
        datetime created_at
        datetime sent_at
        datetime read_at
    }
    
    Template {
        int id PK
        string name
        string type
        string subject
        text content
        json variables
    }
    
    Channel {
        int id PK
        string name
        string type
        json settings
        boolean is_active
    }
    
    Integration {
        int id PK
        string name
        string type
        string status
        json settings
        datetime last_sync
    }
    
    Webhook {
        int id PK
        int integration_id FK
        string url
        string event
        json headers
        boolean is_active
    }
    
    Audit {
        int id PK
        int user_id FK
        string action
        string resource
        int resource_id
        json old_values
        json new_values
        datetime created_at
        string ip_address
    }
```

## Дополнительные связи и ограничения

1. **Каскадное удаление:**
   - При удалении клиента удаляются все его контакты, документы и сделки
   - При удалении сделки удаляются все связанные с ней задачи и документы
   - При удалении воронки удаляются все её этапы

2. **Ограничения целостности:**
   - Пользователь не может быть удален, если он является ответственным за клиентов или сделки
   - Партнер не может быть удален, если с ним связаны клиенты или сделки
   - Компонент не может быть удален, если от него зависят другие компоненты

3. **Индексы для оптимизации:**
   - Индексы по внешним ключам для ускорения JOIN-запросов
   - Индексы по полям фильтрации (status, created_at, updated_at)
   - Полнотекстовые индексы для поиска по текстовым полям

4. **Партиционирование:**
   - Таблицы с историческими данными (audit, notification) партиционируются по дате
   - Таблицы с большим объемом данных (client, deal) могут быть партиционированы по partner_id

## Расширяемость схемы

1. **JSON-поля для гибкости:**
   - custom_fields в таблицах client, contact, deal для хранения дополнительных атрибутов
   - settings в таблицах user, partner, pipeline для хранения настроек
   - filter_criteria в таблице segment для хранения критериев сегментации

2. **Миграции:**
   - Все изменения схемы выполняются через миграции
   - Миграции версионируются и применяются последовательно
   - Для каждой миграции предусмотрен откат (rollback)

## Примечания по реализации

1. **PostgreSQL:**
   - Использование JSONB для JSON-полей
   - Использование наследования таблиц для партиционирования
   - Использование материализованных представлений для аналитики

2. **Индексы:**
   - B-tree индексы для обычных полей
   - GIN индексы для JSONB-полей
   - Частичные индексы для оптимизации запросов с условиями

3. **Ограничения:**
   - CHECK-ограничения для проверки значений
   - UNIQUE-ограничения для уникальности комбинаций полей
   - FOREIGN KEY с указанием действий при удалении/обновлении
