
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as AppUser } from '@/types/financial';
import { useAuthService } from '@/hooks/useAuthService';

interface AuthContextType {
  user: AppUser | null;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, nome: string, role?: AppUser['role']) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { signInUser, signUpUser } = useAuthService();

  useEffect(() => {
    // Verificar usuário salvo no localStorage
    const savedUser = localStorage.getItem('finance_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        console.log('Usuário carregado do localStorage:', userData);
      } catch (error) {
        console.error('Erro ao carregar usuário salvo:', error);
        localStorage.removeItem('finance_user');
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Tentando fazer login com:', email);
      
      const response = await signInUser(email, password);

      if (!response.success) {
        console.error('Erro no login:', response.message);
        return { error: response.message };
      }

      // Criar objeto de usuário customizado com role do banco
      const customUser: AppUser = {
        id: response.user!.id,
        nome: response.user!.name,
        email: response.user!.email,
        role: response.user!.role as AppUser['role'],
        telefone: null,
        cpf_cnpj: null,
        created_at: response.user!.created_at
      };

      setUser(customUser);
      localStorage.setItem('finance_user', JSON.stringify(customUser));
      console.log('Login realizado com sucesso:', customUser);
      
      return {};
    } catch (error) {
      console.error('Erro no login:', error);
      return { error: 'Erro inesperado ao fazer login' };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, nome: string, role: AppUser['role'] = 'vendedor') => {
    try {
      setIsLoading(true);
      console.log('Tentando cadastrar usuário:', email);
      
      const response = await signUpUser(email, password, nome, role);

      if (!response.success) {
        console.error('Erro no cadastro:', response.message);
        return { error: response.message };
      }

      // Após cadastro bem-sucedido, fazer login automaticamente
      console.log('Cadastro realizado, fazendo login automático...');
      const loginResult = await signIn(email, password);
      return loginResult;
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { error: 'Erro inesperado ao criar conta' };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      setUser(null);
      localStorage.removeItem('finance_user');
      console.log('Logout realizado');
    } catch (error) {
      console.error('Erro ao sair:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      console.log('Funcionalidade de reset de senha não implementada ainda');
      return { error: 'Funcionalidade em desenvolvimento' };
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      return { error: 'Erro ao enviar email de recuperação' };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      signIn, 
      signUp, 
      signOut, 
      resetPassword,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
