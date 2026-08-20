import React from 'react';
import { MoonStar } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/components/LanguageProvider';

export default function Header({ title, subtitle, arabicTitle }) {
  const { theme, themes, setTheme } = useTheme();
  const { t } = useLanguage();
  return (
    <header className="mb-5 animate-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground grid place-items-center shadow-lg shadow-primary/20 shrink-0">
            <MoonStar size={23} strokeWidth={1.9} />
          </div>
          <div>
            <p className="font-display font-bold text-xl tracking-tight leading-none">
              {t('brand.name').slice(0, 4)}<span className="text-primary">{t('brand.name').slice(4)}</span>
            </p>
            {arabicTitle ? (
              <p className="arabic text-base text-primary/70 mt-1 leading-tight">{arabicTitle}</p>
            ) : (
              <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mt-1">{t('brand.tagline')}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {themes.map((tm) => (
            <button
              key={tm.id}
              onClick={() => setTheme(tm.id)}
              title={tm.name}
              aria-label={tm.name}
              className={`w-6 h-6 rounded-full transition-all ring-offset-2 ring-offset-background ${
                theme === tm.id ? 'ring-2 ring-foreground scale-110' : 'opacity-80'
              }`}
              style={{ background: `linear-gradient(135deg, ${tm.swatch[0]}, ${tm.swatch[1]})` }}
            />
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h1 className="text-2xl font-bold font-heading">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground text-right">{subtitle}</p>}
      </div>
      <div className="mt-3 h-px bg-gradient-to-r from-primary/40 via-primary/10 to-transparent" />
    </header>
  );
}