import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, getToken, setToken, removeToken, Usuario } from '../services/apiService';

// ─── Tipos ────────────────────────────────────────────────────
interface AuthContextData {
  usuario: Usuario | null;
  token: string | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  registro: (dados: {
    nome: string;
    email: string;
    senha: string;
    tipo: 'cliente' | 'empreendedor';
    telefone?: string;
    profissao?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  recarregarPerfil: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// ─── Provider ─────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Recuperar sessão salva ao abrir o app
  useEffect(() => {
    async function carregarSessao() {
      try {
        const tokenSalvo = await getToken();
        if (tokenSalvo) {
          setTokenState(tokenSalvo);
          const perfil = await authService.perfil();
          setUsuario(perfil);
        }
      } catch {
        // Token expirado ou inválido — limpar
        await removeToken();
        setTokenState(null);
        setUsuario(null);
      } finally {
        setLoading(false);
      }
    }
    carregarSessao();
  }, []);

  async function login(email: string, senha: string) {
    const response = await authService.login(email, senha);
    await setToken(response.token);
    setTokenState(response.token);
    setUsuario(response.usuario);
  }

  async function registro(dados: {
    nome: string;
    email: string;
    senha: string;
    tipo: 'cliente' | 'empreendedor';
    telefone?: string;
    profissao?: string;
  }) {
    const response = await authService.registro(dados);
    await setToken(response.token);
    setTokenState(response.token);
    setUsuario(response.usuario);
  }

  async function logout() {
    await removeToken();
    setTokenState(null);
    setUsuario(null);
  }

  async function recarregarPerfil() {
    const perfil = await authService.perfil();
    setUsuario(perfil);
  }

  return (
    <AuthContext.Provider
      value={{ usuario, token, loading, login, registro, logout, recarregarPerfil }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
