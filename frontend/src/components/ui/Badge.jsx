import React from 'react';
import { cn } from './Button';

export function Badge({ className, variant = "default", ...props }) {
  const baseStyles = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2";

  const variants = {
    default: "border-transparent bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20",
    secondary: "border-transparent bg-app text-text-muted hover:bg-border/50",
    success: "border-transparent bg-semantic-success/15 text-semantic-success hover:bg-semantic-success/25",
    warning: "border-transparent bg-semantic-warning/15 text-semantic-warning hover:bg-semantic-warning/25",
    error: "border-transparent bg-semantic-error/15 text-semantic-error hover:bg-semantic-error/25",
    info: "border-transparent bg-semantic-info/15 text-semantic-info hover:bg-semantic-info/25",
    outline: "text-text-main border-border",
  };

  return (
    <div className={cn(baseStyles, variants[variant], className)} {...props} />
  );
}
