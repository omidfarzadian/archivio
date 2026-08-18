import type { ReactNode } from "react";
import { BottomNav } from "@/components/ui/BottomNav";

interface AppLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function AppLayout({ children, hideNav }: AppLayoutProps) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  leftAction,
  rightAction,
}: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border safe-top">
      <div className="flex min-h-14 items-center justify-between px-4 py-2.5 max-w-lg mx-auto">
        <div className="flex min-w-10 shrink-0 justify-start">{leftAction}</div>
        <div className="min-w-0 flex-1 text-center">
          <h1 className="truncate text-sm font-bold leading-tight text-text">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="flex min-w-10 shrink-0 items-center justify-end">
          {rightAction}
        </div>
      </div>
    </header>
  );
}
