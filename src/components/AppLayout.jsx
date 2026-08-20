import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home as HomeIcon, BookOpen, Clock, Compass, CalendarDays, Settings } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';

const NAV = [
  { to: '/', icon: HomeIcon, key: 'nav.home' },
  { to: '/ayetler', icon: BookOpen, key: 'nav.ayetler' },
  { to: '/namaz', icon: Clock, key: 'nav.vakitler' },
  { to: '/kible', icon: Compass, key: 'nav.kible' },
  { to: '/takvim', icon: CalendarDays, key: 'nav.takvim' },
  { to: '/ayarlar', icon: Settings, key: 'nav.ayarlar' },
];

export default function AppLayout() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-5 pb-28">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/90 backdrop-blur-lg">
        <div className="max-w-md mx-auto grid grid-cols-6">
          {NAV.map(({ to, icon: Icon, key }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
                  <span>{t(key)}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}