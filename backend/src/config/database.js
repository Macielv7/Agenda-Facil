const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const DB_PATH = process.env.DB_PATH || './database.sqlite';
const db = new Database(path.resolve(DB_PATH));

// Ativar foreign keys e WAL
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── MIGRATIONS ───────────────────────────────────────────────
// user_version = 2 → schema com tipo 'empreendedor'
function runMigrations() {
  const { user_version } = db.prepare('PRAGMA user_version').get();

  if (user_version < 2) {
    console.log('🔄 Atualizando schema do banco (v1 → v2)...');

    // Desligar FKs temporariamente para drop seguro
    db.pragma('foreign_keys = OFF');

    db.exec(`
      DROP TABLE IF EXISTS notificacoes;
      DROP TABLE IF EXISTS avaliacoes;
      DROP TABLE IF EXISTS agendamentos;
      DROP TABLE IF EXISTS produtos;
      DROP TABLE IF EXISTS servicos;
      DROP TABLE IF EXISTS usuarios;
    `);

    db.pragma('foreign_keys = ON');
  }

  // Criar/garantir tabelas (roda sempre, idempotente após drop)
  db.exec(`
    -- Tabela de Usuários
    CREATE TABLE IF NOT EXISTS usuarios (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      nome            TEXT    NOT NULL,
      email           TEXT    NOT NULL UNIQUE,
      senha_hash      TEXT    NOT NULL,
      tipo            TEXT    NOT NULL CHECK(tipo IN ('cliente', 'empreendedor')),
      telefone        TEXT,
      foto_url        TEXT,
      profissao       TEXT,
      avaliacao_media REAL    DEFAULT 0,
      criado_em       DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em   DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela de Serviços
    CREATE TABLE IF NOT EXISTS servicos (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      empreendedor_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      nome            TEXT    NOT NULL,
      descricao       TEXT,
      preco           REAL    NOT NULL,
      duracao_min     INTEGER NOT NULL DEFAULT 30,
      categoria       TEXT    NOT NULL CHECK(categoria IN ('beleza', 'saude', 'bem-estar')),
      ativo           INTEGER NOT NULL DEFAULT 1,
      criado_em       DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela de Agendamentos
    CREATE TABLE IF NOT EXISTS agendamentos (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id      INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      empreendedor_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      servico_id      INTEGER NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
      data_hora       DATETIME NOT NULL,
      status          TEXT    NOT NULL DEFAULT 'pendente'
                              CHECK(status IN ('pendente', 'confirmado', 'cancelado', 'concluido')),
      valor           REAL    NOT NULL,
      observacao      TEXT,
      criado_em       DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em   DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela de Produtos
    CREATE TABLE IF NOT EXISTS produtos (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      empreendedor_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      nome            TEXT    NOT NULL,
      descricao       TEXT,
      preco           REAL    NOT NULL,
      estoque         INTEGER NOT NULL DEFAULT 0,
      categoria       TEXT,
      imagem_url      TEXT,
      ativo           INTEGER NOT NULL DEFAULT 1,
      criado_em       DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela de Avaliações
    CREATE TABLE IF NOT EXISTS avaliacoes (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      agendamento_id  INTEGER NOT NULL UNIQUE REFERENCES agendamentos(id) ON DELETE CASCADE,
      cliente_id      INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      empreendedor_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      nota            INTEGER NOT NULL CHECK(nota BETWEEN 1 AND 5),
      comentario      TEXT,
      criado_em       DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela de Notificações
    CREATE TABLE IF NOT EXISTS notificacoes (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id      INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      titulo          TEXT    NOT NULL,
      mensagem        TEXT    NOT NULL,
      tipo            TEXT    NOT NULL CHECK(tipo IN ('agendamento', 'lembrete', 'promo', 'sistema')),
      lida            INTEGER NOT NULL DEFAULT 0,
      criado_em       DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Índices para performance
    CREATE INDEX IF NOT EXISTS idx_servicos_empreendedor  ON servicos(empreendedor_id);
    CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente   ON agendamentos(cliente_id);
    CREATE INDEX IF NOT EXISTS idx_agendamentos_empreed   ON agendamentos(empreendedor_id);
    CREATE INDEX IF NOT EXISTS idx_agendamentos_data      ON agendamentos(data_hora);
    CREATE INDEX IF NOT EXISTS idx_produtos_empreendedor  ON produtos(empreendedor_id);
    CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario   ON notificacoes(usuario_id);
  `);

  // Marcar schema como versão 2
  db.pragma('user_version = 2');
  console.log('✅ Migrations executadas com sucesso (schema v2)');
}

runMigrations();

module.exports = db;
