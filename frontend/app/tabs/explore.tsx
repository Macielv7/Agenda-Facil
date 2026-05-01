import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { notificacoesService, Notificacao } from '../../services/apiService';

const TIPO_EMOJI: Record<string, string> = {
  agendamento: '📅',
  lembrete: '🔔',
  promo: '🎉',
  sistema: '⚙️',
};

function formatarTempo(dataStr: string): string {
  try {
    const agora = new Date();
    const data = new Date(dataStr);
    const diffMs = agora.getTime() - data.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Agora';
    if (diffMin < 60) return `Há ${diffMin} min`;
    const diffHoras = Math.floor(diffMin / 60);
    if (diffHoras < 24) return `Há ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
    const diffDias = Math.floor(diffHoras / 24);
    if (diffDias === 1) return 'Ontem';
    return `Há ${diffDias} dias`;
  } catch {
    return '';
  }
}

export default function ExploreScreen() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [marcandoTodas, setMarcandoTodas] = useState(false);
  const [erro, setErro] = useState('');

  const carregarNotificacoes = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setErro('');
    try {
      const dados = await notificacoesService.listar();
      setNotificacoes(dados);
    } catch (e: any) {
      setErro(e.message || 'Erro ao carregar notificações.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregarNotificacoes();
  }, [carregarNotificacoes]);

  const onRefresh = () => {
    setRefreshing(true);
    carregarNotificacoes(true);
  };

  const handleMarcarLida = async (id: number) => {
    try {
      await notificacoesService.marcarLida(id);
      setNotificacoes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, lida: 1 } : n)),
      );
    } catch {
      // Silencia erro — ação não crítica
    }
  };

  const handleMarcarTodasLidas = async () => {
    setMarcandoTodas(true);
    try {
      await notificacoesService.marcarTodasLidas();
      setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: 1 })));
    } catch (e: any) {
      // Silencia
    } finally {
      setMarcandoTodas(false);
    }
  };

  const naoLidas = notificacoes.filter((n) => n.lida === 0).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notificações</Text>
          {naoLidas > 0 && (
            <Text style={styles.badge}>{naoLidas} não lida{naoLidas > 1 ? 's' : ''}</Text>
          )}
        </View>
        {naoLidas > 0 && (
          <TouchableOpacity onPress={handleMarcarTodasLidas} disabled={marcandoTodas}>
            {marcandoTodas ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={styles.markAll}>Marcar todas como lidas</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Carregando notificações...</Text>
          </View>
        ) : erro ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>⚠️</Text>
            <Text style={styles.emptyText}>{erro}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => carregarNotificacoes()}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : notificacoes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔕</Text>
            <Text style={styles.emptyText}>Nenhuma notificação</Text>
          </View>
        ) : (
          notificacoes.map((n) => (
            <TouchableOpacity
              key={n.id}
              style={[styles.card, n.lida === 0 && styles.cardUnread]}
              activeOpacity={0.8}
              onPress={() => n.lida === 0 && handleMarcarLida(n.id)}
            >
              <View style={[styles.iconBox, n.lida === 0 && styles.iconBoxUnread]}>
                <Text style={styles.icon}>{TIPO_EMOJI[n.tipo] || '🔔'}</Text>
              </View>
              <View style={styles.content}>
                <View style={styles.notifHeader}>
                  <Text style={[styles.notifTitle, n.lida === 0 && styles.notifTitleUnread]}>
                    {n.titulo}
                  </Text>
                  {n.lida === 0 && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notifBody}>{n.mensagem}</Text>
                <Text style={styles.notifTime}>{formatarTempo(n.criado_em)}</Text>
              </View>
            </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  badge: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  markAll: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  scroll: {
    padding: 24,
    gap: 12,
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
    flexDirection: 'row',
    gap: 14,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 12,
  },
  cardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBoxUnread: {
    backgroundColor: Colors.primary,
  },
  icon: {
    fontSize: 22,
  },
  content: {
    flex: 1,
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  notifTitleUnread: {
    fontWeight: '800',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  notifBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  notifTime: {
    fontSize: 11,
    color: Colors.gray400,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
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
