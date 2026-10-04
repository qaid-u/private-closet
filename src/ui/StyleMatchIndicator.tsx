import React from 'react';
import { Sparkles, Check, HelpCircle } from 'lucide-react';

export type MatchLevel = 'High' | 'Medium' | 'Low';

export interface StyleMatchIndicatorProps {
  level: MatchLevel;
  onClick?: () => void;
  className?: string;
}

export const StyleMatchIndicator: React.FC<StyleMatchIndicatorProps> = ({
  level,
  onClick,
  className = '',
}) => {
  const levelConfig = {
    High: {
      label: 'High Match',
      styles: 'bg-success/15 text-success border-success/30 hover:bg-success/20',
      icon: <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />,
    },
    Medium: {
      label: 'Medium Match',
      styles: 'bg-warning/15 text-warning border-warning/30 hover:bg-warning/20',
      icon: <Check className="w-3.5 h-3.5" aria-hidden="true" />,
    },
    Low: {
      label: 'Low Match',
      styles: 'bg-surface-alt text-text-secondary border-border hover:bg-border',
      icon: <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />,
    },
  };

  const config = levelConfig[level];

  const content = (
    <>
      <span className="shrink-0">{config.icon}</span>
      <span className="font-semibold text-xs">{config.label}</span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`Style match: ${config.label}. Click to view match details.`}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer min-h-touch select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98] ${config.styles} ${className}`}
      >
        {content}
      </button>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border select-none ${config.styles} ${className}`}
    >
      {content}
    </span>
  );
};
