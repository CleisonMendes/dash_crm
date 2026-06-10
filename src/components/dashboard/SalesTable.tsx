import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Sale {
  id: string;
  created_at: string;
  preco_venda: number;
  quantidade: number;
  tipo_venda: 'retirada' | 'crediario';
  status: 'pendente' | 'concluida' | 'cancelada';
  product?: {
    nome: string;
  };
  client?: {
    nome: string;
  };
}

interface SalesTableProps {
  showAllColumns?: boolean;
}

export default function SalesTable({ showAllColumns = true }: SalesTableProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentSales();
  }, []);

  const fetchRecentSales = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('sales')
        .select(`
          id,
          created_at,
          preco_venda,
          quantidade,
          tipo_venda,
          status,
          products:product_id (nome),
          clients:client_id (nome)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching sales:', error);
        return;
      }

      const transformedSales: Sale[] = (data || []).map(sale => ({
        id: sale.id,
        created_at: sale.created_at,
        preco_venda: sale.preco_venda,
        quantidade: sale.quantidade,
        tipo_venda: sale.tipo_venda as 'retirada' | 'crediario',
        status: sale.status as 'pendente' | 'concluida' | 'cancelada',
        product: Array.isArray(sale.products) ? sale.products[0] : sale.products,
        client: Array.isArray(sale.clients) ? sale.clients[0] : sale.clients,
      }));

      setSales(transformedSales);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: { label: 'Pendente', variant: 'default' as const },
      concluida: { label: 'Concluída', variant: 'secondary' as const },
      cancelada: { label: 'Cancelada', variant: 'destructive' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Vendas Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando vendas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Vendas Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    {new Date(sale.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>{sale.product?.nome || 'N/A'}</TableCell>
                  <TableCell>{sale.client?.nome || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={sale.tipo_venda === 'retirada' ? 'outline' : 'secondary'}>
                      {sale.tipo_venda === 'retirada' ? 'Retirada' : 'Crediário'}
                    </Badge>
                  </TableCell>
                  <TableCell>R$ {sale.preco_venda.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(sale.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {sales.length === 0 && !loading && (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma venda registrada ainda.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
