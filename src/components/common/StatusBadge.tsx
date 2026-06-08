import React from 'react';
import { cn } from './Button';

interface StatusBadgeProps {
  status: 'available' | 'unavailable' | 'confirmed' | 'cancelled';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const statusStyles = {
    available: 'bg-green-100 text-green-800',
    unavailable: 'bg-red-100 text-red-800',
    confirmed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-slate-100 text-slate-800',
  };

  const statusLabels = {
    available: 'Available',
    unavailable: 'Unavailable',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
};
