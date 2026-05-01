import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { agendamentosService, servicosService, Agendamento, Servico } from '../../services/apiService';

// ─── Helpers de data ──────────────────────────────────────────
function getDiasDoMes(): { short: string; day: number; date: Date }[] {
  const hoje = new Date();
  const dias = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() + i);
    const shorts = ['DOM.', 'SEG.', 'TER.', 'QUA.', 'QUI.', 'SEX.', 'SÁB.'];
    dias.push({ short: shorts[d.getDay()], day: d.getDate(), date: d });
  }
  return dias;
}

function isMesmoDia(dataHora: string, date: Date): boolean {
  try {
    const d = new Date(dataHora);
    return (
      d.getDate() === date.getDate() &&
      d.getMonth() === date.getMonth() &&
      d.getFullYear() === date.getFullYear()
    );
  } catch {
    return false;
  }
}

function formatarHora(dataHora: string): string {
  try {
    return new Date(dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return dataHora;
  }
}

function getInicioSemana(): Date {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

const STATUS_COLOR: Record<string, string> = {
  confirmado: '#22C55E',
  pendente: '#F59E0B',
  cancelado: '#EF4444',
  concluido: '#6366F1',
};
const STATUS_BG: Record<string, string> = {
  confirmado: '#DCFCE7',
  pendente: '#FEF3C7',
  cancelado: '#FEE2E2',
  concluido: '#EDE9FE',
};
const STATUS_LABEL: Record<string, string> = {
  confirmado: 'Confirmado',
  pendente: 'Pendente',
  cancelado: 'Cancelado',
  concluido: 'Concluído',
};

// ─── Card de agendamento ──────────────────────────────────────
function AgendamentoCard({
  agendamento,
  onAtualizarStatus,
  atualizando,
}: {
  agendamento: Agendamento;
  onAtualizarStatus: (id: number, status: 'confirmado' | 'cancelado' | 'concluido') => void;
  atualizando: number | null;
}) {
  const cor = STATUS_COLOR[agendamento.status] || '#888';
  const bg = STATUS_BG[agendamento.status] || '#eee';
  const label = STATUS_LABEL[agendamento.status] || agendamento.status;
  const isAtualizando = atualizando === agendamento.id;

  return (
    <View style={styles.bookingCard}>
      <View style={styles.bookingTop}>
        <View style={styles.bookingLeft}>
          <View style={styles.clientAvatar}>
            <Text style={styles.clientAvatarIcon}>👤</Text>
          </View>
          <View>
            <Text style={styles.clientName}>{agendamento.cliente_nome || 'Cliente'}</Text>
            <Text style={styles.clientService}>{agendamento.servico_nome}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: bg }]}>
          <Text style={[styles.statusText, { color: cor }]}>{label}</Text>
        </View>
      </View>

      <View style={styles.bookingMeta}>
        <Text style={styles.bookingTime}>🕐 {formatarHora(agendamento.data_hora)}</Text>
        <Text style={styles.bookingDuration}>⏱ {agendamento.duracao_min}min</Text>
        <Text style={styles.bookingValue}>R$ {agendamento.valor.toFixed(2)}</Text>
      </View>

      {isAtualizando ? (
        <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 8 }} />
      ) : agendamento.status === 'pendente' ? (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={() => onAtualizarStatus(agendamento.id, 'confirmado')}
          >
            <Text style={styles.confirmBtnText}>✅ Confirmar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.refuseBtn}
            onPress={() => onAtualizarStatus(agendamento.id, 'cancelado')}
          >
            <Text style={styles.refuseBtnText}>❌ Recusar</Text>
          </TouchableOpacity>
        </View>
      ) : agendamento.status === 'confirmado' ? (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.concludeBtn}
            onPress={() => onAtualizarStatus(agendamento.id, 'concluido')}
          >
            <Text style={styles.concludeBtnText}>🏁 Marcar como concluído</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────
