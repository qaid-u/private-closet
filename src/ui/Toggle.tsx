import React from 'react';

export interface ToggleProps {
  id?: string;
  label?: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
  className = '',
}) => {
  const toggleId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`flex items-start justify-between gap-4 py-1.5 ${className}`}>
      {(label || description) && (
        <div className="flex-1 cursor-pointer select-none" onClick={() => !disabled && onChange(!checked)}>
          {label && (
            <label htmlFor={toggleId} className="font-medium text-sm text-text-primary block cursor-pointer">
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-text-secondary mt-0.5">{description}</p>
          )}
        </div>
      )}

      <button
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-touch min-w-touch items-center ${
          checked ? 'bg-primary' : 'bg-border'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-soft ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
};
