import React, { useState } from 'react';
import { MessageSquareQuote } from 'lucide-react';
import Header from '@/components/Header';
import { HADISLER } from '@/lib/islamicContent';
import { useLanguage } from '@/components/LanguageProvider';

const PAGE_SIZE = 6;

export default function Hadisler() {
  const { lang, t } = useLanguage();
  const [source, setSource] = useState('all');
  const [page, setPage] = useState(1);

  const sources = ['all', ...Array.from(new Set(HADISLER.map((h) => h.kaynak)))];
  const filtered = source === 'all' ? HADISLER : HADISLER.filter((h) => h.kaynak === source);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const list = filtered.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);

  return (
    <div>
      <Header title={t('page.hadisler.title')} subtitle={t('page.hadisler.subtitle')} arabicTitle="أحاديث" />

      <div className="mb-4">
        <div className="rounded-2xl border border-border bg-card p-3">
          <label className="text-[11px] text-muted-foreground">{t('filter.source')}</label>
          <select
            value={source}
            onChange={(e) => { setSource(e.target.value); setPage(1); }}
            className="mt-1 w-full rounded-lg bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {sources.map((s) => (
              <option key={s} value={s}>{s === 'all' ? t('filter.all') : s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {list.map((h, i) => (
          <article
            key={h.id}
            className="rounded-2xl border border-border bg-card p-5 animate-in"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-center gap-2 text-primary mb-3">
              <MessageSquareQuote size={15} />
              <span className="text-xs font-semibold">{h.kaynak}</span>
            </div>
            <p className="arabic text-xl text-foreground/90 leading-loose text-right mb-3">{h.arapca}</p>
            <div className="h-px bg-border/60 my-3" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              {lang === 'ar' ? h.arapca : (h.meal[lang] || h.meal.tr)}
            </p>
          </article>
        ))}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-5 flex-wrap">
          <button
            disabled={cur <= 1}
            onClick={() => setPage(cur - 1)}
            className="px-3 py-1.5 rounded-lg border border-border text-xs disabled:opacity-40"
          >
            {t('page.prev')}
          </button>
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-xs font-medium border ${cur === i + 1 ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={cur >= pages}
            onClick={() => setPage(cur + 1)}
            className="px-3 py-1.5 rounded-lg border border-border text-xs disabled:opacity-40"
          >
            {t('page.next')}
          </button>
        </div>
      )}
    </div>
  );
}