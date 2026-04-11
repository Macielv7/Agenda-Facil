const db = require('../config/database');

// GET /api/produtos
function listar(req, res) {
  const { categoria, profissional_id } = req.query;
  let sql = `
    SELECT p.*, u.nome AS profissional_nome
    FROM produtos p
    JOIN usuarios u ON u.id = p.profissional_id
    WHERE p.ativo = 1
  `;
  const params = [];
  if (categoria) { sql += ' AND p.categoria = ?'; params.push(categoria); }
  if (profissional_id) { sql += ' AND p.profissional_id = ?'; params.push(profissional_id); }
  sql += ' ORDER BY p.criado_em DESC';
  res.json(db.prepare(sql).all(...params));
}

// GET /api/produtos/:id
function buscarPorId(req, res) {
  const produto = db.prepare(`
    SELECT p.*, u.nome AS profissional_nome
    FROM produtos p JOIN usuarios u ON u.id = p.profissional_id
    WHERE p.id = ?
  `).get(req.params.id);
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
  res.json(produto);
}

// POST /api/produtos
function criar(req, res) {
  const { nome, descricao, preco, estoque, categoria } = req.body;
  const profissional_id = req.usuario.id;
  if (!nome || !preco) return res.status(400).json({ erro: 'nome e preco são obrigatórios' });

  const resultado = db.prepare(`
    INSERT INTO produtos (profissional_id, nome, descricao, preco, estoque, categoria)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(profissional_id, nome, descricao || null, preco, estoque || 0, categoria || null);

  res.status(201).json({ id: resultado.lastInsertRowid, mensagem: 'Produto criado' });
}

// PUT /api/produtos/:id
function atualizar(req, res) {
  const produto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(req.params.id);
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
  if (produto.profissional_id !== req.usuario.id) return res.status(403).json({ erro: 'Sem permissão' });

  const { nome, descricao, preco, estoque, categoria } = req.body;
  db.prepare(`
    UPDATE produtos SET
      nome = COALESCE(?, nome),
      descricao = COALESCE(?, descricao),
      preco = COALESCE(?, preco),
      estoque = COALESCE(?, estoque),
      categoria = COALESCE(?, categoria)
    WHERE id = ?
  `).run(nome, descricao, preco, estoque, categoria, req.params.id);

  res.json({ mensagem: 'Produto atualizado' });
}

// DELETE /api/produtos/:id
function remover(req, res) {
  const produto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(req.params.id);
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
  if (produto.profissional_id !== req.usuario.id) return res.status(403).json({ erro: 'Sem permissão' });

  db.prepare('UPDATE produtos SET ativo = 0 WHERE id = ?').run(req.params.id);
  res.json({ mensagem: 'Produto desativado' });
}

module.exports = { listar, buscarPorId, criar, atualizar, remover };
