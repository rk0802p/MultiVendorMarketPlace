import React from 'react';

export const Table = React.forwardRef(({ className = '', ...props }, ref) => (
  <div className="w-full overflow-x-auto">
    <table
      ref={ref}
      className={`min-w-full divide-y divide-border text-left text-sm ${className}`}
      {...props}
    />
  </div>
));
Table.displayName = 'Table';

export const TableHeader = React.forwardRef(({ className = '', ...props }, ref) => (
  <thead
    ref={ref}
    className={`bg-surface-2 text-muted text-xs uppercase font-semibold tracking-wider ${className}`}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef(({ className = '', ...props }, ref) => (
  <tbody
    ref={ref}
    className={`divide-y divide-border bg-surface text-main ${className}`}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

export const TableRow = React.forwardRef(({ className = '', ...props }, ref) => (
  <tr
    ref={ref}
    className={`hover:bg-surface-2/60 transition ${className}`}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

export const TableHead = React.forwardRef(({ className = '', ...props }, ref) => (
  <th
    ref={ref}
    className={`px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted ${className}`}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

export const TableCell = React.forwardRef(({ className = '', ...props }, ref) => (
  <td
    ref={ref}
    className={`px-6 py-4 whitespace-nowrap text-sm text-main ${className}`}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

export default Table;
