import React from 'react';

export interface SkeletonProps {
  variant?: 'text' | 'circle' | 'card' | 'tile';
  width?: string;
  height?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
}) => {
  const baseStyles = 'bg-surface-alt animate-pulse rounded-control';

  const variantStyles = {
    text: 'h-4 w-3/4 rounded',
    circle: 'rounded-full w-12 h-12',
    card: 'rounded-card h-48 w-full',
    tile: 'rounded-control aspect-square w-full',
  };

  return (
    <div
      aria-busy="true"
      aria-label="Loading..."
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={{ width, height }}
    />
  );
};
