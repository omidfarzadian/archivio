import { cn } from '@/utils/format';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: ReactNode;
}

const variants = {
  primary: 'gradient-accent text-white shadow-elevated hover:opacity-90 active:scale-[0.98]',
  secondary: 'bg-surface text-text border border-border hover:bg-background active:scale-[0.98]',
  ghost: 'bg-transparent text-text-secondary hover:bg-background active:scale-[0.98]',
  danger: 'bg-transparent text-danger hover:bg-red-50 active:scale-[0.98]',
};

const sizes = {
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-6 py-3 text-base rounded-2xl',
  lg: 'px-8 py-4 text-base rounded-2xl font-medium',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200',
        'disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
