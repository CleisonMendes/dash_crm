
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Calendar, MessageSquare } from 'lucide-react';

interface PartialPayment {
  id: string;
  client_id: string;
  sale_id?: string;
  valor_pago: number;
  data_pagamento: string;
  observacoes?: string;
  created_by: string;
  created_at: string;
}

interface PartialPaymentHistoryProps {
  payments: PartialPayment[];
  clientName?: string;
}

export function PartialPaymentHistory({ payments, clientName }: PartialPaymentHistoryProps) {
  const totalPago = payments.reduce((sum, payment) => sum + payment.valor_pago, 0);

  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Histórico de Pagamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum pagamento parcial registrado ainda.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Histórico de Pagamentos
            {clientName && <span className="text-muted-foreground">- {clientName}</span>}
          </div>
          <Badge variant="outline" className="text-gold-primary border-gold-primary">
            Total: {new Intl.NumberFormat('pt-BR', { 
              style: 'currency', 
              currency: 'BRL' 
            }).format(totalPago)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Valor Pago</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(payment.data_pagamento).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-success" />
                      <span className="font-medium text-success">
                        {new Intl.NumberFormat('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        }).format(payment.valor_pago)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {payment.observacoes ? (
                      <div className="flex items-start gap-2 max-w-xs">
                        <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-sm truncate">{payment.observacoes}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-success border-success">
                      Recebido
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
