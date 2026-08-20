import React, { useEffect, useState } from 'react';
import { BookOpen, Loader2, RefreshCw } from 'lucide-react';
import Header from '@/components/Header';
import { useLanguage } from '@/components/LanguageProvider';
import { getSurahList, getSurahVerses } from '@/lib/quranApi';
import { sureAdiTR } from '@/lib/surahNamesTR';

export default function Ayetler() {
  const { lang, t } = useLanguage();
  const [surahList, setSurahList] = useState([]);
  const [selected, setSelected] = useState(1);
  const [nonce, setNonce] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getSurahList().then(setSurahList).catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    getSurahVerses(selected, lang)
      .then((d) => alive && setData(d))
      .catch(() => alive && setError('err'))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [selected, lang, nonce]);

  return (
    <div>
      <Header title={t('page.ayetler.title')} subtitle={t('page.ayetler.subtitle')} arabicTitle="القرآن" />

      {surahList.length > 0 && (
        <label className="block mb-4">
          <span className="sr-only">{t('surah.select')}</span>
          <select
            value={selected}
            onChange={(e) => setSelected(Number(e.target.value))}
            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {surahList.map((s) => (
              <option key={s.number} value={s.number}>
                {s.number}. {sureAdiTR(s.number)} — {s.name} ({s.ayahs})
              </option>
            ))}
          </select>
        </label>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="animate-spin text-primary" size={28} />
          <p className="mt-3 text-sm">{t('surah.loading')}</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-5 text-center">
          <p className="text-sm text-destructive mb-3">{t('surah.error')}</p>
          <button
            onClick={() => setNonce((n) => n + 1)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"
          >
            <RefreshCw size={15} /> {t('surah.retry')}
          </button>
        </div>
      ) : data ? (
        <div className="space-y-3">
          <div className="rounded-2xl bg-primary text-primary-foreground px-4 py-3 text-center sticky top-0 z-10">
            <span className="arabic text-lg ml-2">{data.surah.name}</span>
            <span className="text-sm opacity-90">· {sureAdiTR(data.surah.number)}</span>
          </div>
          {data.ayahs.map((a) => (
            <article
              key={a.number}
              className="rounded-2xl border border-border bg-card p-5 animate-in"
            >
              <div className="flex items-center justify-between text-primary mb-2">
                <span className="text-xs font-semibold">{sureAdiTR(data.surah.number)} · {t('surah.ayah')} {a.number}</span>
                <span className="w-7 h-7 rounded-full bg-accent text-primary text-xs font-bold flex items-center justify-center arabic">
                  {a.number}
                </span>
              </div>
              <BookOpen size={14} className="text-primary mb-1" />
              <p className="arabic text-2xl text-foreground leading-loose text-right">{a.arabic}</p>
              {a.translation && (
                <>
                  <div className="h-px bg-border/60 my-3" />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    <span className="text-primary font-medium">{t('meal')}: </span>
                    {a.translation}
                  </p>
                </>
              )}
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}