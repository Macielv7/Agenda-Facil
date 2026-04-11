import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';

const NOTIFICATIONS = [
  {
    id: '1',
    type: 'confirmado',
    title: 'Agendamento confirmado!',
    body: 'Seu agendamento com Carlos Silva foi confirmado para 4 de mar. às 14:00.',
    time: 'Há 2 horas',
    emoji: '✅',
  },
  {
    id: '2',
    type: 'lembrete',
    title: 'Lembrete de agendamento',
    body: 'Você tem um agendamento amanhã com Mariana Santos às 10:00.',
    time: 'Há 5 horas',
    emoji: '🔔',
  },
  {
    id: '3',
    type: 'promo',
    title: 'Oferta especial!',
    body: 'Ana Costa está com 20% de desconto em massagens até o fim do mês.',
    time: 'Ontem',
    emoji: '🎉',
  },
];

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notificações</Text>
        <TouchableOpacity>
          <Text style={styles.markAll}>Marcar todas como lidas</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {NOTIFICATIONS.map((n) => (
          <TouchableOpacity key={n.id} style={styles.card} activeOpacity={0.8}>
            <View style={styles.iconBox}>
              <Text style={styles.icon}>{n.emoji}</Text>
            </View>
            <View style={styles.content}>
              <Text style={styles.notifTitle}>{n.title}</Text>
              <Text style={styles.notifBody}>{n.body}</Text>
              <Text style={styles.notifTime}>{n.time}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {NOTIFICATIONS.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔕</Text>
            <Text style={styles.emptyText}>Nenhuma notificação</Text>
          </View>
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
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 22,
  },
  content: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
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
  },
});
