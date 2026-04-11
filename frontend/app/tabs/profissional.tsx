import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';

const WEEK_DAYS = [
  { short: 'QUA.', day: 4 },
  { short: 'QUI.', day: 5 },
  { short: 'SEX.', day: 6 },
  { short: 'SÁB.', day: 7 },
  { short: 'DOM.', day: 8 },
];

const TODAY_BOOKINGS = [
  {
    id: 'b1',
    client: 'Cliente',
    service: 'Corte + Barba',
    time: '14:00',
    value: 60,
    status: 'confirmado',
  },
];

export default function ProfissionalScreen() {
  const [selectedDay, setSelectedDay] = useState(4);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroGreeting}>Olá, Carlos! 👋</Text>
              <Text style={styles.heroRole}>Barbeiro Profissional</Text>
            </View>
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => router.replace('/auth/login')}
            >
              <Text style={styles.logoutIcon}>→</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>Hoje</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>13</Text>
              <Text style={styles.statLabel}>Esta semana</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>R$ 5</Text>
              <Text style={styles.statLabel}>Receita</Text>
            </View>
          </View>
        </View>

        {/* Agenda do dia */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agenda do dia</Text>

          {/* Day selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daysRow}
          >
            {WEEK_DAYS.map((d) => (
              <TouchableOpacity
                key={d.day}
                style={[styles.dayBtn, selectedDay === d.day && styles.dayBtnActive]}
                onPress={() => setSelectedDay(d.day)}
              >
                <Text style={[styles.dayShort, selectedDay === d.day && styles.dayTextActive]}>
                  {d.short}
                </Text>
                <Text style={[styles.dayNumber, selectedDay === d.day && styles.dayTextActive]}>
                  {d.day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Quick actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionIcon}>🕐</Text>
              <Text style={styles.actionText}>Definir Horários</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionIcon}>+</Text>
              <Text style={styles.actionText}>Novo Agendamento</Text>
            </TouchableOpacity>
          </View>

          {/* Today's bookings */}
          <View style={styles.bookingsHeader}>
            <Text style={styles.bookingsTitle}>Agendamentos ({TODAY_BOOKINGS.length})</Text>
            <TouchableOpacity onPress={() => router.push('/tabs/agendamentos')}>
              <Text style={styles.verTodos}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {TODAY_BOOKINGS.map((b) => (
            <View key={b.id} style={styles.bookingCard}>
              <View style={styles.bookingLeft}>
                <View style={styles.clientAvatar}>
                  <Text style={styles.clientAvatarIcon}>👤</Text>
                </View>
                <View>
                  <Text style={styles.clientName}>{b.client}</Text>
                  <Text style={styles.clientService}>{b.service}</Text>
                </View>
              </View>
              <View style={styles.confirmedBadge}>
                <Text style={styles.confirmedText}>Confirmado</Text>
              </View>
            </View>
          ))}

          {TODAY_BOOKINGS.map((b) => (
            <View key={b.id + '_footer'} style={styles.bookingFooter}>
              <Text style={styles.bookingTime}>🕐 {b.time}</Text>
              <Text style={styles.bookingValue}>R$ {b.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

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
    fontSize: 14,
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
    color: Colors.primary,
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
  bookingCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  bookingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  confirmedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  confirmedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#22C55E',
  },
  bookingFooter: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginTop: -4,
  },
  bookingTime: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  bookingValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
});
