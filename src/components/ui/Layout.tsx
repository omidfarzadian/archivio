import type { ReactNode } from "react";
import { BottomNav } from "@/components/ui/BottomNav";

interface AppLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function AppLayout({ children, hideNav }: AppLayoutProps) {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <main className={hideNav ? "flex-1" : "flex-1 pb-20"}>{children}</main>
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
      <div className="h-16 flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <div className="w-10 flex justify-start">{leftAction}</div>
        <div className="flex-1 text-center">
          <h1 className="text-base font-bold text-text">{title}</h1>
          {subtitle && (
            <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="w-10 flex justify-end">{rightAction}</div>
      </div>
    </header>
  );
}
