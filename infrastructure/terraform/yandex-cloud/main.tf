terraform {
  required_providers {
    yandex = {
      source  = "yandex-cloud/yandex"
      version = "~> 0.95.0"
    }
  }
  required_version = ">= 1.0.0"
}

provider "yandex" {
  token     = var.yc_token
  cloud_id  = var.yc_cloud_id
  folder_id = var.yc_folder_id
  zone      = var.yc_zone
}

# Создание сети
resource "yandex_vpc_network" "mak3_network" {
  name = "mak3-network"
}

# Создание подсети
resource "yandex_vpc_subnet" "mak3_subnet" {
  name           = "mak3-subnet"
  zone           = var.yc_zone
  network_id     = yandex_vpc_network.mak3_network.id
  v4_cidr_blocks = ["10.5.0.0/24"]
}

# Создание кластера PostgreSQL
resource "yandex_mdb_postgresql_cluster" "mak3_pg_cluster" {
  name                = "mak3-pg-cluster"
  environment         = "PRODUCTION"
  network_id          = yandex_vpc_network.mak3_network.id
  security_group_ids  = [yandex_vpc_security_group.mak3_pg_sg.id]
  deletion_protection = true

  config {
    version = "16"
    resources {
      resource_preset_id = "s2.micro" # Минимальный размер для разработки
      disk_type_id       = "network-ssd"
      disk_size          = 20 # ГБ
    }
    postgresql_config = {
      max_connections                   = 100
      enable_parallel_query             = true
      autovacuum_vacuum_scale_factor    = 0.07
      default_transaction_isolation     = "TRANSACTION_ISOLATION_READ_COMMITTED"
      shared_preload_libraries          = "pg_stat_statements,pg_qualstats,pg_buffercache"
    }
  }

  host {
    zone             = var.yc_zone
    subnet_id        = yandex_vpc_subnet.mak3_subnet.id
    assign_public_ip = true
  }
}

# Создание пользователя базы данных
resource "yandex_mdb_postgresql_user" "mak3_user" {
  cluster_id = yandex_mdb_postgresql_cluster.mak3_pg_cluster.id
  name       = "mak3_user"
  password   = var.db_password
  grants     = ["ALL"]
  login      = true
}

# Создание базы данных
resource "yandex_mdb_postgresql_database" "mak3_db" {
  cluster_id = yandex_mdb_postgresql_cluster.mak3_pg_cluster.id
  name       = "mak3_db"
  owner      = yandex_mdb_postgresql_user.mak3_user.name
  lc_collate = "ru_RU.UTF-8"
  lc_type    = "ru_RU.UTF-8"
}

# Создание группы безопасности для PostgreSQL
resource "yandex_vpc_security_group" "mak3_pg_sg" {
  name       = "mak3-pg-sg"
  network_id = yandex_vpc_network.mak3_network.id

  ingress {
    description    = "PostgreSQL"
    port           = 6432
    protocol       = "TCP"
    v4_cidr_blocks = ["0.0.0.0/0"] # В продакшене ограничить только необходимыми IP
  }

  egress {
    description    = "Outbound traffic"
    protocol       = "ANY"
    v4_cidr_blocks = ["0.0.0.0/0"]
  }
}

# Вывод информации о созданных ресурсах
output "cluster_id" {
  value = yandex_mdb_postgresql_cluster.mak3_pg_cluster.id
}

output "cluster_host" {
  value = "c-${yandex_mdb_postgresql_cluster.mak3_pg_cluster.id}.rw.mdb.yandexcloud.net"
}

output "database_name" {
  value = yandex_mdb_postgresql_database.mak3_db.name
}

output "database_user" {
  value = yandex_mdb_postgresql_user.mak3_user.name
}
