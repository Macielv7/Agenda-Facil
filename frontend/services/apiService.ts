import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/api';

// ─── Token helpers ────────────────────────────────────────────
const TOKEN_KEY = '@agendafacil:token';

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

// ─── Core fetch wrapper ───────────────────────────────────────
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function request<T>(
  path: string,
  method: HttpMethod = 'GET',
  body?: object,
  requireAuth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requireAuth) {
    const token = await getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.erro || `Erro ${response.status}`);
  }

  return data as T;
}

// ─── Tipos ────────────────────────────────────────────────────
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: 'cliente' | 'empreendedor';
  telefone?: string;
  foto_url?: string;
  profissao?: string;
  avaliacao_media?: number;
  criado_em?: string;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
  mensagem?: string;
}

export interface Servico {
  id: number;
  empreendedor_id: number;
  nome: string;
  descricao?: string;
  preco: number;
  duracao_min: number;
  categoria: 'beleza' | 'saude' | 'bem-estar';
  ativo: number;
  empreendedor_nome?: string;
  foto_url?: string;
  avaliacao_media?: number;
  profissao?: string;
}

export interface Agendamento {
  profissional_nome: string | undefined;
  id: number;
  cliente_id: number;
  empreendedor_id: number;
  servico_id: number;
  data_hora: string;
  status: 'pendente' | 'confirmado' | 'cancelado' | 'concluido';
  valor: number;
  observacao?: string;
  criado_em?: string;
  atualizado_em?: string;
  servico_nome?: string;
  duracao_min?: number;
  cliente_nome?: string;
  cliente_foto?: string;
  empreendedor_nome?: string;
  empreendedor_foto?: string;
  profissao?: string;
}

export interface Notificacao {
  id: number;
  usuario_id: number;
  titulo: string;
  mensagem: string;
  tipo: 'agendamento' | 'lembrete' | 'promo' | 'sistema';
  lida: number;
  criado_em: string;
}

export interface Produto {
  id: number;
  empreendedor_id: number;
  nome: string;
  descricao?: string;
  preco: number;
  estoque: number;
  categoria?: string;
  imagem_url?: string;
  ativo: number;
  empreendedor_nome?: string;
}

// ─── AUTH ─────────────────────────────────────────────────────
export const authService = {
  async login(email: string, senha: string): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/login', 'POST', { email, senha }, false);
  },

  async registro(dados: {
    nome: string;
    email: string;
    senha: string;
    tipo: 'cliente' | 'empreendedor';
    telefone?: string;
    profissao?: string;
  }): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/registro', 'POST', dados, false);
  },

  async perfil(): Promise<Usuario> {
    return request<Usuario>('/auth/perfil', 'GET');
  },

  async atualizarPerfil(dados: Partial<Pick<Usuario, 'nome' | 'telefone' | 'profissao'>>): Promise<{ mensagem: string }> {
    return request<{ mensagem: string }>('/auth/perfil', 'PUT', dados);
  },
};

// ─── SERVIÇOS ─────────────────────────────────────────────────
export const servicosService = {
  async listar(params?: { categoria?: string; empreendedor_id?: number }): Promise<Servico[]> {
    const query = new URLSearchParams();
    if (params?.categoria) query.append('categoria', params.categoria);
    if (params?.empreendedor_id) query.append('empreendedor_id', String(params.empreendedor_id));
    const qs = query.toString() ? `?${query}` : '';
    return request<Servico[]>(`/servicos${qs}`, 'GET', undefined, false);
  },

  async buscarPorId(id: number): Promise<Servico> {
    return request<Servico>(`/servicos/${id}`, 'GET', undefined, false);
  },

  async criar(dados: {
    nome: string;
    descricao?: string;
    preco: number;
    duracao_min?: number;
    categoria: string;
  }): Promise<{ id: number; mensagem: string }> {
    return request<{ id: number; mensagem: string }>('/servicos', 'POST', dados);
  },

  async atualizar(
    id: number,
    dados: Partial<{ nome: string; descricao: string; preco: number; duracao_min: number; categoria: string; ativo: number }>,
  ): Promise<{ mensagem: string }> {
    return request<{ mensagem: string }>(`/servicos/${id}`, 'PUT', dados);
  },

  async remover(id: number): Promise<{ mensagem: string }> {
    return request<{ mensagem: string }>(`/servicos/${id}`, 'DELETE');
  },
};

// ─── AGENDAMENTOS ─────────────────────────────────────────────
export const agendamentosService = {
  async listar(status?: string): Promise<Agendamento[]> {
    const qs = status ? `?status=${status}` : '';
    return request<Agendamento[]>(`/agendamentos${qs}`);
  },

  async buscarPorId(id: number): Promise<Agendamento> {
    return request<Agendamento>(`/agendamentos/${id}`);
  },

  async criar(dados: {
    empreendedor_id: number;
    servico_id: number;
    data_hora: string;
    observacao?: string;
  }): Promise<{ id: number; mensagem: string }> {
    return request<{ id: number; mensagem: string }>('/agendamentos', 'POST', dados);
  },

  async atualizarStatus(
    id: number,
    status: 'confirmado' | 'cancelado' | 'concluido',
  ): Promise<{ mensagem: string }> {
    return request<{ mensagem: string }>(`/agendamentos/${id}/status`, 'PATCH', { status });
  },

  async cancelar(id: number): Promise<{ mensagem: string }> {
    return request<{ mensagem: string }>(`/agendamentos/${id}`, 'DELETE');
  },
};

// ─── PRODUTOS ─────────────────────────────────────────────────
export const produtosService = {
  async listar(params?: { categoria?: string; profissional_id?: number }): Promise<Produto[]> {
    const query = new URLSearchParams();
    if (params?.categoria) query.append('categoria', params.categoria);
    if (params?.profissional_id) query.append('profissional_id', String(params.profissional_id));
    const qs = query.toString() ? `?${query}` : '';
    return request<Produto[]>(`/produtos${qs}`, 'GET', undefined, false);
  },

  async criar(dados: {
    nome: string;
    descricao?: string;
    preco: number;
    estoque?: number;
    categoria?: string;
  }): Promise<{ id: number; mensagem: string }> {
    return request<{ id: number; mensagem: string }>('/produtos', 'POST', dados);
  },

  async atualizar(
    id: number,
    dados: Partial<{ nome: string; descricao: string; preco: number; estoque: number; categoria: string }>,
  ): Promise<{ mensagem: string }> {
    return request<{ mensagem: string }>(`/produtos/${id}`, 'PUT', dados);
  },

  async remover(id: number): Promise<{ mensagem: string }> {
    return request<{ mensagem: string }>(`/produtos/${id}`, 'DELETE');
  },
};

// ─── NOTIFICAÇÕES ─────────────────────────────────────────────
export const notificacoesService = {
  async listar(): Promise<Notificacao[]> {
    return request<Notificacao[]>('/notificacoes');
  },

  async marcarLida(id: number): Promise<{ mensagem: string }> {
    return request<{ mensagem: string }>(`/notificacoes/${id}/lida`, 'PATCH');
  },

  async marcarTodasLidas(): Promise<{ mensagem: string }> {
    return request<{ mensagem: string }>('/notificacoes/marcar-todas', 'PATCH');
  },
};