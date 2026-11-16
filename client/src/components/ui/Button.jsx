import React from 'react';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary:
    'bg-primary hover:bg-primary-hover active:bg-primary-active text-inverse font-semibold shadow-xs border border-transparent',
  secondary:
    'bg-surface-2 hover:bg-surface-3 text-main font-medium border border-border',
  outline:
    'bg-transparent hover:bg-surface-2 text-main font-medium border border-border-strong',
  ghost:
    'bg-transparent hover:bg-surface-2 text-main font-medium border border-transparent',
  destructive:
    'bg-surface hover:bg-surface-2 text-main font-semibold border-2 border-border-strong',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs rounded-control gap-1.5',
  md: 'px-4 py-2 text-sm rounded-control gap-2',
  lg: 'px-6 py-2.5 text-sm sm:text-base rounded-control gap-2.5',
  icon: 'p-2 rounded-control',
};

export const Button = React.forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const variantStyle = VARIANTS[variant] || VARIANTS.primary;
    const sizeStyle = SIZES[size] || SIZES.md;

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-40 disabled:pointer-events-none select-none ${variantStyle} ${sizeStyle} ${className}`}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
