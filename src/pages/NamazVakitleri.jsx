import React, { useEffect, useState } from 'react';
import { MapPin, RefreshCw, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import {
  getPrayerTimes,
  nextPrayer,
  fmtCountdown,
  getPosition,
} from '@/lib/prayerTimes';
import { useLanguage } from '@/components/LanguageProvider';
import { useSettings, sendNotification } from '@/lib/useSettings';

const ORDER = ['imsak', 'gunes', 'ogle', 'ikindi', 'aksam', 'yatsi'];
const ICONS = { imsak: 'Moon', gunes: 'Sunrise', ogle: 'Sun', ikindi: 'CloudSun', aksam: 'Sunset', yatsi: 'MoonStar' };

export default function NamazVakitleri() {
  const { lang, t } = useLanguage();
  const { settings, update } = useSettings();
  const [pos, setPos] = useState(null);
  const [times, setTimes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorKind, setErrorKind] = useState('');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const load = async () => {
    setLoading(true);
    setErrorKind('');
    try {
      let p = pos;
      if (!p) {
        p = await getPosition();
        setPos(p);
        update({ locationGranted: true });
      }
      const tm = await getPrayerTimes(p.lat, p.lng);
      setTimes(tm);
    } catch (e) {
      setErrorKind(e?.message === 'TIMINGS' ? 'TIMINGS' : 'LOCATION');
      update({ locationGranted: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  useEffect(() => {
    if (!times || !settings.notifEnabled || !settings.notifNamaz) return;
    const np = nextPrayer(times);
    const wait = np.at - now;
    if (wait <= 0) return;
    const id = setTimeout(() => {
      sendNotification(`${t('prayer.' + np.key)} ${t('prayer.notif')}`, t('prayer.accepted'), settings.notifSound, settings.notifVibration);
    }, wait);
    return () => clearTimeout(id);
  }, [times, now, settings, t]);

  const np = times ? nextPrayer(times) : null;

  return (
    <div>
      <Header title={t('page.namaz.title')} subtitle={t('page.namaz.subtitle')} arabicTitle="أوقات الصلاة" />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="animate-spin text-primary" size={28} />
          <p className="mt-3 text-sm">{t('prayer.loading')}</p>
        </div>
      ) : errorKind ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-5 text-center">
          <p className="text-sm text-destructive mb-3">
            {errorKind === 'LOCATION' ? t('prayer.errorLocation') : t('prayer.errorGeneric')}
          </p>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"
          >
            <MapPin size={16} /> {t('prayer.grantLocation')}
          </button>
        </div>
      ) : times ? (
        <>
          <div className="rounded-3xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground p-6 mb-5 text-center shadow-lg animate-in">
            <p className="text-xs uppercase tracking-widest opacity-80">{t('prayer.next')}</p>
            <p className="text-3xl font-bold mt-1 font-heading">{t('prayer.' + np.key)}</p>
            <p className="text-sm opacity-80 mt-1">{np.tomorrow ? t('prayer.tomorrow') + ' ' : ''}{np.time}</p>
            <p className="text-5xl font-mono mt-4 tabular-nums tracking-tight">{fmtCountdown(np.at - now)}</p>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {ORDER.map((k) => {
              const isNext = np && np.key === k && !np.tomorrow;
              return (
                <div
                  key={k}
                  className={`flex items-center gap-3 px-4 py-3.5 ${isNext ? 'bg-accent/40' : ''} ${ORDER.indexOf(k) !== 0 ? 'border-t border-border' : ''}`}
                >
                  <span className="font-medium text-sm">{t('prayer.' + k)}</span>
                  <span className="ml-auto font-mono text-sm tabular-nums">{times[k]}</span>
                </div>
              );
            })}
          </div>

          <button
            onClick={load}
            className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <RefreshCw size={14} /> {t('prayer.retry')}
          </button>

          {times.hijri && (
            <div className="mt-5 rounded-2xl border border-border bg-accent/20 p-4 text-center">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{t('prayer.today')}</p>
              <p className="text-lg font-semibold mt-1">
                {times.hijri.day} {times.hijri.month.ar} {times.hijri.year} H
              </p>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}