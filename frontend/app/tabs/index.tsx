import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { PROFESSIONALS, CATEGORIES } from '../../constants/data';

function ProfessionalCard({ professional }: { professional: typeof PROFESSIONALS[0] }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85}>
      <View style={styles.cardContent}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>
            {professional.profession === 'Barbeiro' ? '✂️' :
             professional.profession === 'Manicure' ? '💅' :
             professional.profession === 'Personal Trainer' ? '🏋️' : '💆'}
          </Text>
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <View style={styles.cardHeader}>
            <Text style={styles.professionalName}>{professional.name}</Text>
            <View style={styles.priceBlock}>
              <Text style={styles.priceLabel}>A partir de</Text>
              <Text style={styles.price}>R$ {professional.startingPrice}</Text>
            </View>
          </View>

          <Text style={styles.profession}>{professional.profession}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.rating}>{professional.rating}</Text>
            <Text style={styles.reviews}>({professional.reviews})</Text>
            <Text style={styles.metaDivider}>  🕐</Text>
            <Text style={styles.duration}>{professional.duration}</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Services tags */}
      <View style={styles.tags}>
        {professional.services.map((svc, i) => (
          <View key={i} style={styles.tag}>
            <Text style={styles.tagText}>{svc}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('todos');

  const filtered = PROFESSIONALS.filter((p) => {
    const matchCategory = activeCategory === 'todos' || p.category === activeCategory;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.profession.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, Cliente! 👋</Text>
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
          {filtered.map((p) => (
            <ProfessionalCard key={p.id} professional={p} />
          ))}
          {filtered.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>Nenhum profissional encontrado</Text>
            </View>
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
  reviews: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 2,
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
  },
});
