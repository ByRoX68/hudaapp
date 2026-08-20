import React, { useState } from 'react';
import { Bell, MapPin, Volume2, Palette, Check, Globe, Vibrate } from 'lucide-react';
import Header from '@/components/Header';
import { useSettings, ensureNotificationPermission, sendNotification, playSound, vibrate } from '@/lib/useSettings';
import { useTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { getPosition } from '@/lib/prayerTimes';

function Toggle({ on, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative w-11 h-6 rounded-full transition-colors ${on ? 'bg-primary' : 'bg-muted'}`}>
      
      <span className={`absolute left-0 top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
    </button>);

}

function Row({ icon: Icon, title, desc, children }) {
  return (
    <div className="flex items-center gap-3 py-4">
      <div className="w-9 h-9 rounded-lg bg-accent text-primary flex items-center justify-center shrink-0">
        <Icon size={17} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight">{title}</p>
        {desc && <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>);

}

function SectionTitle({ children }) {
  return <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2 px-1">{children}</p>;
}

export default function Ayarlar() {
  const { settings, update } = useSettings();
  const { theme, themes, setTheme } = useTheme();
  const { lang, setLang, t, languages } = useLanguage();
  const [permission, setPermission] = useState('Notification' in window ? Notification.permission : 'unsupported');

  const enableNotifications = async () => {
    const granted = await ensureNotificationPermission();
    setPermission(granted ? 'granted' : Notification.permission);
    if (granted) {
      update({ notifEnabled: true });
      sendNotification('HüdâAPP', t('set.notifEnabledToast'), settings.notifSound, settings.notifVibration);
    }
  };

  const requestLocation = async () => {
    try {
      await getPosition();
      update({ locationGranted: true });
    } catch {
      update({ locationGranted: false });
    }
  };

  return (
    <div>
      <Header title={t('page.ayarlar.title')} subtitle={t('page.ayarlar.subtitle')} arabicTitle="الإعدادات" />

      <section className="mb-5">
        <SectionTitle>{t('set.language')}</SectionTitle>
        <div className="rounded-2xl border border-border bg-card p-3">
          <div className="flex items-center gap-2 mb-3 px-1">
            <Globe size={15} className="text-primary" />
            <span className="text-xs text-muted-foreground">{t('set.languageDesc')}</span>
          </div>
          <div className="flex gap-1.5">
            {languages.map((l) =>
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`rounded-xl py-2 px-1.5 text-[11px] font-medium border transition-all flex items-center gap-1 flex-1 min-w-0 justify-center overflow-hidden ${
              lang === l.code ?
              'bg-primary text-primary-foreground border-primary' :
              'border-border text-foreground hover:bg-accent'}`
              }>

                <span className="leading-none text-xs font-bold tracking-wide shrink-0">{l.flag}</span>
                <span className="truncate">{l.label}</span>
                {lang === l.code && <Check size={13} className="shrink-0" />}
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="mb-5">
        <SectionTitle>{t('set.notif')}</SectionTitle>
        <div className="rounded-2xl border border-border bg-card px-4 divide-y divide-border">
          {permission !== 'granted' ?
          <div className="py-4">
              <Row icon={Bell} title={t('set.notifPermission')} desc={t('set.notifPermissionDesc')} />
              <button
              onClick={enableNotifications}
              className="w-full rounded-lg bg-primary text-primary-foreground py-2 text-sm font-medium">
              
                {t('set.allowNotif')}
              </button>
            </div> :

          <>
              <Row icon={Bell} title={t('set.notifMaster')} desc={t('set.notifMasterDesc')}>
                <Toggle on={settings.notifEnabled} onClick={() => update({ notifEnabled: !settings.notifEnabled })} />
              </Row>
              <Row icon={Bell} title={t('set.hourlyAyet')} desc={t('set.hourlyAyetDesc')}>
                <Toggle on={settings.notifAyet} onClick={() => update({ notifAyet: !settings.notifAyet })} />
              </Row>
              <Row icon={Bell} title={t('set.hourlyHadis')} desc={t('set.hourlyHadisDesc')}>
                <Toggle on={settings.notifHadis} onClick={() => update({ notifHadis: !settings.notifHadis })} />
              </Row>
              <Row icon={Bell} title={t('set.hourlyEvliya')} desc={t('set.hourlyEvliyaDesc')}>
                <Toggle on={settings.notifEvliya} onClick={() => update({ notifEvliya: !settings.notifEvliya })} />
              </Row>
              <Row icon={Bell} title={t('set.namaz')} desc={t('set.namazDesc')}>
                <Toggle on={settings.notifNamaz} onClick={() => update({ notifNamaz: !settings.notifNamaz })} />
              </Row>
            </>
          }
        </div>
      </section>

      <section className="mb-5">
        <SectionTitle>{t('set.sound')}</SectionTitle>
        <div className="rounded-2xl border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-accent text-primary flex items-center justify-center">
              <Volume2 size={17} />
            </div>
            <p className="text-sm font-medium">{t('set.soundDesc')}</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {['default', 'soft', 'nefes', 'ud', 'neva', 'none'].map((sid) =>
            <button
              key={sid}
              onClick={() => {
                update({ notifSound: sid });
                if (sid !== 'none') playSound(sid);
                if (settings.notifVibration) vibrate([50, 30, 50]);
              }}
              className={`rounded-lg py-2 text-xs font-medium border transition-colors ${
              settings.notifSound === sid ?
              'bg-primary text-primary-foreground border-primary' :
              'border-border text-muted-foreground'}`
              }>
              
                {t('set.sound.' + sid)}
              </button>
            )}
          </div>
          <div className="h-px bg-border/60 my-3" />
          <div
            role="button"
            tabIndex={0}
            onClick={() => update({ notifVibration: !settings.notifVibration })}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); update({ notifVibration: !settings.notifVibration }); } }}
            className="flex items-center gap-3 py-4 cursor-pointer select-none">
            <div className="w-9 h-9 rounded-lg bg-accent text-primary flex items-center justify-center shrink-0">
              <Vibrate size={17} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-tight">{t('set.vibration')}</p>
              <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{t('set.vibrationDesc')}</p>
            </div>
            <Toggle on={settings.notifVibration} onClick={(e) => { e.stopPropagation(); update({ notifVibration: !settings.notifVibration }); }} />
          </div>
        </div>
      </section>

      <section className="mb-5">
        <SectionTitle>{t('set.location')}</SectionTitle>
        <div className="rounded-2xl border border-border bg-card px-4 divide-y divide-border">
          <Row icon={MapPin} title={t('set.locationTitle')} desc={t('set.locationDesc')}>
            <button
              onClick={requestLocation}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
              settings.locationGranted ?
              'bg-accent text-primary border-border' :
              'bg-primary text-primary-foreground border-primary'}`
              }>
              
              {settings.locationGranted ? <><Check size={13} /> {t('set.locationGranted')}</> : t('set.locationGrant')}
            </button>
          </Row>
        </div>
      </section>

      <section className="mb-5">
        <SectionTitle>{t('set.theme')}</SectionTitle>
        <div className="rounded-2xl border border-border bg-card p-3">
          <div className="flex items-center gap-2 mb-3 px-1">
            <Palette size={15} className="text-primary" />
            <span className="text-xs text-muted-foreground">{t('set.themeDesc')}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {themes.map((tm) =>
            <button
              key={tm.id}
              onClick={() => setTheme(tm.id)}
              className={`rounded-xl p-3 border text-left transition-all ${
              theme === tm.id ? 'border-primary ring-1 ring-primary' : 'border-border'}`
              }
              style={{ background: `linear-gradient(135deg, ${tm.swatch[0]}22, ${tm.swatch[1]}22)` }}>
              
                <div className="w-full h-10 rounded-lg mb-2" style={{ background: `linear-gradient(135deg, ${tm.swatch[0]}, ${tm.swatch[1]})` }} />
                <p className="text-sm font-semibold">{tm.name}</p>
                <p className="text-[11px] text-muted-foreground">{tm.desc}</p>
                {theme === tm.id &&
              <div className="flex items-center gap-1 text-[11px] text-primary mt-1 font-medium">
                    <Check size={12} /> {t('set.themeSelected')}
                  </div>
              }
              </button>
            )}
          </div>
        </div>
      </section>

      <p className="text-center text-[11px] text-muted-foreground py-4">HüdâAPP • {new Date().getFullYear()}</p>
    </div>);

}