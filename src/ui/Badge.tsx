import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'accent' | 'sage' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center font-medium rounded-full transition-colors select-none';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5',
  };

  const variantStyles = {
    neutral: 'bg-bg-tertiary text-text-secondary border border-border-subtle',
    accent: 'bg-terracotta/10 text-terracotta border border-terracotta/20 dark:bg-terracotta/20',
    sage: 'bg-sage/15 text-sage border border-sage/25 dark:text-emerald-400 dark:bg-sage/25',
    warning: 'bg-amber-500/10 text-amber-700 border border-amber-500/25 dark:text-amber-300',
    danger: 'bg-red-500/10 text-red-600 border border-red-500/25 dark:text-red-400',
  };

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0" aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
