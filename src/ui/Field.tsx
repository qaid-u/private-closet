import React from 'react';

export interface FieldProps {
  label: string;
  htmlFor?: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Field: React.FC<FieldProps> = ({
  label,
  htmlFor,
  description,
  error,
  required = false,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      <label
        htmlFor={htmlFor}
        className="block text-xs font-semibold uppercase tracking-wider text-text-secondary"
      >
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </label>

      {children}

      {error ? (
        <p className="text-xs text-danger font-medium">{error}</p>
      ) : description ? (
        <p className="text-xs text-text-secondary">{description}</p>
      ) : null}
    </div>
  );
};
