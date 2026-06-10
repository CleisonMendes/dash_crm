
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, AlertCircle, CheckCircle2, X, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ExcelData {
  [sheetName: string]: any[][];
}

interface SheetPreview {
  name: string;
  month: string;
  rowCount: number;
  headers: string[];
  sample: any[];
}

interface ImportResult {
  success: boolean;
  processed: number;
  clients: number;
  products: number;
  sales: number;
  installments: number;
  errors: string[];
  warnings: string[];
}

interface ProcessedRow {
  cliente: string;
  produto: string;
  valor: number;
  valorPago: number;
  aReceber: number;
  local: string;
  contato: string;
  data: string;
  month: string;
}

const MONTH_NAMES = {
  'janeiro': '01', 'jan': '01',
  'fevereiro': '02', 'fev': '02',
  'março': '03', 'mar': '03',
  'abril': '04', 'abr': '04',
  'maio': '05', 'mai': '05',
  'junho': '06', 'jun': '06',
  'julho': '07', 'jul': '07',
  'agosto': '08', 'ago': '08',
  'setembro': '09', 'set': '09',
  'outubro': '10', 'out': '10',
  'novembro': '11', 'nov': '11',
  'dezembro': '12', 'dez': '12'
};

export default function ExcelImportDialog() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [sheetPreviews, setSheetPreviews] = useState<SheetPreview[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const extractMonthFromSheetName = (sheetName: string): string => {
    const cleanName = sheetName.toLowerCase().trim();
    for (const [monthName, monthNumber] of Object.entries(MONTH_NAMES)) {
      if (cleanName.includes(monthName)) {
        return `2024-${monthNumber}`;
      }
    }
    return `2024-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  };

  const identifyHeaders = (row: any[]): { [key: string]: number } => {
    const headerMap: { [key: string]: number } = {};
    
    row.forEach((cell, index) => {
      const cellStr = String(cell || '').toLowerCase().trim();
      
      // Mapeamento mais específico das colunas
      if (cellStr.includes('cliente') || cellStr.includes('nome do cliente') || cellStr.includes('comprador')) {
        headerMap['cliente'] = index;
      } else if (cellStr.includes('produto') || cellStr.includes('item') || cellStr.includes('mercadoria')) {
        headerMap['produto'] = index;
      } else if ((cellStr.includes('valor') && cellStr.includes('pago')) || cellStr.includes('pagamento') || cellStr.includes('pago')) {
        headerMap['valorPago'] = index;
      } else if (cellStr.includes('valor') && !cellStr.includes('pago') && !cellStr.includes('receber')) {
        headerMap['valor'] = index;
      } else if (cellStr.includes('receber') || cellStr.includes('saldo') || cellStr.includes('resto') || cellStr.includes('pendente')) {
        headerMap['aReceber'] = index;
      } else if (cellStr.includes('local') || cellStr.includes('endereço') || cellStr.includes('endereco') || cellStr.includes('localização')) {
        headerMap['local'] = index;
      } else if (cellStr.includes('contato') || cellStr.includes('telefone') || cellStr.includes('tel') || cellStr.includes('fone') || cellStr.includes('whatsapp')) {
        headerMap['contato'] = index;
      } else if (cellStr.includes('data') || cellStr.includes('quando') || cellStr.includes('dia')) {
        headerMap['data'] = index;
      }
    });
    
    return headerMap;
  };

  const parseDate = (dateValue: any): string => {
    if (!dateValue) return new Date().toISOString().split('T')[0];
    
    // Se for um número (data do Excel)
    if (typeof dateValue === 'number') {
      const excelDate = new Date((dateValue - 25569) * 86400 * 1000);
      return excelDate.toISOString().split('T')[0];
    }
    
    // Se for string, tentar converter
    const dateStr = String(dateValue).trim();
    if (dateStr) {
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString().split('T')[0];
      }
    }
    
    return new Date().toISOString().split('T')[0];
  };

  const parseNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    const str = String(value || '0').replace(/[^\d.,]/g, '').replace(',', '.');
    return parseFloat(str) || 0;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    if (!uploadedFile.name.endsWith('.xlsx')) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione um arquivo Excel (.xlsx)',
        variant: 'destructive',
      });
      return;
    }

    setFile(uploadedFile);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const sheets: ExcelData = {};
        const previews: SheetPreview[] = [];
        
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          sheets[sheetName] = jsonData;
          
          if (jsonData.length > 0) {
            const month = extractMonthFromSheetName(sheetName);
            const headers = jsonData[0] as string[];
            const sample = jsonData.slice(1, 4);
            
            previews.push({
              name: sheetName,
              month: month,
              rowCount: jsonData.length - 1,
              headers: headers || [],
              sample: sample || []
            });
          }
        });
        
        setExcelData(sheets);
        setSheetPreviews(previews);
        setStep('preview');
      } catch (error) {
        console.error('Erro ao ler Excel:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao ler o arquivo Excel',
          variant: 'destructive',
        });
      }
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  const processSheet = (sheetData: any[][], month: string): ProcessedRow[] => {
    if (sheetData.length < 2) return [];
    
    const headers = sheetData[0];
    const headerMap = identifyHeaders(headers);
    const rows = sheetData.slice(1);
    
    console.log('Header mapping encontrado:', headerMap);
    
    return rows.map((row, index) => {
      const processedRow = {
        cliente: String(row[headerMap.cliente] || '').trim(),
        produto: String(row[headerMap.produto] || '').trim(),
        valor: parseNumber(row[headerMap.valor]),
        valorPago: parseNumber(row[headerMap.valorPago]),
        aReceber: parseNumber(row[headerMap.aReceber]),
        local: String(row[headerMap.local] || '').trim(),
        contato: String(row[headerMap.contato] || '').trim(),
        data: parseDate(row[headerMap.data]),
        month: month
      };
      
      // Se não temos valor pago explícito, mas temos valor total e a receber
      if (processedRow.valorPago === 0 && processedRow.valor > 0 && processedRow.aReceber >= 0) {
        processedRow.valorPago = processedRow.valor - processedRow.aReceber;
      }
      
      // Se não temos a receber explícito, calcular
      if (processedRow.aReceber === 0 && processedRow.valor > processedRow.valorPago) {
        processedRow.aReceber = processedRow.valor - processedRow.valorPago;
      }
      
      console.log(`Linha ${index + 1} processada:`, processedRow);
      
      return processedRow;
    }).filter(row => row.cliente && row.produto && row.valor > 0);
  };

  const handleImport = async () => {
    if (!excelData || !user) return;

    setIsImporting(true);
    try {
      const result: ImportResult = {
        success: true,
        processed: 0,
        clients: 0,
        products: 0,
        sales: 0,
        installments: 0,
        errors: [],
        warnings: []
      };

      console.log('Iniciando importação...');

      // Primeiro, limpar todos os dados existentes
      console.log('Limpando dados existentes...');
      const { error: clearError } = await supabase.rpc('clear_all_data');
      if (clearError) {
        console.error('Erro ao limpar dados:', clearError);
        result.warnings.push('Aviso: Não foi possível limpar dados existentes automaticamente');
        
        // Fazer limpeza manual
        await supabase.from('installments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('sales').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      }

      // Processar todas as abas
      for (const preview of sheetPreviews) {
        console.log(`Processando aba: ${preview.name}`);
        const sheetData = excelData[preview.name];
        const processedRows = processSheet(sheetData, preview.month);
        
        console.log(`${processedRows.length} linhas válidas encontradas na aba ${preview.name}`);
        
        for (const row of processedRows) {
          try {
            result.processed++;
            
            // 1. Criar/atualizar cliente
            let clientId: string;
            const { data: existingClient } = await supabase
              .from('clients')
              .select('id')
              .eq('telefone', row.contato)
              .maybeSingle();

            if (existingClient) {
              clientId = existingClient.id;
              // Atualizar dados do cliente
              await supabase
                .from('clients')
                .update({
                  nome: row.cliente,
                  endereco: row.local || null
                })
                .eq('id', clientId);
            } else {
              const { data: newClient, error: clientError } = await supabase
                .from('clients')
                .insert({
                  nome: row.cliente,
                  telefone: row.contato,
                  endereco: row.local || null,
                  possui_whatsapp: true
                })
                .select('id')
                .single();

              if (clientError) {
                console.error('Erro ao criar cliente:', clientError);
                throw clientError;
              }
              clientId = newClient.id;
              result.clients++;
            }

            // 2. Criar/atualizar produto
            let productId: string;
            const { data: existingProduct } = await supabase
              .from('products')
              .select('id')
              .eq('nome', row.produto)
              .maybeSingle();

            if (existingProduct) {
              productId = existingProduct.id;
            } else {
              // Calcular preços baseados no valor da venda
              const precoCusto = row.valor * 0.6; // 60% do valor de venda
              
              const { data: newProduct, error: productError } = await supabase
                .from('products')
                .insert({
                  nome: row.produto,
                  preco_custo: precoCusto,
                  preco_venda_retirada: row.valor,
                  preco_venda_crediario: row.valor,
                  estoque: 100 // Valor padrão
                })
                .select('id')
                .single();

              if (productError) {
                console.error('Erro ao criar produto:', productError);
                throw productError;
              }
              productId = newProduct.id;
              result.products++;
            }

            // 3. Criar venda
            const precoCusto = row.valor * 0.6;
            const lucroTotal = row.valor - precoCusto;
            const tipoVenda = row.aReceber > 0 ? 'crediario' : 'retirada';
            const status = row.aReceber > 0 ? 'parcial' : 'pago';
            
            const { data: newSale, error: saleError } = await supabase
              .from('sales')
              .insert({
                product_id: productId,
                client_id: clientId,
                vendedor_id: user.id,
                tipo_venda: tipoVenda,
                preco_venda: row.valor,
                preco_custo: precoCusto,
                quantidade: 1,
                lucro_total: lucroTotal,
                lucro_vendedor: lucroTotal * 0.1,
                lucro_dono: lucroTotal * 0.1,
                reserva_gastos: lucroTotal * 0.3,
                reserva_dizimo: lucroTotal * 0.1,
                saldo_livre: lucroTotal * 0.4,
                referencia_mensal: row.month,
                status: status,
                created_at: row.data + 'T12:00:00Z' // Usar a data da planilha
              })
              .select('id')
              .single();

            if (saleError) {
              console.error('Erro ao criar venda:', saleError);
              throw saleError;
            }
            result.sales++;
            
            console.log(`Venda criada: ${row.cliente} - ${row.produto} - R$ ${row.valor}`);

            // 4. Criar parcelas se necessário
            if (row.aReceber > 0 || row.valorPago > 0) {
              // Parcela paga
              if (row.valorPago > 0) {
                const { error: installmentError } = await supabase
                  .from('installments')
                  .insert({
                    sale_id: newSale.id,
                    valor: row.valorPago,
                    due_date: row.data,
                    paid_amount: row.valorPago,
                    paid_at: row.data + 'T12:00:00Z',
                    status: 'pago',
                    numero_parcela: 1,
                    total_parcelas: row.aReceber > 0 ? 2 : 1
                  });
                
                if (installmentError) {
                  console.error('Erro ao criar parcela paga:', installmentError);
                } else {
                  result.installments++;
                }
              }

              // Parcela pendente
              if (row.aReceber > 0) {
                const dueDate = new Date(row.data);
                dueDate.setMonth(dueDate.getMonth() + 1); // Vencimento no próximo mês
                
                const { error: installmentError } = await supabase
                  .from('installments')
                  .insert({
                    sale_id: newSale.id,
                    valor: row.aReceber,
                    due_date: dueDate.toISOString().split('T')[0],
                    paid_amount: 0,
                    status: 'pendente',
                    numero_parcela: row.valorPago > 0 ? 2 : 1,
                    total_parcelas: row.valorPago > 0 ? 2 : 1
                  });
                
                if (installmentError) {
                  console.error('Erro ao criar parcela pendente:', installmentError);
                } else {
                  result.installments++;
                }
              }
            }

          } catch (error) {
            console.error('Erro ao processar linha:', error);
            result.errors.push(`Linha ${result.processed} (${row.cliente} - ${row.produto}): ${error}`);
            result.success = false;
          }
        }
      }

      // Log da importação
      try {
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'IMPORT_EXCEL',
          resource: 'excel_data',
          description: `Importação de ${result.processed} registros de ${sheetPreviews.length} abas. Clientes: ${result.clients}, Produtos: ${result.products}, Vendas: ${result.sales}, Parcelas: ${result.installments}`
        });
      } catch (logError) {
        console.error('Erro ao registrar log:', logError);
      }

      setImportResult(result);
      setStep('result');

      if (result.errors.length === 0) {
        toast({
          title: 'Sucesso!',
          description: `${result.processed} registros importados com sucesso. O dashboard será atualizado automaticamente.`,
        });
      } else {
        toast({
          title: 'Importação concluída com avisos',
          description: `${result.processed - result.errors.length} registros importados, ${result.errors.length} com erros`,
          variant: 'destructive',
        });
      }
      
      // Recarregar a página para atualizar o dashboard
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Erro durante a importação:', error);
      toast({
        title: 'Erro',
        description: 'Erro durante a importação. Verifique o console para mais detalhes.',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const resetDialog = () => {
    setFile(null);
    setExcelData(null);
    setSheetPreviews([]);
    setStep('upload');
    setImportResult(null);
    setIsOpen(false);
  };

  const downloadTemplate = () => {
    const templateData = [
      ['Cliente', 'Produto', 'Valor', 'Valor Pago', 'A Receber', 'Local', 'Contato', 'Data'],
      ['João Silva', 'Produto A', '150.00', '50.00', '100.00', 'Rua A, 123', '(11) 99999-9999', '2024-03-15'],
      ['Maria Santos', 'Produto B', '200.00', '200.00', '0.00', 'Rua B, 456', '(11) 88888-8888', '2024-03-16']
    ];

    const wb = XLSX.utils.book_new();
    
    // Criar abas para diferentes meses
    const months = ['Março', 'Abril', 'Maio'];
    months.forEach(month => {
      const ws = XLSX.utils.aoa_to_sheet(templateData);
      XLSX.utils.book_append_sheet(wb, ws, month);
    });

    XLSX.writeFile(wb, 'template_controle_vendas.xlsx');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="w-4 h-4" />
          Importar Excel Completo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Importar Controle de Vendas - Excel Completo
          </DialogTitle>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Button onClick={downloadTemplate} variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Baixar Template
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Baixe o template para ver o formato correto com múltiplas abas mensais
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Mapeamento de Colunas:</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Cliente:</strong> nome do cliente, comprador</p>
                <p><strong>Produto:</strong> produto, item, mercadoria</p>
                <p><strong>Valor:</strong> valor total da venda</p>
                <p><strong>Valor Pago:</strong> valor pago, pagamento</p>
                <p><strong>A Receber:</strong> valor a receber, saldo, pendente</p>
                <p><strong>Local:</strong> endereço, localização</p>
                <p><strong>Contato:</strong> telefone, whatsapp</p>
                <p><strong>Data:</strong> data da venda</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excel-file">Selecionar Arquivo Excel (.xlsx)</Label>
              <Input
                id="excel-file"
                type="file"
                accept=".xlsx"
                onChange={handleFileUpload}
              />
            </div>

            {file && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Arquivo Selecionado</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{file.name}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preview das Abas Encontradas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sheetPreviews.map((preview, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center gap-4 mb-2">
                        <Badge variant="outline">{preview.name}</Badge>
                        <Badge variant="secondary">Mês: {preview.month}</Badge>
                        <Badge variant="outline">{preview.rowCount} registros</Badge>
                      </div>
                      
                      <div className="text-sm mb-2">
                        <strong>Colunas identificadas:</strong> {preview.headers.join(', ')}
                      </div>
                      
                      {preview.sample.length > 0 && (
                        <div className="mt-2">
                          <strong className="text-sm">Amostra dos dados:</strong>
                          <div className="mt-1 max-h-32 overflow-y-auto text-xs bg-gray-50 p-2 rounded">
                            {preview.sample.map((row, rowIndex) => (
                              <div key={rowIndex} className="text-muted-foreground border-b pb-1 mb-1">
                                {Array.isArray(row) ? row.join(' | ') : String(row)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <strong className="text-orange-800">Atenção!</strong>
              </div>
              <p className="text-sm text-orange-700">
                Esta importação irá <strong>remover todos os dados existentes</strong> no sistema antes de importar os novos dados das abas selecionadas.
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button onClick={() => setStep('upload')} variant="outline">
                Voltar
              </Button>
              <Button
                onClick={handleImport}
                disabled={isImporting || sheetPreviews.length === 0}
                className="gap-2"
              >
                {isImporting ? 'Importando...' : `Importar ${sheetPreviews.reduce((acc, p) => acc + p.rowCount, 0)} Registros`}
              </Button>
            </div>
          </div>
        )}

        {step === 'result' && importResult && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              {importResult.success ? (
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
              ) : (
                <AlertCircle className="w-16 h-16 text-orange-500 mx-auto" />
              )}
              
              <div>
                <h3 className="text-lg font-semibold">
                  {importResult.success ? 'Importação Concluída com Sucesso!' : 'Importação Concluída com Erros'}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  O dashboard será atualizado automaticamente em alguns segundos.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{importResult.processed}</div>
                    <div className="text-sm text-muted-foreground">Processados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{importResult.clients}</div>
                    <div className="text-sm text-muted-foreground">Clientes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{importResult.products}</div>
                    <div className="text-sm text-muted-foreground">Produtos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{importResult.sales}</div>
                    <div className="text-sm text-muted-foreground">Vendas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{importResult.installments}</div>
                    <div className="text-sm text-muted-foreground">Parcelas</div>
                  </div>
                </div>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-red-600">Erros Encontrados ({importResult.errors.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {importResult.errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-600">{error}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {importResult.warnings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-orange-600">Avisos ({importResult.warnings.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {importResult.warnings.map((warning, index) => (
                      <p key={index} className="text-sm text-orange-600">{warning}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Button onClick={resetDialog} className="w-full">
              Concluir
            </Button>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetDialog}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
