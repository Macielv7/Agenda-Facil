const express = require('express');
const router = express.Router();

const { authMiddleware, somenteCliente, somenteEmpreendedor } = require('../middleware/auth');

const authCtrl      = require('../controllers/authController');
const agendCtrl     = require('../controllers/agendamentosController');
const servicosCtrl  = require('../controllers/servicosController');
const produtosCtrl  = require('../controllers/produtosController');
const notifCtrl     = require('../controllers/notificacoesController');

// ── AUTH ─────────────────────────────────────────────────────
router.post('/auth/registro', authCtrl.registro);
router.post('/auth/login',    authCtrl.login);
router.get( '/auth/perfil',   authMiddleware, authCtrl.perfil);
router.put( '/auth/perfil',   authMiddleware, authCtrl.atualizarPerfil);

// ── SERVIÇOS (público: GET | privado: POST/PUT/DELETE) ───────
router.get(   '/servicos',      servicosCtrl.listar);
router.get(   '/servicos/:id',  servicosCtrl.buscarPorId);
router.post(  '/servicos',      authMiddleware, somenteEmpreendedor, servicosCtrl.criar);
router.put(   '/servicos/:id',  authMiddleware, somenteEmpreendedor, servicosCtrl.atualizar);
router.delete('/servicos/:id',  authMiddleware, somenteEmpreendedor, servicosCtrl.remover);

// ── AGENDAMENTOS ──────────────────────────────────────────────
router.get(   '/agendamentos',            authMiddleware, agendCtrl.listar);
router.get(   '/agendamentos/:id',        authMiddleware, agendCtrl.buscarPorId);
router.post(  '/agendamentos',            authMiddleware, somenteCliente, agendCtrl.criar);
router.patch( '/agendamentos/:id/status', authMiddleware, agendCtrl.atualizarStatus);
router.delete('/agendamentos/:id',        authMiddleware, agendCtrl.cancelar);

// ── PRODUTOS ──────────────────────────────────────────────────
router.get(   '/produtos',     produtosCtrl.listar);
router.get(   '/produtos/:id', produtosCtrl.buscarPorId);
router.post(  '/produtos',     authMiddleware, somenteEmpreendedor, produtosCtrl.criar);
router.put(   '/produtos/:id', authMiddleware, somenteEmpreendedor, produtosCtrl.atualizar);
router.delete('/produtos/:id', authMiddleware, somenteEmpreendedor, produtosCtrl.remover);

// ── NOTIFICAÇÕES ──────────────────────────────────────────────
router.get(  '/notificacoes',              authMiddleware, notifCtrl.listar);
router.patch('/notificacoes/marcar-todas', authMiddleware, notifCtrl.marcarTodasLidas);
router.patch('/notificacoes/:id/lida',     authMiddleware, notifCtrl.marcarLida);

module.exports = router;
