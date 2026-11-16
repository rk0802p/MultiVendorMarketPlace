import React from 'react';
import { Link } from 'react-router-dom';

export const StatCard = ({
  icon: Icon,
  label,
  value,
  subtitle,
  to,
  className = '',
}) => {
  const content = (
    <div
      className={`bg-surface p-5 rounded-card border border-border shadow-xs flex items-center space-x-4 transition hover:border-border-strong ${className}`}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-control bg-surface-2 text-main flex items-center justify-center border border-border flex-shrink-0">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted block truncate">
          {label}
        </span>
        <p className="text-xl font-bold text-main mt-0.5 truncate">{value}</p>
        {subtitle && <p className="text-xs text-muted mt-0.5 truncate">{subtitle}</p>}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block group">
        {content}
      </Link>
    );
  }

  return content;
};

export default StatCard;
