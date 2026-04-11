const db = require('../config/database');

// GET /api/notificacoes
function listar(req, res) {
  const notifs = db.prepare(`
    SELECT * FROM notificacoes
    WHERE usuario_id = ?
    ORDER BY criado_em DESC
    LIMIT 50
  `).all(req.usuario.id);
  res.json(notifs);
}

// PATCH /api/notificacoes/:id/lida
function marcarLida(req, res) {
  db.prepare(`
    UPDATE notificacoes SET lida = 1
    WHERE id = ? AND usuario_id = ?
  `).run(req.params.id, req.usuario.id);
  res.json({ mensagem: 'Notificação marcada como lida' });
}

// PATCH /api/notificacoes/marcar-todas
function marcarTodasLidas(req, res) {
  db.prepare('UPDATE notificacoes SET lida = 1 WHERE usuario_id = ?').run(req.usuario.id);
  res.json({ mensagem: 'Todas as notificações marcadas como lidas' });
}

module.exports = { listar, marcarLida, marcarTodasLidas };
