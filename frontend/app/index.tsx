import { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Calendar, Clock, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const { usuario, loading } = useAuth();

  // ─── Guard: se já autenticado, redirecionar para tela correta ──
  useEffect(() => {
    if (!loading && usuario) {
      if (usuario.tipo === 'empreendedor') {
        router.replace('/tabs/empreendedor');
      } else {
        router.replace('/tabs');
      }
    }
  }, [usuario, loading]);

  // Mostrar loading enquanto verifica sessão
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.logoBox}>
          <Calendar size={24} color="#fff" />
        </View>
        <ActivityIndicator color="#6C63FF" style={{ marginTop: 24 }} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  // Não mostrar landing se já autenticado (o useEffect vai redirecionar)
  if (usuario) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoBox}>
          <Calendar size={20} color="#fff" />
        </View>
        <Text style={styles.logoText}>AgendaFácil</Text>
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Sparkles size={14} />
          <Text style={styles.badgeText}> Pontualidade que encanta clientes</Text>
        </View>

        <Text style={styles.title}>
          Sua agenda <Text style={styles.highlight}>profissional</Text>, simples e moderna.
        </Text>

        <Text style={styles.subtitle}>
          Empreendedores e clientes em sintonia. Cadastre serviços, gerencie horários e nunca mais perca um cliente por atraso.
        </Text>

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push('/auth/register')}
          >
            <Text style={styles.primaryText}>Começar agora</Text>
            <ArrowRight size={16} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.outlineText}>Já tenho conta</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Features */}
      <View style={styles.features}>
        {[
          {
            icon: Calendar,
            title: 'Agenda inteligente',
            desc: 'Sem conflitos de horário, com disponibilidade automática.',
          },
          {
            icon: Clock,
            title: 'Métricas de pontualidade',
            desc: 'Acompanhe seu percentual de atendimentos no horário.',
          },
          {
            icon: CheckCircle2,
            title: 'Avaliação dos clientes',
            desc: 'Construa reputação com reviews verificados.',
          },
        ].map((f, i) => {
          const Icon = f.icon;
          return (
            <View key={i} style={styles.card}>
              <View style={styles.cardIcon}>
                <Icon size={20} color="#6C63FF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{f.title}</Text>
                <Text style={styles.cardDesc}>{f.desc}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  hero: {
    marginTop: 40,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
  },
  highlight: {
    color: '#6C63FF',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 10,
    color: '#64748b',
    lineHeight: 20,
  },
  buttons: {
    marginTop: 24,
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: '#6C63FF',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  outlineBtn: {
    borderWidth: 2,
    borderColor: '#6C63FF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  outlineText: {
    color: '#6C63FF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  features: {
    marginTop: 40,
    gap: 12,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDesc: {
    color: '#64748b',
    fontSize: 12,
  },
});