import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';

const QUICK_ACTIONS = [
  { icon: '📅', label: 'Novo Agendamento', subtitle: 'Agendar com um profissional', action: () => router.replace('/tabs') },
  { icon: '🔍', label: 'Buscar Profissional', subtitle: 'Encontrar serviços na sua área', action: () => router.replace('/tabs') },
  { icon: '📋', label: 'Meus Agendamentos', subtitle: 'Ver todos os compromissos', action: () => router.replace('/tabs/agendamentos') },
];

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        <Text style={styles.title}>Ações Rápidas</Text>
        <Text style={styles.subtitle}>O que você deseja fazer?</Text>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
          {QUICK_ACTIONS.map((action, i) => (
            <TouchableOpacity
              key={i}
              style={styles.actionCard}
              onPress={action.action}
              activeOpacity={0.8}
            >
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>{action.icon}</Text>
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionLabel}>{action.label}</Text>
                <Text style={styles.actionSub}>{action.subtitle}</Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Fechar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.gray300,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  list: {
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    backgroundColor: Colors.gray100,
    borderRadius: 16,
    marginBottom: 10,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionInfo: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  actionSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  actionArrow: {
    fontSize: 24,
    color: Colors.gray400,
  },
  cancelBtn: {
    backgroundColor: Colors.gray100,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
