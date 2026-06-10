
import { useState, useEffect } from 'react';
import { Notification } from '@/types/financial';
import { useAuth } from '@/contexts/AuthContext';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Mock notifications para demonstração
  const mockNotifications: Notification[] = [
    {
      id: '1',
      user_id: user?.id || '',
      type: 'low_stock',
      title: 'Estoque Baixo',
      message: 'O produto Lençol Premium está com apenas 3 unidades em estoque.',
      read: false,
      created_at: new Date().toISOString(),
      related_id: '1'
    },
    {
      id: '2',
      user_id: user?.id || '',
      type: 'overdue_payment',
      title: 'Pagamento em Atraso',
      message: 'O cliente Maria Silva possui parcelas em atraso.',
      read: false,
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
      related_id: '1'
    }
  ];

  const fetchNotifications = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Por enquanto usando mock data
      const filteredNotifications = mockNotifications.filter(n => 
        user.role === 'admin' || n.user_id === user.id
      );
      
      setNotifications(filteredNotifications);
      setUnreadCount(filteredNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
    }
  };

  const checkOverduePayments = async () => {
    try {
      // Mock function - em produção faria a verificação real
      console.log('Verificando pagamentos em atraso...');
    } catch (error) {
      console.error('Erro ao verificar pagamentos em atraso:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Verificar pagamentos em atraso periodicamente
      checkOverduePayments();
      const interval = setInterval(checkOverduePayments, 60000); // A cada minuto
      
      return () => clearInterval(interval);
    }
  }, [user]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    fetchNotifications
  };
};
