-- Схема базы данных MaK CRM (2025)
-- PostgreSQL 16

-- Пользователи
CREATE TABLE "users" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}'::jsonb,
    last_login_at TIMESTAMP WITH TIME ZONE,
    avatar_url VARCHAR(255)
);

-- Партнеры
CREATE TABLE "partners" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    tax_id VARCHAR(50),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    logo_url VARCHAR(255),
    address TEXT,
    website VARCHAR(255)
);

-- Роли
CREATE TABLE "roles" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    partner_id INTEGER REFERENCES partners(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (name, partner_id)
);

-- Разрешения
CREATE TABLE "permissions" (
    id SERIAL PRIMARY KEY,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (resource, action, role_id)
);

-- Связь пользователей и ролей
CREATE TABLE "user_roles" (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- Связь пользователей и партнеров
CREATE TABLE "user_partners" (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    partner_id INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, partner_id)
);

-- Сегменты клиентов
CREATE TABLE "segments" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    filter_criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
    partner_id INTEGER REFERENCES partners(id) ON DELETE CASCADE,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Клиенты
CREATE TABLE "clients" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    source VARCHAR(100),
    status_id INTEGER,
    partner_id INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    address TEXT,
    notes TEXT,
    is_lead BOOLEAN DEFAULT TRUE
);

