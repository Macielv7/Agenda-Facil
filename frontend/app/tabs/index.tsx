import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { servicosService, Servico } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { CATEGORIES } from '../../constants/data';

const PROFESSION_EMOJI: Record<string, string> = {
  barbeiro: '✂️',
  manicure: '💅',
  'personal trainer': '🏋️',
  massoterapeuta: '💆',
  fisioterapeuta: '🩺',
  nutricionista: '🥗',
  default: '👤',
};

function getProfessionEmoji(profissao?: string): string {
  if (!profissao) return PROFESSION_EMOJI.default;
  const key = profissao.toLowerCase();
  return PROFESSION_EMOJI[key] || PROFESSION_EMOJI.default;
}

// Agrupa serviços por profissional para exibir como card
interface ProfissionalCard {
  profissional_id: number;
  profissional_nome: string;
  foto_url?: string;
  avaliacao_media: number;
  categoria: string;
  servicos: Servico[];
  preco_minimo: number;
  duracao_min: number;
}

function agruparPorProfissional(servicos: Servico[]): ProfissionalCard[] {
  const mapa: Record<number, ProfissionalCard> = {};
  for (const s of servicos) {
    if (!mapa[s.profissional_id]) {
      mapa[s.profissional_id] = {
        profissional_id: s.profissional_id,
        profissional_nome: s.profissional_nome || 'Profissional',
        foto_url: s.foto_url,
        avaliacao_media: s.avaliacao_media || 0,
        categoria: s.categoria,
        servicos: [],
        preco_minimo: s.preco,
        duracao_min: s.duracao_min,
      };
    }
    mapa[s.profissional_id].servicos.push(s);
    if (s.preco < mapa[s.profissional_id].preco_minimo) {
      mapa[s.profissional_id].preco_minimo = s.preco;
    }
  }
  return Object.values(mapa);
}

function ProfessionalCard({ card }: { card: ProfissionalCard }) {
  const handlePress = () => {
    router.push({
      pathname: '/tabs/agendar',
      params: {
        empreendedor_id: String(card.profissional_id),
        empreendedor_nome: card.profissional_nome,
      },
    });
  };

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={handlePress}>
      <View style={styles.cardContent}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>
            {getProfessionEmoji(card.servicos[0]?.nome)}
          </Text>
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <View style={styles.cardHeader}>
            <Text style={styles.professionalName}>{card.profissional_nome}</Text>
            <View style={styles.priceBlock}>
              <Text style={styles.priceLabel}>A partir de</Text>
              <Text style={styles.price}>R$ {card.preco_minimo.toFixed(0)}</Text>
            </View>
          </View>

          <Text style={styles.profession}>{card.categoria}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.rating}>{card.avaliacao_media.toFixed(1)}</Text>
            <Text style={styles.metaDivider}>  🕐</Text>
            <Text style={styles.duration}>{card.duracao_min}min</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Services tags */}
      <View style={styles.tags}>
        {card.servicos.slice(0, 3).map((svc) => (
          <View key={svc.id} style={styles.tag}>
            <Text style={styles.tagText}>{svc.nome}</Text>
          </View>
        ))}
        {card.servicos.length > 3 && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>+{card.servicos.length - 3}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { usuario } = useAuth();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('todos');
  const [profissionais, setProfissionais] = useState<ProfissionalCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState('');

  const carregarServicos = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setErro('');
    try {
      const params = activeCategory !== 'todos' ? { categoria: activeCategory } : undefined;
      const servicos = await servicosService.listar(params);
      setProfissionais(agruparPorProfissional(servicos));
    } catch (e: any) {
      setErro(e.message || 'Erro ao carregar profissionais.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    carregarServicos();
  }, [carregarServicos]);

  const onRefresh = () => {
    setRefreshing(true);
    carregarServicos(true);
  };

  const filtered = profissionais.filter((p) => {
    const matchSearch =
      p.profissional_nome.toLowerCase().includes(search.toLowerCase()) ||
      p.servicos.some((s) => s.nome.toLowerCase().includes(search.toLowerCase()));
    return matchSearch;
  });

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Olá, {usuario?.nome?.split(' ')[0] || 'Cliente'}! 👋
            </Text>
            <Text style={styles.subtitle}>Encontre seu profissional</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar profissional ou serviço..."
            placeholderTextColor={Colors.gray400}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryBtn, activeCategory === cat.id && styles.categoryActive]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === cat.id && styles.categoryTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* List */}
        <View style={styles.list}>
          {loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Carregando profissionais...</Text>
            </View>
          ) : erro ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>⚠️</Text>
              <Text style={styles.emptyText}>{erro}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => carregarServicos()}>
                <Text style={styles.retryText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>Nenhum profissional encontrado</Text>
            </View>
          ) : (
            filtered.map((p) => (
              <ProfessionalCard key={p.profissional_id} card={p} />
            ))
          )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.white,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 14,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: Colors.text,
  },
  categoriesScroll: {
    marginBottom: 4,
  },
  categoriesContent: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  categoryBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    marginRight: 8,
  },
  categoryActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  categoryTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 24,
    gap: 12,
    marginTop: 4,
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
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    gap: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 36,
  },
  cardInfo: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  professionalName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  profession: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 12,
  },
  rating: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 3,
  },
  metaDivider: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  duration: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.gray100,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
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
