import React from 'react';
import { cn } from './Button';
import { Button } from './Button';

export function EmptyState({ title, description, icon: Icon, action, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-app text-text-muted">
          <Icon size={32} />
        </div>
      )}
      <h3 className="mb-2 text-lg font-bold text-text-main">{title}</h3>
      {description && <p className="mb-6 max-w-sm text-sm text-text-muted">{description}</p>}
      {action && (
        <Button onClick={action.onClick} variant={action.variant || "primary"}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
