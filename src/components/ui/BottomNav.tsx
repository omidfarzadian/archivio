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
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-surface/95 backdrop-blur-lg safe-bottom">
      <div className="flex items-center justify-around px-4 py-2 max-w-lg mx-auto">
        {tabs.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-200 min-w-[72px]',
                active ? 'text-accent' : 'text-text-secondary',
              )}
            >
              <Icon size={22} stroke={active ? 2 : 1.5} />
              <span className={cn('text-xs', active && 'font-bold')}>{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
