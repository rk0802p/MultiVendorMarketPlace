import React from 'react';

export const Input = React.forwardRef(
  (
    {
      label,
      error,
      helperText,
      startIcon: StartIcon,
      endIcon: EndIcon,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-muted"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {StartIcon && (
            <div className="absolute left-3 text-muted pointer-events-none flex items-center">
              <StartIcon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full bg-surface text-main border rounded-control text-sm transition placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring disabled:opacity-40 disabled:cursor-not-allowed ${
              StartIcon ? 'pl-9' : 'px-3.5'
            } ${EndIcon ? 'pr-9' : 'px-3.5'} py-2.5 ${
              error ? 'border-border-strong ring-1 ring-border-strong' : 'border-border'
            } ${className}`}
            {...props}
          />
          {EndIcon && (
            <div className="absolute right-3 text-muted flex items-center">
              <EndIcon className="w-4 h-4" />
            </div>
          )}
        </div>
        {error && <p className="text-xs text-main font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-muted">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
