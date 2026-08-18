import { NavLink, useLocation } from 'react-router-dom';
import { IconCategory, IconSearch, IconSettings } from '@tabler/icons-react';
import { useT } from '@/i18n';
import { cn } from '@/utils/format';

export function BottomNav() {
  const location = useLocation();
  const t = useT();

  const tabs = [
    { to: '/', label: t('nav.categories'), icon: IconCategory },
    { to: '/search', label: t('nav.search'), icon: IconSearch },
    { to: '/settings', label: t('nav.settings'), icon: IconSettings },
  ] as const;

  return (
    <nav className="shrink-0 border-t border-border bg-surface/95 backdrop-blur-lg safe-bottom">
      <div className="flex items-center justify-around px-2 py-1.5 max-w-lg mx-auto">
        {tabs.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-1.5 transition-all duration-200',
                active ? 'text-accent' : 'text-text-secondary',
              )}
            >
              <Icon size={22} stroke={active ? 2 : 1.5} />
              <span
                className={cn(
                  'max-w-full truncate text-[11px] leading-none',
                  active && 'font-bold',
                )}
              >
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
