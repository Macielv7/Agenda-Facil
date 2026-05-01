import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { agendamentosService, Agendamento } from '../../services/apiService';
import { STATUS_LABELS, STATUS_COLORS, STATUS_BG } from '../../constants/data';

const FILTER_TABS = [
  { id: 'todos', label: 'Todos' },
  { id: 'confirmado', label: 'Confirmados' },
  { id: 'pendente', label: 'Pendentes' },
  { id: 'cancelado', label: 'Cancelados' },
];

function formatarDataHora(dataHora: string) {
  try {
    const d = new Date(dataHora);
    const data = d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
    const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return { data, hora };
  } catch {
    return { data: dataHora, hora: '' };
  }
}

function BookingCard({
  booking,
  onAtualizarStatus,
  atualizando,
}: {
  booking: Agendamento;
  onAtualizarStatus: (id: number, status: 'confirmado' | 'cancelado' | 'concluido') => void;
  atualizando: number | null;
}) {
  const statusColor = STATUS_COLORS[booking.status] || '#666';
  const statusBg = STATUS_BG[booking.status] || '#eee';
  const statusLabel = STATUS_LABELS[booking.status] || booking.status;
  const { data, hora } = formatarDataHora(booking.data_hora);
  const isAtualizando = atualizando === booking.id;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {booking.status === 'confirmado' ? '✅ ' :
             booking.status === 'pendente' ? '⏰ ' :
             booking.status === 'concluido' ? '🏁 ' : '❌ '}
            {statusLabel}
          </Text>
        </View>
        <Text style={styles.bookingId}>ID: #{booking.id}</Text>
      </View>

      <Text style={styles.professionalName}>
        {booking.profissional_nome || booking.cliente_nome}
      </Text>
      <Text style={styles.profession}>
        {booking.profissao || ''}
      </Text>

      <View style={styles.serviceBox}>
        <Text style={styles.serviceLabel}>Serviço</Text>
        <Text style={styles.serviceName}>{booking.servico_nome}</Text>
        {booking.duracao_min && (
          <Text style={styles.serviceDuration}>⏱ {booking.duracao_min} min</Text>
        )}
      </View>

      <View style={styles.dateRow}>
        <Text style={styles.dateText}>📅  {data}</Text>
        <Text style={styles.timeText}>🕐  {hora}</Text>
      </View>

      {booking.observacao ? (
        <Text style={styles.observacao}>💬 {booking.observacao}</Text>
      ) : null}

      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.valorLabel}>Valor</Text>
          <Text style={styles.valor}>R$ {booking.valor.toFixed(2)}</Text>
        </View>

        {isAtualizando ? (
          <ActivityIndicator color={Colors.primary} />
        ) : (
          <View style={styles.actions}>
            {booking.status === 'confirmado' && (
              <>
                <TouchableOpacity
                  style={styles.successBtn}
                  onPress={() => onAtualizarStatus(booking.id, 'concluido')}
                >
                  <Text style={styles.successBtnText}>Concluir</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => onAtualizarStatus(booking.id, 'cancelado')}
                >
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
              </>
            )}
            {booking.status === 'pendente' && (
              <>
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={() => onAtualizarStatus(booking.id, 'confirmado')}
                >
                  <Text style={styles.confirmBtnText}>Confirmar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.refuseBtn}
                  onPress={() => onAtualizarStatus(booking.id, 'cancelado')}
                >
                  <Text style={styles.refuseBtnText}>Recusar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

export default function AgendamentosScreen() {
  const [activeFilter, setActiveFilter] = useState('todos');
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [atualizando, setAtualizando] = useState<number | null>(null);
  const [erro, setErro] = useState('');

  const carregarAgendamentos = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setErro('');
    try {
      const dados = await agendamentosService.listar();
      setAgendamentos(dados);
    } catch (e: any) {
      setErro(e.message || 'Erro ao carregar agendamentos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregarAgendamentos();
  }, [carregarAgendamentos]);

  const onRefresh = () => {
    setRefreshing(true);
    carregarAgendamentos(true);
  };

  const handleAtualizarStatus = async (
    id: number,
    status: 'confirmado' | 'cancelado' | 'concluido',
  ) => {
    const mensagens: Record<string, string> = {
      cancelado: 'Deseja cancelar este agendamento?',
      confirmado: 'Deseja confirmar este agendamento?',
      concluido: 'Marcar este agendamento como concluído?',
    };

    Alert.alert(
      status.charAt(0).toUpperCase() + status.slice(1),
      mensagens[status],
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          style: status === 'cancelado' ? 'destructive' : 'default',
          onPress: async () => {
            setAtualizando(id);
            try {
              await agendamentosService.atualizarStatus(id, status);
              // Atualiza localmente sem refetch completo
              setAgendamentos((prev) =>
                prev.map((a) => (a.id === id ? { ...a, status } : a)),
              );
            } catch (e: any) {
              Alert.alert('Erro', e.message || 'Não foi possível atualizar o agendamento.');
            } finally {
              setAtualizando(null);
            }
          },
        },
      ],
    );
  };

  const filtered = agendamentos.filter(
    (a) => activeFilter === 'todos' || a.status === activeFilter,
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={styles.title}>Meus Agendamentos</Text>
          <Text style={styles.subtitle}>Gerencie seus compromissos</Text>
        </View>
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {FILTER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.filterBtn, activeFilter === tab.id && styles.filterActive]}
            onPress={() => setActiveFilter(tab.id)}
          >
            <Text style={[styles.filterText, activeFilter === tab.id && styles.filterTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bookings list */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Carregando agendamentos...</Text>
          </View>
        ) : erro ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>⚠️</Text>
            <Text style={styles.emptyText}>{erro}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => carregarAgendamentos()}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyText}>
              {activeFilter === 'todos'
                ? 'Nenhum agendamento encontrado'
                : `Nenhum agendamento ${STATUS_LABELS[activeFilter]?.toLowerCase()}`}
            </Text>
          </View>
        ) : (
          filtered.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onAtualizarStatus={handleAtualizarStatus}
              atualizando={atualizando}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.white,
  },
  backIcon: {
    fontSize: 22,
    color: Colors.textSecondary,
  },
  headerTitles: {},
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  filterScroll: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: Colors.gray100,
    marginRight: 8,
  },
  filterActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 24,
    gap: 16,
    paddingBottom: 100,
  },
  loadingState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bookingId: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  professionalName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  profession: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 14,
    textTransform: 'capitalize',
  },
  serviceBox: {
    backgroundColor: Colors.gray100,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  serviceLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  serviceDuration: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  timeText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  observacao: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valorLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  valor: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.danger,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.danger,
  },
  successBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#22C55E',
  },
  successBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
  },
  confirmBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
  },
  refuseBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.danger,
  },
  refuseBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.danger,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  retryText: {
    color: Colors.white,
    fontWeight: '600',
  },
});