export default function ProfissionalScreen() {
  const { usuario, logout } = useAuth();
  const WEEK_DAYS = getDiasDoMes();

  const [selectedDay, setSelectedDay] = useState(WEEK_DAYS[0].day);
  const [selectedDate, setSelectedDate] = useState(WEEK_DAYS[0].date);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [atualizando, setAtualizando] = useState<number | null>(null);

  const carregarDados = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const [agenda, svcs] = await Promise.all([
        agendamentosService.listar(),
        usuario?.id ? servicosService.listar({ empreendedor_id: usuario.id }) : Promise.resolve([]),
      ]);
      setAgendamentos(agenda);
      setServicos(svcs);
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [usuario?.id]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const onRefresh = () => {
    setRefreshing(true);
    carregarDados(true);
  };

  // ─── Estatísticas calculadas ──────────────────────────────
  const hoje = new Date();
  const inicioSemana = getInicioSemana();

  const agendamentosHoje = agendamentos.filter(
    (a) => isMesmoDia(a.data_hora, hoje) && a.status !== 'cancelado',
  ).length;

  const agendamentosSemana = agendamentos.filter((a) => {
    try {
      const d = new Date(a.data_hora);
      return d >= inicioSemana && a.status !== 'cancelado';
    } catch { return false; }
  }).length;

  const receitaSemana = agendamentos
    .filter((a) => {
      try {
        const d = new Date(a.data_hora);
        return d >= inicioSemana && a.status === 'concluido';
      } catch { return false; }
    })
    .reduce((sum, a) => sum + a.valor, 0);

  // ─── Agendamentos do dia selecionado ──────────────────────
  const agendamentosDia = agendamentos
    .filter((a) => isMesmoDia(a.data_hora, selectedDate) && a.status !== 'cancelado')
    .sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime());

  const pendentes = agendamentos.filter((a) => a.status === 'pendente').length;

  // ─── Atualizar status ─────────────────────────────────────
  const handleAtualizarStatus = async (
    id: number,
    status: 'confirmado' | 'cancelado' | 'concluido',
  ) => {
    setAtualizando(id);
    try {
      await agendamentosService.atualizarStatus(id, status);
      setAgendamentos((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a)),
      );
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Não foi possível atualizar o agendamento.');
    } finally {
      setAtualizando(null);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sair da conta', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/auth/login');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
      >
        {/* ── Hero card ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroGreeting}>
                Olá, {usuario?.nome?.split(' ')[0] || 'Profissional'}! 👋
              </Text>
              <Text style={styles.heroRole}>
                {usuario?.profissao || 'Profissional'} · {servicos.length} serviço{servicos.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutIcon}>→</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color="#fff" style={{ marginTop: 16 }} />
          ) : (
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{agendamentosHoje}</Text>
                <Text style={styles.statLabel}>Hoje</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{agendamentosSemana}</Text>
                <Text style={styles.statLabel}>Esta semana</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  R$ {receitaSemana.toFixed(0)}
                </Text>
                <Text style={styles.statLabel}>Receita</Text>
              </View>
            </View>
          )}

          {/* Badge de pendentes */}
          {pendentes > 0 && (
            <View style={styles.pendenteBadge}>
              <Text style={styles.pendenteText}>
                ⏰ {pendentes} agendamento{pendentes > 1 ? 's' : ''} aguardando confirmação
              </Text>
            </View>
          )}
        </View>

        {/* ── Agenda do dia ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agenda do dia</Text>

          {/* Seletor de dia */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daysRow}
          >
            {WEEK_DAYS.map((d) => (
              <TouchableOpacity
                key={d.day}
                style={[styles.dayBtn, selectedDay === d.day && styles.dayBtnActive]}
                onPress={() => {
                  setSelectedDay(d.day);
                  setSelectedDate(d.date);
                }}
              >
                <Text style={[styles.dayShort, selectedDay === d.day && styles.dayTextActive]}>
                  {d.short}
                </Text>
                <Text style={[styles.dayNumber, selectedDay === d.day && styles.dayTextActive]}>
                  {d.day}
                </Text>
                {/* dot de agendamentos */}
                {agendamentos.filter((a) => isMesmoDia(a.data_hora, d.date) && a.status !== 'cancelado').length > 0 && (
                  <View style={[styles.dayDot, selectedDay === d.day && styles.dayDotActive]} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Ações rápidas */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.push('/tabs/agendamentos')}
            >
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={styles.actionText}>Ver Todos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionIcon}>➕</Text>
              <Text style={styles.actionText}>Novo Serviço</Text>
            </TouchableOpacity>
          </View>

          {/* Cabeçalho da lista */}
          <View style={styles.bookingsHeader}>
            <Text style={styles.bookingsTitle}>
              Agendamentos ({agendamentosDia.length})
            </Text>
            <TouchableOpacity onPress={() => router.push('/tabs/agendamentos')}>
              <Text style={styles.verTodos}>Ver todos →</Text>
            </TouchableOpacity>
          </View>

          {/* Lista */}
          {loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color={Colors.primary} />
              <Text style={styles.loadingText}>Carregando agenda...</Text>
            </View>
          ) : agendamentosDia.length === 0 ? (
            <View style={styles.emptyDay}>
              <Text style={styles.emptyDayEmoji}>📭</Text>
              <Text style={styles.emptyDayText}>Nenhum agendamento neste dia</Text>
            </View>
          ) : (
            agendamentosDia.map((a) => (
              <AgendamentoCard
                key={a.id}
                agendamento={a}
                onAtualizarStatus={handleAtualizarStatus}
                atualizando={atualizando}
              />
            ))
          )}
        </View>

        {/* ── Meus serviços ── */}
        {servicos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meus Serviços</Text>
            {servicos.map((s) => (
              <View key={s.id} style={styles.servicoCard}>
                <View style={styles.servicoInfo}>
                  <Text style={styles.servicoNome}>{s.nome}</Text>
                  {s.descricao ? (
                    <Text style={styles.servicoDescricao}>{s.descricao}</Text>
                  ) : null}
                  <Text style={styles.servicoDuracao}>⏱ {s.duracao_min}min · {s.categoria}</Text>
                </View>
                <Text style={styles.servicoPreco}>R$ {s.preco.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingBottom: 100,
  },
  heroCard: {
    backgroundColor: Colors.primary,
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  heroGreeting: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.3,
  },
  heroRole: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  logoutBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIcon: {
    fontSize: 18,
    color: Colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  pendenteBadge: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  pendenteText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  daysRow: {
    paddingBottom: 4,
    gap: 10,
    marginBottom: 20,
  },
  dayBtn: {
    width: 66,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    marginRight: 10,
  },
  dayBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  dayShort: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  dayTextActive: {
    color: Colors.primary,
  },
  dayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textSecondary,
    marginTop: 4,
  },
  dayDotActive: {
    backgroundColor: Colors.primary,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  bookingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  bookingsTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  verTodos: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  loadingState: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 30,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  emptyDay: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyDayEmoji: {
    fontSize: 40,
  },
  emptyDayText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  bookingCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  bookingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bookingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  clientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clientAvatarIcon: {
    fontSize: 20,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  clientService: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  bookingMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 4,
  },
  bookingTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  bookingDuration: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  bookingValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: 'auto',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
  },
  refuseBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.danger,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  refuseBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.danger,
  },
  concludeBtn: {
    flex: 1,
    backgroundColor: '#6366F1',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  concludeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
  },
  servicoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  servicoInfo: {
    flex: 1,
    marginRight: 12,
  },
  servicoNome: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  servicoDescricao: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  servicoDuracao: {
    fontSize: 11,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  servicoPreco: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
});
