import React from 'react';

export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-control bg-surface-2 ${className}`}
      {...props}
    />
  );
};

export default Skeleton;
