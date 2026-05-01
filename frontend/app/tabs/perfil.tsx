import React, { useEffect, useState, useCallback } from 'react';
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
import { agendamentosService } from '../../services/apiService';

const MENU_CLIENTE = [
  { icon: '📋', label: 'Meus Agendamentos', route: '/tabs/agendamentos' },
  { icon: '🔔', label: 'Notificações', route: '/tabs/explore' },
  { icon: '🔒', label: 'Privacidade e Segurança', route: null },
  { icon: '💳', label: 'Pagamentos', route: null },
  { icon: '❓', label: 'Ajuda e Suporte', route: null },
  { icon: '📄', label: 'Termos de Uso', route: null },
];

const MENU_EMPREENDEDOR = [
  { icon: '🏠', label: 'Meu Painel', route: '/tabs/empreendedor' },
  { icon: '📋', label: 'Agendamentos', route: '/tabs/agendamentos' },
  { icon: '🔔', label: 'Notificações', route: '/tabs/explore' },
  { icon: '🔒', label: 'Privacidade e Segurança', route: null },
  { icon: '❓', label: 'Ajuda e Suporte', route: null },
  { icon: '📄', label: 'Termos de Uso', route: null },
];

export default function PerfilScreen() {
  const { usuario, logout, recarregarPerfil } = useAuth();
  const MENU_ITEMS = usuario?.tipo === 'empreendedor' ? MENU_EMPREENDEDOR : MENU_CLIENTE;
  const [statsAgendamentos, setStatsAgendamentos] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarStats = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoadingStats(true);
    try {
      const agendamentos = await agendamentosService.listar();
      setStatsAgendamentos(agendamentos.length);
    } catch {
      setStatsAgendamentos(0);
    } finally {
      setLoadingStats(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregarStats();
  }, [carregarStats]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([recarregarPerfil(), carregarStats(true)]);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair da conta',
      'Deseja realmente sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ],
    );
  };

  const agendamentosConcluidos = statsAgendamentos;
  const avaliacao = usuario?.avaliacao_media
    ? `${usuario.avaliacao_media.toFixed(1)} ⭐`
    : '— ⭐';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Avatar */}
        <View style={styles.profileCard}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>
                {usuario?.tipo === 'empreendedor' ? '💼' : '👤'}
              </Text>
            </View>
          </View>
          <Text style={styles.name}>{usuario?.nome || 'Carregando...'}</Text>
          <Text style={styles.email}>{usuario?.email || ''}</Text>
          {usuario?.profissao ? (
            <Text style={styles.profissao}>{usuario.profissao}</Text>
          ) : null}
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editBtnText}>Editar perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            {loadingStats ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={styles.statValue}>{agendamentosConcluidos}</Text>
            )}
            <Text style={styles.statLabel}>Agendamentos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {usuario?.tipo === 'cliente' ? '👤' : '💼'}
            </Text>
            <Text style={styles.statLabel}>
              {usuario?.tipo === 'cliente' ? 'Cliente' : 'Empreendedor'}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{avaliacao}</Text>
            <Text style={styles.statLabel}>Avaliação</Text>
          </View>
        </View>

        {/* Telefone */}
        {usuario?.telefone ? (
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>📱</Text>
            <View>
              <Text style={styles.infoLabel}>Telefone</Text>
              <Text style={styles.infoValue}>{usuario.telefone}</Text>
            </View>
          </View>
        ) : null}

        {/* Menu */}
        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, i) => (
            <React.Fragment key={item.label}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => item.route && router.push(item.route as any)}
              >
                <View style={styles.menuLeft}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
              {i < MENU_ITEMS.length - 1 && <View style={styles.menuDivider} />}
            </React.Fragment>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪  Sair da conta</Text>
        </TouchableOpacity>

        {usuario?.criado_em && (
          <Text style={styles.memberSince}>
            Membro desde {new Date(usuario.criado_em).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </Text>
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
  scroll: {
    padding: 24,
    gap: 16,
    paddingBottom: 100,
  },
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarRing: {
    padding: 3,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: 12,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 36,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  profissao: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 12,
  },
  editBtn: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    marginTop: 8,
  },
  editBtnText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  infoIcon: {
    fontSize: 24,
  },
  infoLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
  },
  menuArrow: {
    fontSize: 22,
    color: Colors.gray400,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 54,
  },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.danger,
  },
  memberSince: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.gray400,
    marginTop: -8,
  },
});
