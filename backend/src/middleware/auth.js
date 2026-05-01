const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload;
    next();
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}

function somenteCliente(req, res, next) {
  if (req.usuario.tipo !== 'cliente') {
    return res.status(403).json({ erro: 'Acesso apenas para clientes' });
  }
  next();
}

function somenteEmpreendedor(req, res, next) {
  if (req.usuario.tipo !== 'empreendedor') {
    return res.status(403).json({ erro: 'Acesso apenas para empreendedores' });
  }
  next();
}

module.exports = { authMiddleware, somenteCliente, somenteEmpreendedor };
