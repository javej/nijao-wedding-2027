'use client';

import { type RefObject } from 'react';
import { cn } from '@/lib/utils';

interface ChatInputBarProps {
  inputRef: RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  inputType: 'text' | 'email' | 'tel';
  inputMode?: 'tel';
  autoComplete?: 'email' | 'tel';
  placeholder: string;
  ariaLabel: string;
  /** Show the "Skip" affordance (contact-collection steps only). */
  showSkip: boolean;
  onSkip: () => void;
}

/** Free-text reply row: optional Skip + text field + Send. */
export function ChatInputBar({
  inputRef,
  value,
  onChange,
  onKeyDown,
  onSubmit,
  inputType,
  inputMode,
  autoComplete,
  placeholder,
  ariaLabel,
  showSkip,
  onSkip,
}: ChatInputBarProps) {
  return (
    <div className="flex gap-2">
      {showSkip && (
        <button
          type="button"
          onClick={onSkip}
          className={cn(
            'min-h-11 shrink-0 rounded-full border border-foreground/20 px-4 py-2',
            'font-body text-body-sm text-foreground/60',
            'transition-colors hover:bg-foreground/5',
            'focus-visible:ring-4 focus-visible:ring-golden-matcha/30 focus-visible:outline-1 focus-visible:outline-golden-matcha',
          )}
        >
          Skip
        </button>
      )}
      <input
        ref={inputRef}
        type={inputType}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={cn(
          'min-w-0 flex-1 min-h-11 rounded-full border border-foreground/20 bg-background px-4 py-2',
          'font-body text-body-md text-foreground placeholder:text-foreground/40',
          'focus-visible:ring-4 focus-visible:ring-golden-matcha/30 focus-visible:outline-1 focus-visible:outline-golden-matcha',
        )}
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={!value.trim()}
        aria-label="Send"
        className={cn(
          'min-h-11 min-w-11 shrink-0 rounded-full bg-golden-matcha text-text-on-dark',
          'flex items-center justify-center',
          'transition-colors hover:bg-golden-matcha/90',
          'focus-visible:ring-4 focus-visible:ring-golden-matcha/30 focus-visible:outline-1 focus-visible:outline-golden-matcha',
          'disabled:opacity-40 disabled:pointer-events-none',
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="size-5"
          aria-hidden="true"
        >
          <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95l15.5-6.25a.75.75 0 0 0 0-1.394l-15.5-6.25Z" />
        </svg>
      </button>
    </div>
  );
}
