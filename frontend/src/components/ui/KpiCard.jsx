import React, { useState } from 'react';
import { cn } from './Button';
import { Card } from './Card';
import { Eye, EyeOff } from 'lucide-react';

export function KpiCard({
  title,
  amount,
  trend, // e.g., { value: 5, label: "vs ayer", isPositive: true }
  icon: Icon,
  className,
  isCurrency = true,
  allowHide = true
}) {
  const [isHidden, setIsHidden] = useState(false);

  const formattedAmount = isCurrency
    ? `$${Number(amount || 0).toLocaleString()}`
    : amount;

  return (
    <Card className={cn("relative overflow-hidden p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-widest text-text-muted">{title}</span>
        <div className="flex items-center gap-2">
            {Icon && <Icon size={18} className="text-text-muted" />}
            {allowHide && (
            <button
                onClick={() => setIsHidden(!isHidden)}
                className="text-text-muted hover:text-text-main transition-colors p-1"
                title={isHidden ? "Mostrar valor" : "Ocultar valor"}
            >
                {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            )}
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-black tracking-tight text-text-main">
          {isHidden ? '••••••' : formattedAmount}
        </div>
      </div>

      {trend && (
        <div className={cn(
          "mt-2 flex items-center gap-1 text-xs font-bold",
          trend.isPositive ? "text-semantic-success" : "text-semantic-error"
        )}>
          <span>{trend.isPositive ? '⬆️' : '⬇️'} {Math.abs(trend.value)}%</span>
          <span className="font-normal text-text-muted">{trend.label}</span>
        </div>
      )}
    </Card>
  );
}
