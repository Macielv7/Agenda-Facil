const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// POST /api/auth/registro
async function registro(req, res) {
  const { nome, email, senha, tipo, telefone, profissao } = req.body;

  if (!nome || !email || !senha || !tipo) {
    return res.status(400).json({ erro: 'Campos obrigatórios: nome, email, senha, tipo' });
  }

  if (!['cliente', 'empreendedor'].includes(tipo)) {
    return res.status(400).json({ erro: 'Tipo deve ser cliente ou empreendedor' });
  }

  const emailExistente = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
  if (emailExistente) {
    return res.status(409).json({ erro: 'E-mail já cadastrado' });
  }

  const senhaHash = await bcrypt.hash(senha, 12);

  const resultado = db.prepare(`
    INSERT INTO usuarios (nome, email, senha_hash, tipo, telefone, profissao)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(nome, email, senhaHash, tipo, telefone || null, profissao || null);

  const token = jwt.sign(
    { id: resultado.lastInsertRowid, nome, email, tipo },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    mensagem: 'Conta criada com sucesso',
    token,
    usuario: { id: resultado.lastInsertRowid, nome, email, tipo },
  });
}

// POST /api/auth/login
async function login(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'E-mail e senha obrigatórios' });
  }

  const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);

  if (!usuario) {
    return res.status(401).json({ erro: 'Credenciais inválidas' });
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
  if (!senhaValida) {
    return res.status(401).json({ erro: 'Credenciais inválidas' });
  }

  const token = jwt.sign(
    { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
      foto_url: usuario.foto_url,
      profissao: usuario.profissao,
    },
  });
}

// GET /api/auth/perfil
function perfil(req, res) {
  const usuario = db.prepare(
    'SELECT id, nome, email, tipo, telefone, foto_url, profissao, avaliacao_media, criado_em FROM usuarios WHERE id = ?'
  ).get(req.usuario.id);

  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });

  res.json(usuario);
}

// PUT /api/auth/perfil
function atualizarPerfil(req, res) {
  const { nome, telefone, profissao } = req.body;
  const usuarioId = req.usuario.id;

  db.prepare(`
    UPDATE usuarios SET
      nome          = COALESCE(?, nome),
      telefone      = COALESCE(?, telefone),
      profissao     = COALESCE(?, profissao),
      atualizado_em = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(nome || null, telefone || null, profissao || null, usuarioId);

  const atualizado = db.prepare(
    'SELECT id, nome, email, tipo, telefone, foto_url, profissao, avaliacao_media, criado_em FROM usuarios WHERE id = ?'
  ).get(usuarioId);

  res.json({ mensagem: 'Perfil atualizado', usuario: atualizado });
}

module.exports = { registro, login, perfil, atualizarPerfil };
