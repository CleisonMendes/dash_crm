
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

export const Header = () => {
  const { user, signOut } = useAuth();

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleLogout = async () => {
    await signOut();
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'vendedor':
        return 'Vendedor';
      case 'gerente_vendas':
        return 'Gerente de Vendas';
      case 'financeiro':
        return 'Financeiro';
      default:
        return role;
    }
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-foreground">Sistema Financeiro</h1>
          {user && (
            <div className="text-sm text-muted-foreground">
              {user.nome} - {getRoleDisplay(user.role)}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            title="Atualizar dados"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
          
          <NotificationCenter />
          
          <ThemeToggle />
          
          {user && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
