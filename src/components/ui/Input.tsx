import { cn } from '@/utils/format';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-text">{label}</label>
      )}
      <input
        className={cn(
          'w-full rounded-2xl border border-border bg-surface px-4 py-3.5',
          'text-text placeholder:text-text-secondary/60',
          'focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20',
          'transition-all duration-200',
          error && 'border-danger focus:border-danger focus:ring-danger/20',
          className,
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className, ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-text">{label}</label>
      )}
      <textarea
        className={cn(
          'w-full rounded-2xl border border-border bg-surface px-4 py-3.5',
          'text-text placeholder:text-text-secondary/60 resize-none',
          'focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20',
          'transition-all duration-200 min-h-[120px]',
          className,
        )}
        {...props}
      />
    </div>
  );
}
