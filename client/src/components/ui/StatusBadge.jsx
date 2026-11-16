import React from 'react';
import {
  CheckCircle2,
  Clock,
  Truck,
  Package,
  AlertCircle,
  XCircle,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export const StatusBadge = ({ status = '', label, className = '' }) => {
  const normStatus = String(status).toLowerCase().trim();

  let Icon = CheckCircle2;
  let visualClass = 'bg-surface-2 text-main border border-border-strong font-semibold';
  let displayLabel = label || status.replace(/_/g, ' ');

  // Categorize status monochromatically by icon + lightness + border style
  if (
    ['completed', 'paid', 'approved', 'active', 'delivered', 'in_stock', 'success'].includes(
      normStatus
    )
  ) {
    Icon = CheckCircle2;
    visualClass =
      'bg-surface-2 text-main border border-border-strong font-semibold shadow-xs';
    if (!label) {
      if (normStatus === 'in_stock') displayLabel = 'In Stock';
      else if (normStatus === 'paid') displayLabel = 'Paid';
    }
  } else if (normStatus === 'shipped') {
    Icon = Truck;
    visualClass = 'bg-transparent text-main border border-dashed border-border-strong';
  } else if (normStatus === 'packed') {
    Icon = Package;
    visualClass = 'bg-transparent text-main border border-dashed border-border-strong';
  } else if (
    ['pending', 'placed', 'in_progress', 'draft', 'processing'].includes(normStatus)
  ) {
    Icon = Clock;
    visualClass = 'bg-transparent text-main border border-dashed border-border-strong';
    if (!label) {
      if (normStatus === 'in_progress') displayLabel = 'In Progress';
    }
  } else if (['low_stock', 'warning'].includes(normStatus)) {
    Icon = AlertTriangle;
    visualClass = 'bg-surface-2 text-main border-2 border-border-strong font-semibold';
    if (!label && normStatus === 'low_stock') displayLabel = 'Low Stock';
  } else if (
    ['cancelled', 'rejected', 'failed', 'out_of_stock', 'inactive', 'archived', 'error'].includes(
      normStatus
    )
  ) {
    Icon = XCircle;
    visualClass =
      'bg-surface text-muted border border-border-strong font-medium';
    if (!label) {
      if (normStatus === 'out_of_stock') displayLabel = 'Out of Stock';
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-pill text-[11px] uppercase tracking-wider select-none ${visualClass} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{displayLabel}</span>
    </span>
  );
};

export default StatusBadge;
