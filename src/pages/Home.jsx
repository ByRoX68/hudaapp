import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, MessageSquareQuote, Sparkles, Clock, Compass, CalendarDays } from 'lucide-react';
import Header from '@/components/Header';
import { AYETLER, HADISLER, EVLIYA_SOZLERI } from '@/lib/islamicContent';
import { useLanguage } from '@/components/LanguageProvider';
import { useSettings, sendNotification } from '@/lib/useSettings';

function hourlyPick(arr, hour) {
  return arr[hour % arr.length];
}

export default function Home() {
  const { lang, t } = useLanguage();
  const hour = new Date().getHours();
  const ayet = useMemo(() => hourlyPick(AYETLER, hour), [hour]);
  const hadis = useMemo(() => hourlyPick(HADISLER, hour + 1), [hour]);
  const evliya = useMemo(() => hourlyPick(EVLIYA_SOZLERI, hour + 2), [hour]);
  const { settings } = useSettings();

  useEffect(() => {
    if (!settings.notifEnabled) return;
    let timer;
    const tick = () => {
      const now = new Date();
      const nextHour = new Date(now);
      nextHour.setHours(now.getHours() + 1, 0, 5, 0);
      const wait = nextHour - now;
      timer = setTimeout(() => {
        const h = new Date().getHours();
        if (settings.notifAyet) {
          const a = hourlyPick(AYETLER, h);
          sendNotification(`${t('home.section.ayet')} • ${a.sure} ${a.ayet}`, a.meal[lang], settings.notifSound, settings.notifVibration);
        } else if (settings.notifHadis) {
          const hd = hourlyPick(HADISLER, h + 1);
          sendNotification(t('home.section.hadis'), hd.meal[lang], settings.notifSound, settings.notifVibration);
        } else if (settings.notifEvliya) {
          const ev = hourlyPick(EVLIYA_SOZLERI, h + 2);
          sendNotification(t('home.section.evliya'), `${ev.sahibi[lang]}: ${ev.meal[lang]}`, settings.notifSound, settings.notifVibration);
        }
        tick();
      }, wait);
    };
    tick();
    return () => clearTimeout(timer);
  }, [settings, lang, t]);

  const cards = [
    { to: '/ayetler', icon: BookOpen, title: t('page.ayetler.title'), sub: t('page.ayetler.subtitle') },
    { to: '/hadisler', icon: MessageSquareQuote, title: t('page.hadisler.title'), sub: t('page.hadisler.subtitle') },
    { to: '/evliya', icon: Sparkles, title: t('page.evliya.title'), sub: t('page.evliya.subtitle') },
    { to: '/namaz', icon: Clock, title: t('page.namaz.title'), sub: t('page.namaz.subtitle') },
    { to: '/kible', icon: Compass, title: t('page.kible.title'), sub: t('page.kible.subtitle') },
    { to: '/takvim', icon: CalendarDays, title: t('page.takvim.title'), sub: t('page.takvim.subtitle') },
  ];

  return (
    <div>
      <Header title={t('home.title')} subtitle={t('home.subtitle')} arabicTitle="هُدًى" />

      <div className="text-center my-6 animate-in">
        <p className="arabic text-3xl text-primary leading-loose">{t('bismillah')}</p>
        <p className="text-sm text-muted-foreground mt-1 italic">{t('bismillah.meaning')}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {cards.map((c, i) => (
          <Link
            key={c.to}
            to={c.to}
            className="group rounded-2xl border border-border bg-card p-4 transition-all hover:shadow-md hover:-translate-y-0.5 animate-in"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="w-11 h-11 rounded-xl bg-accent text-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <c.icon size={22} strokeWidth={1.8} />
            </div>
            <p className="font-semibold text-sm leading-tight">{c.title}</p>
            <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{c.sub}</p>
          </Link>
        ))}
      </div>

      <section className="rounded-2xl border border-border bg-gradient-to-br from-card to-accent/30 p-4 mb-4 animate-in">
        <div className="flex items-center gap-2 text-primary mb-2">
          <BookOpen size={16} />
          <span className="text-xs font-semibold uppercase tracking-wider">{t('home.section.ayet')}</span>
          <span className="ml-auto text-[11px] text-muted-foreground">{ayet.sure} {ayet.ayet}</span>
        </div>
        <p className="arabic text-xl text-foreground/90 mb-2 text-right">{ayet.arapca}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{ayet.meal[lang]}</p>
        <Link to="/ayetler" className="inline-flex items-center gap-1 text-xs text-primary mt-2 font-medium">
          {t('home.allAyet')} →
        </Link>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 mb-4 animate-in">
        <div className="flex items-center gap-2 text-primary mb-1">
          <MessageSquareQuote size={16} />
          <span className="text-xs font-semibold uppercase tracking-wider">{t('home.section.hadis')}</span>
        </div>
        <p className="text-sm leading-relaxed mb-1">“{hadis.meal[lang]}”</p>
        <p className="text-[11px] text-muted-foreground">{hadis.kaynak}</p>
        <Link to="/hadisler" className="inline-flex items-center gap-1 text-xs text-primary mt-2 font-medium">
          {t('home.allHadis')} →
        </Link>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 mb-6 animate-in">
        <div className="flex items-center gap-2 text-primary mb-1">
          <Sparkles size={16} />
          <span className="text-xs font-semibold uppercase tracking-wider">{t('home.section.evliya')}</span>
        </div>
        <p className="text-sm leading-relaxed mb-1">“{evliya.meal[lang]}”</p>
        <p className="text-[11px] text-muted-foreground">— {evliya.sahibi[lang]}</p>
        <Link to="/evliya" className="inline-flex items-center gap-1 text-xs text-primary mt-2 font-medium">
          {t('home.allEvliya')} →
        </Link>
      </section>

      {/* İstediğiniz İmza ve Boşluk Alanı */}
      <div className="w-full text-center mt-8 mb-4 flex flex-col items-center justify-center opacity-60">
        <p className="text-xs font-medium tracking-wide text-muted-foreground">
          HüdâAPP • 2026
        </p>
        <p className="text-[11px] font-semibold tracking-wider text-primary mt-1.5 uppercase">
          Bayram ETLİK
        </p>
      </div>
    </div>
  );
}
