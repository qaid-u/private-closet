import React from 'react';
import { ShieldCheck } from 'lucide-react';

export interface OnDeviceBadgeProps {
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const OnDeviceBadge: React.FC<OnDeviceBadgeProps> = ({
  label = 'On device',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full bg-primary-soft text-primary select-none ${sizeStyles[size]} ${className}`}
    >
      <ShieldCheck className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};
