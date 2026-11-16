import React from 'react';
import { Package } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Package,
  title = 'No items found',
  description = 'There are no items to display at this time.',
  action,
  className = '',
}) => {
  return (
    <div
      className={`bg-surface rounded-card border border-border p-12 text-center space-y-4 shadow-xs max-w-lg mx-auto ${className}`}
    >
      <div className="w-14 h-14 rounded-card bg-surface-2 text-muted flex items-center justify-center mx-auto border border-border">
        <Icon className="w-7 h-7" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-main">{title}</h3>
        <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};

export default EmptyState;
