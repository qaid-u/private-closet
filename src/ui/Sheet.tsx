import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current = document.activeElement as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && sheetRef.current) {
        const focusables = sheetRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previousActiveElement.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-title"
      aria-describedby={description ? 'sheet-description' : undefined}
      className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-end bg-black/50 backdrop-blur-sm transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={sheetRef}
        className="w-full sm:max-w-md bg-bg-elevated border-t sm:border-l border-border-subtle rounded-t-3xl sm:rounded-l-3xl sm:rounded-tr-none shadow-elevated max-h-[90vh] sm:h-full flex flex-col overflow-hidden"
      >
        {/* Mobile handle indicator */}
        <div className="w-12 h-1.5 bg-border-strong rounded-full mx-auto my-3 sm:hidden" />

        <div className="flex items-start justify-between px-6 py-4 border-b border-border-subtle">
          <div>
            <h2 id="sheet-title" className="font-serif text-xl font-bold text-text-primary">
              {title}
            </h2>
            {description && (
              <p id="sheet-description" className="mt-0.5 text-xs text-text-secondary">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="p-2 -mr-2 text-text-secondary hover:text-text-primary rounded-xl hover:bg-bg-tertiary transition-colors min-h-touch min-w-touch flex items-center justify-center focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
