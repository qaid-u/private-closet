import React from 'react';

export interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: { text: string; positive?: boolean };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  trend,
  className = '',
}) => {
  return (
    <div
      className={`bg-surface border border-border rounded-card p-5 space-y-3 shadow-soft transition-all ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          {label}
        </span>
        {icon && (
          <div className="w-8 h-8 rounded-control bg-surface-alt text-primary flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div>
        <span className="font-serif text-2xl sm:text-3xl font-bold text-text-primary block leading-none">
          {value}
        </span>
        {subtext && <p className="text-xs text-text-secondary mt-1">{subtext}</p>}
      </div>

      {trend && (
        <div className="pt-2 border-t border-border flex items-center gap-1.5 text-xs">
          <span
            className={`font-semibold ${
              trend.positive ? 'text-success' : 'text-text-secondary'
            }`}
          >
            {trend.text}
          </span>
        </div>
      )}
    </div>
  );
};
