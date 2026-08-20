import React, { useEffect, useState } from 'react';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import { getHijriMonth } from '@/lib/prayerTimes';
import { useLanguage } from '@/components/LanguageProvider';

const TR_HIJRI = ['Muharrem','Safer','Rebiülevvel','Rebiülahir','Cemaziyelevvel','Cemaziyelahir','Receb','Şaban','Ramazan','Şevval','Zilkade','Zilhicce'];
function hijriMonthName(h, lang) {
  if (!h || !h.month) return '';
  if (lang === 'ar') return h.month.ar || '';
  if (lang === 'tr') return TR_HIJRI[(h.month.number || 1) - 1] || h.month.en || '';
  return h.month.en || '';
}

export default function HicriTakvim() {
  const { t, lang } = useLanguage();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getHijriMonth(year, month + 1)
      .then((d) => alive && setData(d))
      .catch(() => alive && setData([]))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [year, month]);

  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prev = () => (month === 0 ? (setYear(year - 1), setMonth(11)) : setMonth(month - 1));
  const next = () => (month === 11 ? (setYear(year + 1), setMonth(0)) : setMonth(month + 1));

  const ht = data.find((x) => {
    const g = new Date(x.gregorian.year, x.gregorian.month.number - 1, Number(x.gregorian.day));
    return g.toDateString() === today.toDateString();
  });

  return (
    <div>
      <Header title={t('page.takvim.title')} subtitle={t('page.takvim.subtitle')} arabicTitle="التقويم" />

      {ht && (
        <div className="rounded-3xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground p-5 mb-5 text-center shadow-lg">
          <p className="text-xs uppercase tracking-widest opacity-80">{t('takvim.today')}</p>
          <p className="text-2xl font-bold mt-1 font-heading">
            {ht.hijri.day} {hijriMonthName(ht.hijri, lang)} {ht.hijri.year} H
          </p>
          <p className="text-xs opacity-80 mt-1">{today.getDate()} {t('months.' + month)} {year}</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <button onClick={prev} className="p-2 rounded-lg hover:bg-accent text-primary">
          <ChevronLeft size={20} />
        </button>
        <p className="font-semibold">{t('months.' + month)} {year}</p>
        <button onClick={next} className="p-2 rounded-lg hover:bg-accent text-primary">
          <ChevronRight size={20} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-muted-foreground py-2 border-b border-border">
            {[0,1,2,3,4,5,6].map((d) => <div key={d}>{t('dow.' + d)}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((d, i) => {
              if (d === null) return <div key={i} className="aspect-square" />;
              const entry = data.find((x) => Number(x.gregorian.day) === d);
              const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              return (
                <div
                  key={i}
                  className={`aspect-square flex flex-col items-center justify-center border-t border-l border-border/60 ${isToday ? 'bg-primary text-primary-foreground' : ''}`}
                >
                  <span className="text-sm font-medium leading-none">{d}</span>
                  {entry && (
                    <span className={`text-[9px] mt-0.5 ${isToday ? 'opacity-90' : 'text-muted-foreground'}`}>
                      {entry.hijri.day}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      <p className="text-[11px] text-muted-foreground text-center mt-3">{t('takvim.hint')}</p>
    </div>
  );
}