
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MetricCard } from '@/components/dashboard/MetricCard';
import SalesChart from '@/components/dashboard/SalesChart';
import SalesTable from '@/components/dashboard/SalesTable';
import { VendorRanking } from '@/components/dashboard/VendorRanking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Users, ShoppingCart, Wallet, PiggyBank } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardMetrics {
  receita_total: number;
  valor_aberto: number;
  lucro_total: number;
  lucro_vendedor: number;
  lucro_dono: number;
  reserva_gastos: number;
  reserva_dizimo: number;
  saldo_livre: number;
  vendedores_ativos: number;
  vendas_periodo: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    receita_total: 0,
    valor_aberto: 0,
    lucro_total: 0,
    lucro_vendedor: 0,
    lucro_dono: 0,
    reserva_gastos: 0,
    reserva_dizimo: 0,
    saldo_livre: 0,
    vendedores_ativos: 0,
    vendas_periodo: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRealMetrics();
  }, [user]);

  const fetchRealMetrics = async () => {
    try {
      setIsLoading(true);
      
      // Buscar vendas do mês atual
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select(`
          *,
          installments(*)
        `)
        .gte('created_at', startOfMonth.toISOString());

      if (salesError) {
        console.error('Error fetching sales:', salesError);
        return;
      }

      // Calcular métricas reais
      const receita_total = sales?.reduce((sum, sale) => sum + sale.preco_venda, 0) || 0;
      const lucro_total = sales?.reduce((sum, sale) => sum + sale.lucro_total, 0) || 0;
      const lucro_vendedor = sales?.reduce((sum, sale) => sum + sale.lucro_vendedor, 0) || 0;
      const lucro_dono = sales?.reduce((sum, sale) => sum + sale.lucro_dono, 0) || 0;
      const reserva_gastos = sales?.reduce((sum, sale) => sum + sale.reserva_gastos, 0) || 0;
      const reserva_dizimo = sales?.reduce((sum, sale) => sum + sale.reserva_dizimo, 0) || 0;
      const saldo_livre = sales?.reduce((sum, sale) => sum + sale.saldo_livre, 0) || 0;

      // Calcular valor em aberto (parcelas não pagas)
      let valor_aberto = 0;
      sales?.forEach(sale => {
        sale.installments?.forEach((installment: any) => {
          valor_aberto += (installment.valor - installment.paid_amount);
        });
      });

      // Contar vendedores únicos
      const vendedoresUnicos = new Set(sales?.map(sale => sale.vendedor_id) || []);
      const vendedores_ativos = vendedoresUnicos.size;

      const vendas_periodo = sales?.length || 0;

      setMetrics({
        receita_total,
        valor_aberto,
        lucro_total,
        lucro_vendedor,
        lucro_dono,
        reserva_gastos,
        reserva_dizimo,
        saldo_livre,
        vendedores_ativos,
        vendas_periodo,
      });

    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Dashboard para Admin
  if (user?.role === 'admin') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">Visão geral do negócio</p>
        </div>

        {/* Métricas principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Receita Total"
            value={metrics.receita_total}
            icon={DollarSign}
            format="currency"
          />
          <MetricCard
            title="Valor em Aberto"
            value={metrics.valor_aberto}
            icon={TrendingUp}
            format="currency"
          />
          <MetricCard
            title="Vendedores Ativos"
            value={metrics.vendedores_ativos}
            icon={Users}
            format="number"
          />
          <MetricCard
            title="Vendas no Período"
            value={metrics.vendas_periodo}
            icon={ShoppingCart}
            format="number"
          />
        </div>

        {/* Distribuição de lucros */}
        {metrics.lucro_total > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lucro Vendedor</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.lucro_vendedor)}
                </div>
                <p className="text-xs text-muted-foreground">10% do lucro total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lucro Dono</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gold-primary">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.lucro_dono)}
                </div>
                <p className="text-xs text-muted-foreground">10% do lucro total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo Livre</CardTitle>
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gold-primary">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.saldo_livre)}
                </div>
                <p className="text-xs text-muted-foreground">40% do lucro total</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gráfico de vendas e ranking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesChart />
          <VendorRanking />
        </div>

        {/* Reservas */}
        {metrics.lucro_total > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Reservas</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Reserva Gastos (30%)</span>
                <span className="text-sm font-bold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.reserva_gastos)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Reserva Dízimo (10%)</span>
                <span className="text-sm font-bold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.reserva_dizimo)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-medium">Total Reservado</span>
                <span className="text-sm font-bold text-gold-primary">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    metrics.reserva_gastos + metrics.reserva_dizimo
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabela de vendas */}
        <SalesTable showAllColumns={true} />

        {/* Mensagem quando não há dados */}
        {metrics.vendas_periodo === 0 && !isLoading && (
          <Card>
            <CardContent className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma venda registrada</h3>
              <p className="text-muted-foreground mb-4">
                Comece registrando suas vendas ou importe dados através do painel administrativo.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Dashboard do vendedor (com dados reais filtrados por vendedor)
  const vendedorMetrics = {
    minhas_vendas: metrics.receita_total, // Aqui deveria filtrar por vendedor
    valor_recebido: metrics.receita_total - metrics.valor_aberto,
    parcelas_pendentes: metrics.valor_aberto,
    comissao: metrics.lucro_vendedor, // Aqui deveria filtrar por vendedor
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Meu Dashboard</h1>
        <p className="text-muted-foreground">Acompanhe suas vendas e comissões</p>
      </div>

      {/* Métricas do vendedor */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Minhas Vendas"
          value={vendedorMetrics.minhas_vendas}
          icon={ShoppingCart}
          format="currency"
        />
        <MetricCard
          title="Valor Recebido"
          value={vendedorMetrics.valor_recebido}
          icon={DollarSign}
          format="currency"
        />
        <MetricCard
          title="Parcelas Pendentes"
          value={vendedorMetrics.parcelas_pendentes}
          icon={TrendingUp}
          format="currency"
        />
        <MetricCard
          title="Minha Comissão"
          value={vendedorMetrics.comissao}
          icon={Wallet}
          format="currency"
        />
      </div>

      {/* Gráfico pessoal e ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart />
        <VendorRanking />
      </div>

      {/* Tabela de vendas pessoais */}
      <SalesTable showAllColumns={false} />

      {/* Mensagem quando não há dados */}
      {metrics.vendas_periodo === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma venda registrada</h3>
            <p className="text-muted-foreground mb-4">
              Suas vendas aparecerão aqui assim que forem registradas no sistema.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
