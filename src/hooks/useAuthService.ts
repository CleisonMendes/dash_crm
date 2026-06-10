
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';

interface AuthResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    created_at: string;
  };
}

export const useAuthService = () => {
  const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  };

  const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
  };

  const signUpUser = async (email: string, password: string, name: string, role: string = 'vendedor'): Promise<AuthResponse> => {
    try {
      console.log('Iniciando cadastro para:', email);
      
      // Verificar se o email já existe
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Erro ao verificar usuário:', checkError);
        return {
          success: false,
          message: 'Erro interno do servidor'
        };
      }

      if (existingUser) {
        return {
          success: false,
          message: 'Este e-mail já está cadastrado'
        };
      }

      // Validar role
      const validRoles = ['admin', 'vendedor', 'gerente_vendas', 'financeiro'];
      if (!validRoles.includes(role)) {
        return {
          success: false,
          message: 'Perfil de usuário inválido'
        };
      }

      // Criptografar senha
      const passwordHash = await hashPassword(password);

      // Criar usuário diretamente na tabela
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert([{
          email,
          name,
          password_hash: passwordHash,
          role
        }])
        .select('id, email, name, role, created_at')
        .single();

      if (insertError) {
        console.error('Erro ao criar usuário:', insertError);
        return {
          success: false,
          message: 'Erro ao criar usuário'
        };
      }

      return {
        success: true,
        message: 'Usuário criado com sucesso',
        user: {
          id: insertData.id,
          email: insertData.email,
          name: insertData.name,
          role: insertData.role,
          created_at: insertData.created_at
        }
      };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  };

  const signInUser = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      console.log('Iniciando login para:', email);
      
      // Buscar usuário por email incluindo role
      const { data: userData, error } = await supabase
        .from('users')
        .select('id, email, name, password_hash, role, created_at')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        console.error('Erro no login:', error);
        return {
          success: false,
          message: 'E-mail ou senha inválidos'
        };
      }

      if (!userData) {
        return {
          success: false,
          message: 'E-mail ou senha inválidos'
        };
      }

      // Verificar senha
      const isPasswordValid = await comparePassword(password, userData.password_hash);

      if (!isPasswordValid) {
        return {
          success: false,
          message: 'E-mail ou senha inválidos'
        };
      }

      return {
        success: true,
        message: 'Login realizado com sucesso',
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          created_at: userData.created_at
        }
      };
    } catch (error) {
      console.error('Erro no login:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  };

  return {
    signUpUser,
    signInUser
  };
};
