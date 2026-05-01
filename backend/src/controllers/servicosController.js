const db = require('../config/database');

// GET /api/servicos — lista pública com filtros
function listar(req, res) {
  const { categoria, empreendedor_id } = req.query;

  let sql = `
    SELECT
      s.*,
      u.nome AS empreendedor_nome, u.foto_url, u.avaliacao_media, u.profissao
    FROM servicos s
    JOIN usuarios u ON u.id = s.empreendedor_id
    WHERE s.ativo = 1
  `;
  const params = [];

  if (categoria) { sql += ' AND s.categoria = ?'; params.push(categoria); }
  if (empreendedor_id) { sql += ' AND s.empreendedor_id = ?'; params.push(empreendedor_id); }

  sql += ' ORDER BY u.avaliacao_media DESC';

  res.json(db.prepare(sql).all(...params));
}

// GET /api/servicos/:id
function buscarPorId(req, res) {
  const servico = db.prepare(`
    SELECT s.*, u.nome AS empreendedor_nome, u.avaliacao_media, u.profissao
    FROM servicos s
    JOIN usuarios u ON u.id = s.empreendedor_id
    WHERE s.id = ?
  `).get(req.params.id);

  if (!servico) return res.status(404).json({ erro: 'Serviço não encontrado' });
  res.json(servico);
}

// POST /api/servicos — apenas empreendedor
function criar(req, res) {
  const { nome, descricao, preco, duracao_min, categoria } = req.body;
  const empreendedor_id = req.usuario.id;

  if (!nome || !preco || !categoria) {
    return res.status(400).json({ erro: 'nome, preco e categoria são obrigatórios' });
  }

  const resultado = db.prepare(`
    INSERT INTO servicos (empreendedor_id, nome, descricao, preco, duracao_min, categoria)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(empreendedor_id, nome, descricao || null, preco, duracao_min || 30, categoria);

  res.status(201).json({ id: resultado.lastInsertRowid, mensagem: 'Serviço criado' });
}

// PUT /api/servicos/:id
function atualizar(req, res) {
  const servico = db.prepare('SELECT * FROM servicos WHERE id = ?').get(req.params.id);
  if (!servico) return res.status(404).json({ erro: 'Serviço não encontrado' });
  if (servico.empreendedor_id !== req.usuario.id) return res.status(403).json({ erro: 'Sem permissão' });

  const { nome, descricao, preco, duracao_min, categoria, ativo } = req.body;

  db.prepare(`
    UPDATE servicos SET
      nome        = COALESCE(?, nome),
      descricao   = COALESCE(?, descricao),
      preco       = COALESCE(?, preco),
      duracao_min = COALESCE(?, duracao_min),
      categoria   = COALESCE(?, categoria),
      ativo       = COALESCE(?, ativo)
    WHERE id = ?
  `).run(nome, descricao, preco, duracao_min, categoria, ativo, req.params.id);

  res.json({ mensagem: 'Serviço atualizado' });
}

// DELETE /api/servicos/:id (soft delete)
function remover(req, res) {
  const servico = db.prepare('SELECT * FROM servicos WHERE id = ?').get(req.params.id);
  if (!servico) return res.status(404).json({ erro: 'Serviço não encontrado' });
  if (servico.empreendedor_id !== req.usuario.id) return res.status(403).json({ erro: 'Sem permissão' });

  db.prepare('UPDATE servicos SET ativo = 0 WHERE id = ?').run(req.params.id);
  res.json({ mensagem: 'Serviço desativado' });
}

module.exports = { listar, buscarPorId, criar, atualizar, remover };
