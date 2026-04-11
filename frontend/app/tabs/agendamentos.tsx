import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { BOOKINGS, STATUS_LABELS, STATUS_COLORS, STATUS_BG } from '../../constants/data';

const FILTER_TABS = [
  { id: 'todos', label: 'Todos' },
  { id: 'confirmado', label: 'Confirmados' },
  { id: 'pendente', label: 'Pendentes' },
  { id: 'cancelado', label: 'Cancelados' },
];

function BookingCard({ booking, onCancel, onConfirm, onRefuse }: {
  booking: typeof BOOKINGS[0];
  onCancel: (id: string) => void;
  onConfirm: (id: string) => void;
  onRefuse: (id: string) => void;
}) {
  const statusColor = STATUS_COLORS[booking.status];
  const statusBg = STATUS_BG[booking.status];
  const statusLabel = STATUS_LABELS[booking.status];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {booking.status === 'confirmado' ? '✅ ' :
             booking.status === 'pendente' ? '⏰ ' : '❌ '}
            {statusLabel}
          </Text>
        </View>
        <Text style={styles.bookingId}>ID: {booking.id}</Text>
      </View>

      <Text style={styles.professionalName}>{booking.professionalName}</Text>
      <Text style={styles.profession}>{booking.profession}</Text>

      <View style={styles.serviceBox}>
        <Text style={styles.serviceLabel}>Serviço</Text>
        <Text style={styles.serviceName}>{booking.service}</Text>
      </View>

      <View style={styles.dateRow}>
        <Text style={styles.dateText}>📅  {booking.date}</Text>
        <Text style={styles.timeText}>🕐  {booking.time}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.valorLabel}>Valor</Text>
          <Text style={styles.valor}>R$ {booking.value}</Text>
        </View>

        <View style={styles.actions}>
          {booking.status === 'confirmado' && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => onCancel(booking.id)}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          )}
          {booking.status === 'pendente' && (
            <>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={() => onConfirm(booking.id)}
              >
                <Text style={styles.confirmBtnText}>Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.refuseBtn}
                onPress={() => onRefuse(booking.id)}
              >
                <Text style={styles.refuseBtnText}>Recusar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

export default function AgendamentosScreen() {
  const [activeFilter, setActiveFilter] = useState('todos');
  const [bookings, setBookings] = useState(BOOKINGS);

  const filtered = bookings.filter(
    (b) => activeFilter === 'todos' || b.status === activeFilter
  );

  const handleCancel = (id: string) => {
    Alert.alert('Cancelar', 'Deseja cancelar este agendamento?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim',
        style: 'destructive',
        onPress: () =>
          setBookings((prev) =>
            prev.map((b) => (b.id === id ? { ...b, status: 'cancelado' } : b))
          ),
      },
    ]);
  };

  const handleConfirm = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'confirmado' } : b))
    );
  };

  const handleRefuse = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'cancelado' } : b))
    );
  };

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
      >
        {filtered.map((b) => (
          <BookingCard
            key={b.id}
            booking={b}
            onCancel={handleCancel}
            onConfirm={handleConfirm}
            onRefuse={handleRefuse}
          />
        ))}
        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyText}>Nenhum agendamento encontrado</Text>
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
  },
});
