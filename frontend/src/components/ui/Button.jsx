import React from 'react';
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', icon: Icon, children, ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    primary: "bg-brand-primary text-white hover:bg-brand-primaryLight shadow-sm",
    secondary: "bg-brand-secondary text-white hover:bg-brand-secondaryLight shadow-sm",
    destructive: "bg-semantic-error text-white hover:bg-semantic-error/90 shadow-sm",
    outline: "border border-border bg-transparent hover:bg-app text-text-main",
    ghost: "bg-transparent text-text-muted hover:bg-border/50 hover:text-text-main",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-xs",
    lg: "h-12 px-8 text-lg",
    icon: "h-10 w-10",
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {Icon && <Icon className={cn("mr-2 h-4 w-4", children ? "" : "mr-0")} />}
      {children}
    </button>
  );
});

Button.displayName = "Button";
