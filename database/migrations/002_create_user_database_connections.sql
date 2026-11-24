-- KyoDB User TiDB Connections Schema Migration (002_create_user_database_connections.sql)
-- Allows public registered users to connect and manage their own TiDB databases

CREATE TABLE IF NOT EXISTS user_database_connections (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(128) NOT NULL,
  host VARCHAR(255) NOT NULL,
  port INT NOT NULL DEFAULT 4000,
  username VARCHAR(128) NOT NULL,
  password_encrypted TEXT NOT NULL,
  database_name VARCHAR(64) NOT NULL,
  ssl_ca TEXT NULL,
  is_default TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_conn (user_id),
  INDEX idx_user_default (user_id, is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS role VARCHAR(32) NOT NULL DEFAULT 'user';

