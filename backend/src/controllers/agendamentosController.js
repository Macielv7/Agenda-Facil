const db = require('../config/database');

// GET /api/agendamentos — lista do usuário logado
function listar(req, res) {
  const { id, tipo } = req.usuario;
  const { status } = req.query;

  const campo = tipo === 'cliente' ? 'a.cliente_id' : 'a.profissional_id';

  let sql = `
    SELECT
      a.id, a.data_hora, a.status, a.valor, a.observacao, a.criado_em,
      s.nome       AS servico_nome,
      s.duracao_min,
      c.nome       AS cliente_nome,
      c.foto_url   AS cliente_foto,
      p.nome       AS profissional_nome,
      p.foto_url   AS profissional_foto,
      p.profissao
    FROM agendamentos a
    JOIN servicos  s ON s.id = a.servico_id
    JOIN usuarios  c ON c.id = a.cliente_id
    JOIN usuarios  p ON p.id = a.profissional_id
    WHERE ${campo} = ?
  `;

  const params = [id];

  if (status) {
    sql += ' AND a.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY a.data_hora DESC';

  res.json(db.prepare(sql).all(...params));
}

// GET /api/agendamentos/:id
function buscarPorId(req, res) {
  const agendamento = db.prepare(`
    SELECT
      a.*,
      s.nome AS servico_nome, s.duracao_min,
      c.nome AS cliente_nome, c.foto_url AS cliente_foto,
      p.nome AS profissional_nome, p.foto_url AS profissional_foto, p.profissao
    FROM agendamentos a
    JOIN servicos s ON s.id = a.servico_id
    JOIN usuarios c ON c.id = a.cliente_id
    JOIN usuarios p ON p.id = a.profissional_id
    WHERE a.id = ?
  `).get(req.params.id);

  if (!agendamento) return res.status(404).json({ erro: 'Agendamento não encontrado' });

  // Garante que só o cliente ou profissional envolvido acesse
  const { id, tipo } = req.usuario;
  const temAcesso =
    (tipo === 'cliente' && agendamento.cliente_id === id) ||
    (tipo === 'profissional' && agendamento.profissional_id === id);

  if (!temAcesso) return res.status(403).json({ erro: 'Sem permissão' });

  res.json(agendamento);
}

// POST /api/agendamentos
function criar(req, res) {
  const { profissional_id, servico_id, data_hora, observacao } = req.body;
  const cliente_id = req.usuario.id;

  if (!profissional_id || !servico_id || !data_hora) {
    return res.status(400).json({ erro: 'profissional_id, servico_id e data_hora são obrigatórios' });
  }

  const servico = db.prepare('SELECT * FROM servicos WHERE id = ? AND ativo = 1').get(servico_id);
  if (!servico) return res.status(404).json({ erro: 'Serviço não encontrado' });

  if (servico.profissional_id !== profissional_id) {
    return res.status(400).json({ erro: 'Serviço não pertence a esse profissional' });
  }

  // Verificar conflito de horário
  const conflito = db.prepare(`
    SELECT id FROM agendamentos
    WHERE profissional_id = ?
      AND data_hora = ?
      AND status NOT IN ('cancelado')
  `).get(profissional_id, data_hora);

  if (conflito) return res.status(409).json({ erro: 'Horário indisponível' });

  const resultado = db.prepare(`
    INSERT INTO agendamentos (cliente_id, profissional_id, servico_id, data_hora, valor, observacao)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(cliente_id, profissional_id, servico_id, data_hora, servico.preco, observacao || null);

  // Notificar profissional
  db.prepare(`
    INSERT INTO notificacoes (usuario_id, titulo, mensagem, tipo)
    VALUES (?, 'Novo agendamento', 'Você tem um novo agendamento pendente.', 'agendamento')
  `).run(profissional_id);

  res.status(201).json({ id: resultado.lastInsertRowid, mensagem: 'Agendamento criado' });
}

// PATCH /api/agendamentos/:id/status
function atualizarStatus(req, res) {
  const { status } = req.body;
  const statusValidos = ['confirmado', 'cancelado', 'concluido'];

  if (!statusValidos.includes(status)) {
    return res.status(400).json({ erro: `Status deve ser: ${statusValidos.join(', ')}` });
  }

  const agendamento = db.prepare('SELECT * FROM agendamentos WHERE id = ?').get(req.params.id);
  if (!agendamento) return res.status(404).json({ erro: 'Agendamento não encontrado' });

  const { id, tipo } = req.usuario;

  // Regras de negócio
  if (status === 'confirmado' && tipo !== 'profissional') {
    return res.status(403).json({ erro: 'Somente o profissional pode confirmar' });
  }
  if (status === 'cancelado') {
    const temAcesso =
      agendamento.cliente_id === id || agendamento.profissional_id === id;
    if (!temAcesso) return res.status(403).json({ erro: 'Sem permissão para cancelar' });
  }

  db.prepare(`
    UPDATE agendamentos SET status = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?
  `).run(status, agendamento.id);

  // Notificar a outra parte
  const notificarId =
    tipo === 'profissional' ? agendamento.cliente_id : agendamento.profissional_id;

  const msgs = {
    confirmado: 'Seu agendamento foi confirmado!',
    cancelado:  'Um agendamento foi cancelado.',
    concluido:  'Agendamento concluído. Deixe sua avaliação!',
  };

  db.prepare(`
    INSERT INTO notificacoes (usuario_id, titulo, mensagem, tipo)
    VALUES (?, ?, ?, 'agendamento')
  `).run(notificarId, `Agendamento ${status}`, msgs[status]);

  res.json({ mensagem: `Agendamento ${status} com sucesso` });
}

// DELETE /api/agendamentos/:id
function cancelar(req, res) {
  req.body = { status: 'cancelado' };
  return atualizarStatus(req, res);
}

module.exports = { listar, buscarPorId, criar, atualizarStatus, cancelar };
