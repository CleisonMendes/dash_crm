
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { DollarSign } from 'lucide-react';

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

interface PartialPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  saleId?: string;
  onPaymentAdded: (payment: PartialPayment) => void;
}

export function PartialPaymentDialog({ 
  isOpen, 
  onClose, 
  clientId, 
  saleId, 
  onPaymentAdded 
}: PartialPaymentDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    valor_pago: '',
    observacoes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const valorPago = parseFloat(formData.valor_pago.replace(',', '.'));

    if (!valorPago || valorPago <= 0) {
      toast({
        title: 'Erro',
        description: 'Valor pago deve ser maior que zero.',
        variant: 'destructive',
      });
      return;
    }

    // Criar pagamento parcial (mock - em produção seria salvo no Supabase)
    const newPayment: PartialPayment = {
      id: Date.now().toString(),
      client_id: clientId,
      sale_id: saleId,
      valor_pago: valorPago,
      data_pagamento: new Date().toISOString(),
      observacoes: formData.observacoes || undefined,
      created_by: 'current-user-id', // Em produção seria o ID do usuário atual
      created_at: new Date().toISOString(),
    };

    onPaymentAdded(newPayment);

    toast({
      title: 'Pagamento registrado!',
      description: `Pagamento parcial de ${new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      }).format(valorPago)} foi registrado com sucesso.`,
    });

    // Reset form
    setFormData({
      valor_pago: '',
      observacoes: '',
    });

    onClose();
  };

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const amount = parseFloat(numbers) / 100;
    return amount.toFixed(2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-gold-primary" />
            Registrar Pagamento Parcial
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="valor_pago">Valor Pago *</Label>
            <Input
              id="valor_pago"
              type="text"
              value={formData.valor_pago}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                valor_pago: formatCurrency(e.target.value)
              }))}
              placeholder="0,00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                observacoes: e.target.value 
              }))}
              placeholder="Informações adicionais sobre o pagamento..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-gold-primary hover:bg-gold-secondary text-burgundy-primary"
            >
              Registrar Pagamento
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
