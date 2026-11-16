import React from 'react';

const BADGE_VARIANTS = {
  default: 'bg-surface-2 text-main border border-border',
  solid: 'bg-primary text-inverse border border-primary',
  outline: 'bg-transparent text-main border border-border-strong',
  subtle: 'bg-surface-2 text-muted border border-border',
};

export const Badge = ({
  children,
  variant = 'default',
  className = '',
  icon: Icon,
  ...props
}) => {
  const variantClass = BADGE_VARIANTS[variant] || BADGE_VARIANTS.default;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-pill text-xs font-semibold select-none ${variantClass} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-3 h-3 flex-shrink-0" />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
