import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';

const MENU_ITEMS = [
  { icon: '📋', label: 'Meus Agendamentos', route: '/(tabs)/agendamentos' },
  { icon: '🔔', label: 'Notificações', route: '/(tabs)/explore' },
  { icon: '🔒', label: 'Privacidade e Segurança', route: null },
  { icon: '💳', label: 'Pagamentos', route: null },
  { icon: '❓', label: 'Ajuda e Suporte', route: null },
  { icon: '📄', label: 'Termos de Uso', route: null },
];

export default function PerfilScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Avatar */}
        <View style={styles.profileCard}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>👤</Text>
            </View>
          </View>
          <Text style={styles.name}>Cliente</Text>
          <Text style={styles.email}>cliente@email.com</Text>
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editBtnText}>Editar perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Agendamentos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Profissionais</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>4.9 ⭐</Text>
            <Text style={styles.statLabel}>Avaliação</Text>
          </View>
        </View>

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

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => router.replace('/auth/login')}
        >
          <Text style={styles.logoutText}>🚪  Sair da conta</Text>
        </TouchableOpacity>
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
    marginBottom: 16,
  },
  editBtn: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.primary,
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
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
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
});
