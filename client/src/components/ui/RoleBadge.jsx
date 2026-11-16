import React from 'react';
import { ShieldAlert, Store, User } from 'lucide-react';

export const RoleBadge = ({ role = 'customer', className = '' }) => {
  const normRole = String(role).toLowerCase();

  if (normRole === 'admin') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-pill text-[11px] font-bold uppercase tracking-wider bg-primary text-inverse border border-primary shadow-xs select-none ${className}`}
      >
        <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
        <span>Admin</span>
      </span>
    );
  }

  if (normRole === 'vendor') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-pill text-[11px] font-bold uppercase tracking-wider bg-surface-2 text-main border-2 border-border-strong select-none ${className}`}
      >
        <Store className="w-3.5 h-3.5 flex-shrink-0" />
        <span>Vendor</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-pill text-[11px] font-medium uppercase tracking-wider bg-transparent text-muted border border-border select-none ${className}`}
    >
      <User className="w-3.5 h-3.5 flex-shrink-0" />
      <span>Customer</span>
    </span>
  );
};

export default RoleBadge;
