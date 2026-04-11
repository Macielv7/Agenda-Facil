export const PROFESSIONALS = [
  {
    id: '1',
    name: 'Carlos Silva',
    profession: 'Barbeiro',
    rating: 4.8,
    reviews: 127,
    duration: '30min',
    startingPrice: 25,
    category: 'beleza',
    services: ['Corte Masculino', 'Barba', 'Corte + Barba'],
    image: null,
  },
  {
    id: '2',
    name: 'Mariana Santos',
    profession: 'Manicure',
    rating: 4.9,
    reviews: 203,
    duration: '45min',
    startingPrice: 35,
    category: 'beleza',
    services: ['Manicure', 'Pedicure', 'Unhas Decoradas'],
    image: null,
  },
  {
    id: '3',
    name: 'Pedro Oliveira',
    profession: 'Personal Trainer',
    rating: 4.7,
    reviews: 89,
    duration: '60min',
    startingPrice: 60,
    category: 'saude',
    services: ['Treino Individual', 'Avaliação Física', 'Plano Mensal'],
    image: null,
  },
  {
    id: '4',
    name: 'Ana Costa',
    profession: 'Massoterapeuta',
    rating: 5.0,
    reviews: 156,
    duration: '60min',
    startingPrice: 50,
    category: 'bem-estar',
    services: ['Massagem Relaxante', 'Drenagem', 'Shiatsu'],
    image: null,
  },
];

export const BOOKINGS = [
  {
    id: 'b1',
    professionalName: 'Carlos Silva',
    profession: 'Barbeiro',
    service: 'Corte + Barba',
    date: '4 de mar. de 2026',
    time: '14:00',
    value: 60,
    status: 'confirmado',
  },
  {
    id: 'b2',
    professionalName: 'Mariana Santos',
    profession: 'Manicure',
    service: 'Unhas Decoradas',
    date: '7 de mar. de 2026',
    time: '10:00',
    value: 80,
    status: 'pendente',
  },
  {
    id: 'b3',
    professionalName: 'Ana Costa',
    profession: 'Massoterapeuta',
    service: 'Massagem Relaxante',
    date: '10 de mar. de 2026',
    time: '16:00',
    value: 90,
    status: 'cancelado',
  },
];

export const CATEGORIES = [
  { id: 'todos', label: 'Todos' },
  { id: 'beleza', label: 'Beleza' },
  { id: 'saude', label: 'Saúde' },
  { id: 'bem-estar', label: 'Bem-estar' },
];

export const STATUS_LABELS: Record<string, string> = {
  confirmado: 'Confirmado',
  pendente: 'Pendente',
  cancelado: 'Cancelado',
};

export const STATUS_COLORS: Record<string, string> = {
  confirmado: '#22C55E',
  pendente: '#F59E0B',
  cancelado: '#EF4444',
};

export const STATUS_BG: Record<string, string> = {
  confirmado: '#DCFCE7',
  pendente: '#FEF3C7',
  cancelado: '#FEE2E2',
};