-- Контакты клиентов
CREATE TABLE "contacts" (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    position VARCHAR(100),
    is_primary BOOLEAN DEFAULT FALSE,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Воронки продаж
CREATE TABLE "pipelines" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    partner_id INTEGER REFERENCES partners(id) ON DELETE CASCADE,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Этапы воронок
CREATE TABLE "stages" (
    id SERIAL PRIMARY KEY,
    pipeline_id INTEGER NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    "order" INTEGER NOT NULL,
    color VARCHAR(20),
    automation JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Сделки
CREATE TABLE "deals" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    pipeline_id INTEGER NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
    stage_id INTEGER NOT NULL REFERENCES stages(id) ON DELETE RESTRICT,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    partner_id INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    custom_fields JSONB DEFAULT '{}'::jsonb,
    probability INTEGER,
    expected_close_date DATE
);

-- Задачи
CREATE TABLE "tasks" (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    deal_id INTEGER REFERENCES deals(id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Документы
CREATE TABLE "documents" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size INTEGER NOT NULL,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    deal_id INTEGER REFERENCES deals(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE
);

-- Компоненты
CREATE TABLE "components" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    entry_point VARCHAR(255) NOT NULL,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    author VARCHAR(255),
    license VARCHAR(100)
);

-- Зависимости компонентов
CREATE TABLE "dependencies" (
    id SERIAL PRIMARY KEY,
    component_id INTEGER NOT NULL REFERENCES components(id) ON DELETE CASCADE,
    depends_on_id INTEGER NOT NULL REFERENCES components(id) ON DELETE RESTRICT,
    version_constraint VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (component_id, depends_on_id)
);

-- Настройки
CREATE TABLE "settings" (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) NOT NULL,
    value TEXT,
    type VARCHAR(50) NOT NULL,
    component_id INTEGER REFERENCES components(id) ON DELETE CASCADE,
    integration_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

-- Шаблоны уведомлений
CREATE TABLE "templates" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    variables JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Каналы уведомлений
CREATE TABLE "channels" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Уведомления
CREATE TABLE "notifications" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id INTEGER REFERENCES templates(id) ON DELETE SET NULL,
    channel_id INTEGER REFERENCES channels(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    title VARCHAR(255),
    content TEXT
);

-- Интеграции
CREATE TABLE "integrations" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'inactive',
    settings JSONB DEFAULT '{}'::jsonb,
    last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Вебхуки
CREATE TABLE "webhooks" (
    id SERIAL PRIMARY KEY,
    integration_id INTEGER NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    url VARCHAR(255) NOT NULL,
    event VARCHAR(100) NOT NULL,
    headers JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    secret VARCHAR(255)
);

-- Аудит
CREATE TABLE "audit" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    resource VARCHAR(50) NOT NULL,
    resource_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- Индексы
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_partners_manager_id ON partners(manager_id);
CREATE INDEX idx_partners_status ON partners(status);
CREATE INDEX idx_roles_partner_id ON roles(partner_id);
CREATE INDEX idx_permissions_role_id ON permissions(role_id);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_user_partners_user_id ON user_partners(user_id);
CREATE INDEX idx_user_partners_partner_id ON user_partners(partner_id);
CREATE INDEX idx_segments_partner_id ON segments(partner_id);
CREATE INDEX idx_clients_partner_id ON clients(partner_id);
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_status_id ON clients(status_id);
CREATE INDEX idx_clients_is_lead ON clients(is_lead);
CREATE INDEX idx_contacts_client_id ON contacts(client_id);
CREATE INDEX idx_pipelines_partner_id ON pipelines(partner_id);
CREATE INDEX idx_stages_pipeline_id ON stages(pipeline_id);
CREATE INDEX idx_stages_order ON stages("order");
CREATE INDEX idx_deals_client_id ON deals(client_id);
CREATE INDEX idx_deals_pipeline_id ON deals(pipeline_id);
CREATE INDEX idx_deals_stage_id ON deals(stage_id);
CREATE INDEX idx_deals_user_id ON deals(user_id);
CREATE INDEX idx_deals_partner_id ON deals(partner_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_deal_id ON tasks(deal_id);
CREATE INDEX idx_tasks_client_id ON tasks(client_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_documents_client_id ON documents(client_id);
CREATE INDEX idx_documents_deal_id ON documents(deal_id);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_components_is_active ON components(is_active);
CREATE INDEX idx_dependencies_component_id ON dependencies(component_id);
CREATE INDEX idx_dependencies_depends_on_id ON dependencies(depends_on_id);
CREATE INDEX idx_settings_component_id ON settings(component_id);
CREATE INDEX idx_settings_integration_id ON settings(integration_id);
CREATE INDEX idx_templates_type ON templates(type);
CREATE INDEX idx_channels_type ON channels(type);
CREATE INDEX idx_channels_is_active ON channels(is_active);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_template_id ON notifications(template_id);
CREATE INDEX idx_notifications_channel_id ON notifications(channel_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_integrations_type ON integrations(type);
CREATE INDEX idx_integrations_status ON integrations(status);
CREATE INDEX idx_webhooks_integration_id ON webhooks(integration_id);
CREATE INDEX idx_webhooks_event ON webhooks(event);
CREATE INDEX idx_webhooks_is_active ON webhooks(is_active);
CREATE INDEX idx_audit_user_id ON audit(user_id);
CREATE INDEX idx_audit_action ON audit(action);
CREATE INDEX idx_audit_resource ON audit(resource);
CREATE INDEX idx_audit_resource_id ON audit(resource_id);
CREATE INDEX idx_audit_created_at ON audit(created_at);

-- Полнотекстовые индексы
CREATE INDEX idx_clients_name_trgm ON clients USING gin (name gin_trgm_ops);
CREATE INDEX idx_clients_email_trgm ON clients USING gin (email gin_trgm_ops);
CREATE INDEX idx_clients_phone_trgm ON clients USING gin (phone gin_trgm_ops);
CREATE INDEX idx_deals_name_trgm ON deals USING gin (name gin_trgm_ops);

-- JSON индексы
CREATE INDEX idx_clients_custom_fields ON clients USING gin (custom_fields);
CREATE INDEX idx_deals_custom_fields ON deals USING gin (custom_fields);
CREATE INDEX idx_segments_filter_criteria ON segments USING gin (filter_criteria);

-- Триггеры для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pipelines_updated_at BEFORE UPDATE ON pipelines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stages_updated_at BEFORE UPDATE ON stages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_components_updated_at BEFORE UPDATE ON components FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Комментарии к таблицам
COMMENT ON TABLE users IS 'Пользователи системы';
COMMENT ON TABLE partners IS 'Партнеры и франчайзи';
COMMENT ON TABLE roles IS 'Роли пользователей';
COMMENT ON TABLE permissions IS 'Разрешения для ролей';
COMMENT ON TABLE user_roles IS 'Связь пользователей и ролей';
COMMENT ON TABLE user_partners IS 'Связь пользователей и партнеров';
COMMENT ON TABLE segments IS 'Сегменты клиентов';
COMMENT ON TABLE clients IS 'Клиенты и лиды';
COMMENT ON TABLE contacts IS 'Контакты клиентов';
COMMENT ON TABLE pipelines IS 'Воронки продаж';
COMMENT ON TABLE stages IS 'Этапы воронок продаж';
COMMENT ON TABLE deals IS 'Сделки';
COMMENT ON TABLE tasks IS 'Задачи';
COMMENT ON TABLE documents IS 'Документы и файлы';
COMMENT ON TABLE components IS 'Компоненты и плагины';
COMMENT ON TABLE dependencies IS 'Зависимости компонентов';
COMMENT ON TABLE settings IS 'Настройки компонентов и интеграций';
COMMENT ON TABLE templates IS 'Шаблоны уведомлений';
COMMENT ON TABLE channels IS 'Каналы уведомлений';
COMMENT ON TABLE notifications IS 'Уведомления';
COMMENT ON TABLE integrations IS 'Интеграции с внешними системами';
COMMENT ON TABLE webhooks IS 'Вебхуки для интеграций';
COMMENT ON TABLE audit IS 'Аудит действий пользователей';
