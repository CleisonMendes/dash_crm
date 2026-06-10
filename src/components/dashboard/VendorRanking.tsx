
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { VendorRanking as VendorRankingType } from '@/types/financial';
import { useAuth } from '@/contexts/AuthContext';
import { Trophy, TrendingUp } from 'lucide-react';

export const VendorRanking = () => {
  const [ranking, setRanking] = useState<VendorRankingType[]>([]);
  const [userPosition, setUserPosition] = useState<VendorRankingType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchRanking = async () => {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: salesData, error } = await supabase
        .from('sales')
        .select(`
          vendedor_id,
          preco_venda
        `)
        .gte('created_at', startOfMonth.toISOString());

      if (error) {
        console.error('Erro ao buscar vendas:', error);
        return;
      }

      // Buscar perfis dos vendedores separadamente
      const vendorIds = [...new Set(salesData?.map(s => s.vendedor_id) || [])];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, nome')
        .in('id', vendorIds);

      if (profilesError) {
        console.error('Erro ao buscar perfis:', profilesError);
        return;
      }

      // Criar mapa de perfis
      const profilesMap = profiles?.reduce((acc, profile) => {
        acc[profile.id] = profile.nome;
        return acc;
      }, {} as Record<string, string>) || {};

      // Agrupar vendas por vendedor
      const vendorSales = salesData?.reduce((acc, sale) => {
        const vendorId = sale.vendedor_id;
        if (!acc[vendorId]) {
          acc[vendorId] = {
            vendedor_id: vendorId,
            vendedor_nome: profilesMap[vendorId] || 'Vendedor',
            total_vendas: 0,
            posicao: 0
          };
        }
        acc[vendorId].total_vendas += sale.preco_venda;
        return acc;
      }, {} as Record<string, VendorRankingType>) || {};

      // Converter para array e ordenar
      const rankingArray = Object.values(vendorSales)
        .sort((a, b) => b.total_vendas - a.total_vendas)
        .map((vendor, index) => ({
          ...vendor,
          posicao: index + 1,
          medal: (index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : undefined) as '🥇' | '🥈' | '🥉' | undefined
        }));

      setRanking(rankingArray.slice(0, 5)); // Top 5

      // Encontrar posição do usuário atual
      if (user?.role === 'vendedor') {
        const currentUserRanking = rankingArray.find(r => r.vendedor_id === user.id);
        setUserPosition(currentUserRanking || null);
      }
    } catch (error) {
      console.error('Erro ao buscar ranking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRanking();
    
    // Atualizar ranking a cada 5 minutos
    const interval = setInterval(fetchRanking, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Ranking de Vendedores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Carregando ranking...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (user?.role === 'vendedor' && userPosition) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Minha Posição
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {userPosition.medal || `${userPosition.posicao}º`}
            </div>
            <p className="text-muted-foreground mb-2">Posição no ranking</p>
            <p className="text-lg font-semibold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(userPosition.total_vendas)}
            </p>
            <p className="text-sm text-muted-foreground">Vendas no mês</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Top 5 Vendedores do Mês
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ranking.map((vendor) => (
            <div
              key={vendor.vendedor_id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">
                  {vendor.medal || `${vendor.posicao}º`}
                </div>
                <div>
                  <p className="font-medium">{vendor.vendedor_nome}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(vendor.total_vendas)}
                  </p>
                </div>
              </div>
              {vendor.posicao <= 3 && (
                <Badge variant="secondary">
                  Top {vendor.posicao}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
