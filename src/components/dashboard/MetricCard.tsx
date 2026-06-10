
import { LucideIcon } from 'lucide-react';
import { formatCurrency } from '@/utils/financial';

interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  format?: 'currency' | 'number';
}

export function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  subtitle,
  format = 'currency'
}: MetricCardProps) {
  const formattedValue = format === 'currency' ? formatCurrency(value) : value.toString();

  return (
    <div className="financial-card group hover:shadow-xl transition-all duration-300">
      <div className="financial-card-header">
        <div>
          <p className="financial-label">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className="w-12 h-12 bg-gold-primary/10 rounded-lg flex items-center justify-center group-hover:bg-gold-primary/20 transition-colors">
          <Icon className="w-6 h-6 text-gold-primary" />
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="financial-value group-hover:scale-105 transition-transform">
          {formattedValue}
        </p>
        
        {trend && (
          <div className="flex items-center gap-1">
            <span className={`text-sm font-medium ${
              trend.isPositive ? 'text-success' : 'text-destructive'
            }`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs text-muted-foreground">vs mês anterior</span>
          </div>
        )}
      </div>
    </div>
  );
}
