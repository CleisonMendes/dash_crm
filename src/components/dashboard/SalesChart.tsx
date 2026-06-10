
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SalesData {
  date: string;
  vendas: number;
  lucro: number;
}

export default function SalesChart() {
  const [data, setData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      
      // Buscar vendas dos últimos 7 dias
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: sales, error } = await supabase
        .from('sales')
        .select('created_at, preco_venda, lucro_total')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching sales data:', error);
        return;
      }

      // Agrupar vendas por data
      const salesByDate: { [key: string]: { vendas: number; lucro: number } } = {};
      
      // Inicializar todos os dias dos últimos 7 dias com valor 0
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        salesByDate[dateKey] = { vendas: 0, lucro: 0 };
      }

      // Adicionar dados reais
      sales?.forEach(sale => {
        const dateKey = sale.created_at.split('T')[0];
        if (salesByDate[dateKey]) {
          salesByDate[dateKey].vendas += sale.preco_venda;
          salesByDate[dateKey].lucro += sale.lucro_total;
        }
      });

      const chartData: SalesData[] = Object.entries(salesByDate).map(([date, values]) => ({
        date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        vendas: values.vendas,
        lucro: values.lucro
      }));

      setData(chartData);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Evolução de Vendas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Evolução de Vendas (Últimos 7 dias)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                `R$ ${Number(value).toFixed(2)}`, 
                name === 'vendas' ? 'Vendas' : 'Lucro'
              ]}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="vendas" 
              stroke="hsl(var(--burgundy-primary))" 
              strokeWidth={2}
              name="Vendas"
            />
            <Line 
              type="monotone" 
              dataKey="lucro" 
              stroke="hsl(var(--gold-primary))" 
              strokeWidth={2}
              name="Lucro"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
