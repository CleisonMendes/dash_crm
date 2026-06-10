
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useDataExport } from '@/hooks/useDataExport';
import ExcelImportDialog from '@/components/admin/ExcelImportDialog';
import { 
  Settings, 
  Download, 
  Upload, 
  Users, 
  Activity,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Save,
  Trash2
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FinancialConfig {
  id: string;
  retirada_markup: number;
  crediario_markup: number;
  pct_vendedor: number;
  pct_dono: number;
  pct_gastos: number;
  pct_dizimo: number;
  updated_at: string;
  updated_by?: string;
}

interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  resource: string;
  description?: string;
  ip_address?: string;
  created_at: string;
}

export default function AdminPanelPage() {
  const { user } = useAuth();
  const [config, setConfig] = useState<FinancialConfig | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);
  const { isExporting, exportToCSV, exportToExcel } = useDataExport();

  const statusConfig = {
    pendente: { 
      label: 'Pendente', 
      variant: 'default' as const, 
      className: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20' 
    },
    resolvido: { 
      label: 'Resolvido', 
      variant: 'secondary' as const, 
      className: 'bg-green-500/10 text-green-700 border-green-500/20' 
    },
    erro: { 
      label: 'Erro', 
      variant: 'destructive' as const, 
      className: 'bg-red-500/10 text-red-700 border-red-500/20' 
    },
    info: { 
      label: 'Info', 
      variant: 'outline' as const, 
      className: 'bg-blue-500/10 text-blue-700 border-blue-500/20' 
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchConfig();
      fetchAuditLogs();
    }
  }, [user]);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_config')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching config:', error);
        if (error.code === 'PGRST116') {
          const defaultConfig = {
            retirada_markup: 1.5,
            crediario_markup: 3.0,
            pct_vendedor: 0.1,
            pct_dono: 0.1,
            pct_gastos: 0.3,
            pct_dizimo: 0.1,
          };
          setConfig({
            id: '',
            ...defaultConfig,
            updated_at: new Date().toISOString(),
          });
        } else {
          throw error;
        }
      } else if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar configurações',
        variant: 'destructive',
      });
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching audit logs:', error);
        return;
      }
      
      const transformedLogs: AuditLog[] = (data || []).map(log => ({
        ...log,
        ip_address: log.ip_address ? String(log.ip_address) : undefined
      }));
      
      setAuditLogs(transformedLogs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  const updateConfig = async () => {
    if (!config || !user) {
      toast({
        title: 'Erro',
        description: 'Dados de configuração ou usuário não encontrados',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log('Salvando configuração:', config);

      // Verificar se o usuário é admin
      if (user.role !== 'admin') {
        toast({
          title: 'Erro',
          description: 'Acesso negado. Apenas administradores podem alterar configurações.',
          variant: 'destructive',
        });
        return;
      }

      const { data: newConfig, error: configError } = await supabase
        .from('financial_config')
        .insert({
          retirada_markup: config.retirada_markup,
          crediario_markup: config.crediario_markup,
          pct_vendedor: config.pct_vendedor,
          pct_dono: config.pct_dono,
          pct_gastos: config.pct_gastos,
          pct_dizimo: config.pct_dizimo,
          updated_by: user.id,
        })
        .select()
        .single();

      if (configError) {
        console.error('Error updating config:', configError);
        throw configError;
      }

      try {
        const { error: logError } = await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'UPDATE',
          resource: 'financial_config',
          description: 'Configurações financeiras atualizadas',
        });

        if (logError) {
          console.error('Error logging action:', logError);
        }
      } catch (logError) {
        console.error('Error creating audit log:', logError);
      }

      toast({
        title: 'Sucesso',
        description: 'Configurações atualizadas com sucesso',
      });

      await fetchConfig();
      await fetchAuditLogs();

    } catch (error) {
      console.error('Error updating config:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar configurações. Verifique se você tem permissão de administrador.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllData = async () => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Usuário não encontrado',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsClearingData(true);
      console.log('Iniciando limpeza de todos os dados...');

      // Verificar se o usuário é admin
      if (user.role !== 'admin') {
        toast({
          title: 'Erro',
          description: 'Acesso negado. Apenas administradores podem limpar dados.',
          variant: 'destructive',
        });
        return;
      }

      // Chamar a função clear_all_data diretamente sem verificar perfil
      const { error: clearError } = await supabase.rpc('clear_all_data');

      if (clearError) {
        console.error('Error clearing data:', clearError);
        // Tentar limpar manualmente se a função falhar
        console.log('Tentando limpeza manual...');
        
        // Deletar dados em ordem para evitar violações de foreign key
        await supabase.from('installments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('partial_payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('sales').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        
        console.log('Limpeza manual concluída');
      }

      // Registrar a ação no log
      try {
        const { error: logError } = await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'CLEAR_DATA',
          resource: 'all_data',
          description: 'Todos os dados foram removidos do sistema',
        });

        if (logError) {
          console.error('Error logging action:', logError);
        }
      } catch (logError) {
        console.error('Error creating audit log:', logError);
      }

      toast({
        title: 'Sucesso',
        description: 'Todos os dados foram removidos com sucesso. O sistema está pronto para dados reais.',
      });

      // Atualizar os dados da página
      await fetchConfig();
      await fetchAuditLogs();

    } catch (error) {
      console.error('Error clearing data:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao limpar dados. Verifique os logs para mais detalhes.',
        variant: 'destructive',
      });
    } finally {
      setIsClearingData(false);
    }
  };

  const handleExport = async (format: 'excel' | 'csv' | 'pdf') => {
    if (!user) return;

    try {
      console.log(`Iniciando exportação em formato ${format}`);
      
      if (format === 'csv') {
        await exportToCSV();
        toast({
          title: 'Sucesso',
          description: 'Dados exportados em CSV com sucesso',
        });
      } else if (format === 'excel') {
        await exportToExcel();
        toast({
          title: 'Sucesso',
          description: 'Dados exportados em Excel com sucesso',
        });
      } else if (format === 'pdf') {
        toast({
          title: 'Em desenvolvimento',
          description: 'Exportação em PDF será implementada em breve',
        });
      }

      try {
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'EXPORT',
          resource: 'data',
          description: `Exportação de dados em formato ${format.toUpperCase()}`,
        });
      } catch (logError) {
        console.error('Erro ao registrar log:', logError);
      }

      fetchAuditLogs();
    } catch (error) {
      console.error('Erro na exportação:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao exportar dados',
        variant: 'destructive',
      });
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Acesso restrito a administradores</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Painel Administrativo</h1>
          <p className="text-muted-foreground">Configurações e logs do sistema</p>
        </div>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="w-4 h-4" />
                Limpar Todos os Dados
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza que deseja limpar todos os dados?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação irá remover permanentemente:
                  <br />• Todos os clientes cadastrados
                  <br />• Todos os produtos
                  <br />• Todas as vendas e parcelas
                  <br />• Todos os pagamentos parciais
                  <br />• Logs de auditoria (exceto esta ação)
                  <br /><br />
                  As configurações financeiras serão redefinidas para os valores padrão.
                  <br /><br />
                  <strong>Esta ação não pode ser desfeita!</strong>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={clearAllData} 
                  disabled={isClearingData}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isClearingData ? 'Limpando...' : 'Sim, Limpar Tudo'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={fetchAuditLogs} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config">Configurações</TabsTrigger>
          <TabsTrigger value="logs">Logs de Auditoria</TabsTrigger>
          <TabsTrigger value="export">Exportar/Importar</TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações Financeiras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {config && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="retirada_markup">Markup Retirada (%)</Label>
                    <Input
                      id="retirada_markup"
                      type="number"
                      step="0.1"
                      value={config.retirada_markup * 100}
                      onChange={(e) => setConfig({
                        ...config,
                        retirada_markup: Number(e.target.value) / 100
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="crediario_markup">Markup Crediário (%)</Label>
                    <Input
                      id="crediario_markup"
                      type="number"
                      step="0.1"
                      value={config.crediario_markup * 100}
                      onChange={(e) => setConfig({
                        ...config,
                        crediario_markup: Number(e.target.value) / 100
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pct_vendedor">% Vendedor</Label>
                    <Input
                      id="pct_vendedor"
                      type="number"
                      step="0.1"
                      value={config.pct_vendedor * 100}
                      onChange={(e) => setConfig({
                        ...config,
                        pct_vendedor: Number(e.target.value) / 100
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pct_dono">% Dono</Label>
                    <Input
                      id="pct_dono"
                      type="number"
                      step="0.1"
                      value={config.pct_dono * 100}
                      onChange={(e) => setConfig({
                        ...config,
                        pct_dono: Number(e.target.value) / 100
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pct_gastos">% Gastos</Label>
                    <Input
                      id="pct_gastos"
                      type="number"
                      step="0.1"
                      value={config.pct_gastos * 100}
                      onChange={(e) => setConfig({
                        ...config,
                        pct_gastos: Number(e.target.value) / 100
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pct_dizimo">% Dízimo</Label>
                    <Input
                      id="pct_dizimo"
                      type="number"
                      step="0.1"
                      value={config.pct_dizimo * 100}
                      onChange={(e) => setConfig({
                        ...config,
                        pct_dizimo: Number(e.target.value) / 100
                      })}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button 
                  onClick={updateConfig} 
                  disabled={isLoading}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isLoading ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Logs de Auditoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Recurso</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => {
                    const status = log.action === 'ERROR' ? 'erro' : 
                                  log.action === 'UPDATE' ? 'info' : 'pendente';
                    const statusInfo = statusConfig[status];
                    
                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          {new Date(log.created_at).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>{log.user_id}</TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>{log.resource}</TableCell>
                        <TableCell>{log.description}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={statusInfo.variant}
                            className={statusInfo.className}
                          >
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export">
          <div className="space-y-6">
            {/* Seção de Exportação */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Exportar Dados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => handleExport('csv')}
                    disabled={isExporting}
                    className="w-full gap-2"
                    variant="outline"
                  >
                    <FileText className="w-4 h-4" />
                    {isExporting ? 'Exportando...' : 'Exportar CSV'}
                  </Button>

                  <Button 
                    onClick={() => handleExport('excel')}
                    disabled={isExporting}
                    className="w-full gap-2"
                    variant="outline"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    {isExporting ? 'Exportando...' : 'Exportar Excel'}
                  </Button>

                  <Button 
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting}
                    className="w-full gap-2"
                    variant="outline"
                  >
                    <FileText className="w-4 h-4" />
                    {isExporting ? 'Exportando...' : 'Exportar PDF'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Seção de Importação */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Importar Dados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Importe dados de vendas completas usando arquivos Excel (.xlsx) com múltiplas abas mensais.
                  </p>
                  
                  <ExcelImportDialog />

                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Instruções de Importação:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• O sistema lerá automaticamente todas as abas do Excel</li>
                      <li>• Identifica o mês pela aba (Março, Abril, Maio, etc.)</li>
                      <li>• Mapeia Cliente, Produto, Valores e Parcelas automaticamente</li>
                      <li>• Remove dados existentes antes de importar</li>
                      <li>• Registra vendas com referência mensal e controle de parcelas</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
