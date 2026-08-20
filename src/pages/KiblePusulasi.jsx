import React, { useEffect, useState } from 'react';
import { Loader2, MapPin, Compass } from 'lucide-react';
import Header from '@/components/Header';
import { qiblaBearing } from '@/lib/qibla';
import { getPosition } from '@/lib/prayerTimes';
import { useLanguage } from '@/components/LanguageProvider';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export default function KiblePusulasi() {
  const { t } = useLanguage();
  const [heading, setHeading] = useState(null);
  const [qibla, setQibla] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errLoc, setErrLoc] = useState(false);
  const [isVibrated, setIsVibrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const p = await getPosition();
        setQibla(qiblaBearing(p.lat, p.lng));
      } catch (e) {
        setErrLoc(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      let h = null;
      if (e.webkitCompassHeading != null) {
        h = e.webkitCompassHeading;
      } else if (e.absolute === true && e.alpha != null) {
        h = 360 - e.alpha;
      } else if (e.alpha != null) {
        h = 360 - e.alpha;
      }

      if (typeof h === 'number') {
        setHeading(h);
      }
    };

    const start = async () => {
      try {
        if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
          const res = await DeviceOrientationEvent.requestPermission();
          if (res !== 'granted') return;
        }

        if ('ondeviceorientationabsolute' in window) {
          window.addEventListener('deviceorientationabsolute', handler, true);
        } else {
          window.addEventListener('deviceorientation', handler, true);
        }
      } catch { /* noop */ }
    };

    start();

    return () => {
      window.removeEventListener('deviceorientationabsolute', handler, true);
      window.removeEventListener('deviceorientation', handler, true);
    };
  }, []);

  // Kullanıcı Kıble açısına yaklaştığında titretme mantığı
  useEffect(() => {
    if (heading == null || qibla == null) return;

    // Telefonun baktığı yön ile gerçek kıble açısı arasındaki farkı bul
    const diff = Math.abs(heading - qibla);
    
    // Eğer kullanıcı kıbleye ±3 derece yaklaştıysa telefonu hafifçe titret
    if (diff <= 3) {
      if (!isVibrated) {
        Haptics.vibrate({ duration: 150 });
        setIsVibrated(true);
      }
    } else {
      setIsVibrated(false);
    }
  }, [heading, qibla, isVibrated]);

  if (loading) {
    return (
      <div>
        <Header title={t('page.kible.title')} subtitle={t('page.kible.subtitle')} arabicTitle="القبلة" />
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="animate-spin text-primary" size={28} />
          <p className="mt-3 text-sm">{t('prayer.locating')}</p>
        </div>
      </div>
    );
  }

  if (errLoc) {
    return (
      <div>
        <Header title={t('page.kible.title')} subtitle={t('page.kible.subtitle')} arabicTitle="القبلة" />
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-5 text-center">
          <p className="text-sm text-destructive mb-3">{t('prayer.errorLocation')}</p>
          <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">
            <MapPin size={16} /> {t('qible.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  // Pusula diski (Yönler) telefonun dönüşünün tam TERSİNE döner.
  const compassRotation = heading != null ? -heading : 0;
  
  // Kıble çizgisi ve Kâbe, pusula diskinin üzerine Kıble açısı kadar sabitlenir.
  const qiblaRotation = qibla != null ? qibla : 0;

  // Tam Kıble yönünde miyiz? (3 derece tolerans)
  const isTargeted = heading != null && qibla != null && Math.abs(heading - qibla) <= 3;

  return (
    <div>
      <Header title={t('page.kible.title')} subtitle={t('page.kible.subtitle')} arabicTitle="القبلة" />

      <div className="relative mx-auto my-8 flex items-center justify-center" style={{ width: 280, height: 280 }}>
        
        {/* SABİT DIŞ HALKA VE HEDEF OKU (Hiç dönmez, tam yukarıyı gösterir) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -top-5 z-20 flex flex-col items-center animate-bounce">
          <span className={`text-3xl transition-transform duration-200 ${isTargeted ? 'scale-125' : 'opacity-70'}`}>▼</span>
        </div>

        {/* DÖNEN PUSULA DİSKİ */}
        <div 
          className="absolute inset-0 rounded-full border-4 border-border bg-card shadow-2xl flex items-center justify-center transition-transform duration-100 ease-out"
          style={{ transform: `rotate(${compassRotation}deg)` }}
        >
          {/* Kerte işaretleri */}
          {Array.from({ length: 24 }).map((_, i) => {
            const major = i % 6 === 0;
            return (
              <div key={i} className="absolute left-1/2 top-1/2 origin-bottom" style={{ height: 130, transform: `translate(-50%, -100%) rotate(${i * 15}deg)` }}>
                <div className={`mx-auto ${major ? 'w-1 h-3 bg-foreground/50' : 'w-px h-2 bg-muted-foreground/30'}`} />
              </div>
            );
          })}

          {/* Ana Yön İsimleri (Pusula diskiyle beraber dönerler) */}
          <span className="absolute left-1/2 top-4 -translate-x-1/2 text-sm font-bold text-destructive">K</span>
          <span className="absolute left-1/2 bottom-4 -translate-x-1/2 text-sm font-bold text-foreground">G</span>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-foreground">D</span>
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-foreground">B</span>

          {/* SABİTLENMİŞ KIBLE DOĞRULTUSU VE KÂBE (Pusula üzerindeki gerçek açısına çakılıdır) */}
          <div className="absolute inset-0" style={{ transform: `rotate(${qiblaRotation}deg)` }}>
            {/* Merkezden Kâbe'ye giden Kıble çizgisi */}
            <div className={`absolute left-1/2 top-8 -translate-x-1/2 w-0.5 h-20 origin-bottom transition-colors ${isTargeted ? 'bg-primary w-1' : 'bg-amber-500/60'}`} />
            
            {/* Kıble açısındaki Kâbe simgesi */}
            <div className={`absolute left-1/2 top-2 -translate-x-1/2 text-3xl transition-all duration-200 ${isTargeted ? 'scale-125 drop-shadow-[0_0_12px_rgba(34,197,94,0.8)]' : 'opacity-80'}`} aria-label="Kaaba">
              🕋
            </div>
          </div>

          {/* Merkez Nokta */}
          <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full z-10 transition-all ${isTargeted ? 'bg-primary ring-8 ring-primary/30' : 'bg-muted-foreground ring-4 ring-muted/20'}`} />
        </div>
      </div>

      <div className="text-center -mt-2">
        <p className="text-sm text-muted-foreground">
          {t('qible.angle')}: <span className="font-mono font-semibold text-foreground">{qibla != null ? qibla.toFixed(1) + '°' : '—'}</span>
        </p>
        <p className="text-xs font-medium mt-1 transition-colors h-4">
          {isTargeted ? (
            <span className="text-primary animate-pulse">✓ Kıble Yönü Doğru (Mübarek Olsun)</span>
          ) : (
            <span className="text-muted-foreground">Telefonu döndürerek Kâbe'yi en üstteki ok işaretiyle hizalayın.</span>
          )}
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-accent/20 p-4 text-center">
        <p className="text-sm leading-relaxed">Doğru sonuç için telefonu düz tutun ve etrafında mıknatıs/metal bulundurmayın.</p>
      </div>
    </div>
  );
}
