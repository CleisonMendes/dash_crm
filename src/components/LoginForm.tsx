
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Crown, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const { signIn, resetPassword, isLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos.',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: 'Erro no login',
        description: error,
        variant: 'destructive',
      });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast({
        title: 'Erro',
        description: 'Por favor, digite seu email.',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await resetPassword(resetEmail);
    
    if (error) {
      toast({
        title: 'Erro',
        description: error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Email enviado',
        description: 'Verifique seu email para redefinir sua senha.',
      });
      setShowForgotPassword(false);
      setResetEmail('');
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-burgundy-dark/10 to-background p-4">
        <Card className="w-full max-w-md border-gold-primary/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-gold-primary rounded-xl flex items-center justify-center mx-auto">
              <Crown className="w-8 h-8 text-burgundy-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-gold-primary">Recuperar Senha</CardTitle>
            <CardDescription className="text-muted-foreground">
              Digite seu email para receber instruções de recuperação
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Enviando...' : 'Enviar Email de Recuperação'}
              </Button>
              
              <Button 
                type="button" 
                variant="ghost"
                className="w-full"
                onClick={() => setShowForgotPassword(false)}
              >
                Voltar ao Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-burgundy-dark/10 to-background p-4">
      <Card className="w-full max-w-md border-gold-primary/20 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-gold-primary rounded-xl flex items-center justify-center mx-auto">
            <Crown className="w-8 h-8 text-burgundy-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-gold-primary">FinanceControl</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sistema de Gestão Financeira
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
            
            <Button 
              type="button" 
              variant="ghost"
              className="w-full text-sm"
              onClick={() => setShowForgotPassword(true)}
            >
              Esqueci minha senha
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
