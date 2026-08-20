// alquran.cloud — ücretsiz Kur'an API'si (anahtar gerektirmez)
// Sure listesi + sure başına çok dilli meal (TR/EN/DE) + Arapça asıl metin

const BASE = 'https://api.alquran.cloud/v1';

// Dil kodu -> meal sürümü
const EDITIONS = {
  tr: 'tr.diyanet',
  en: 'en.sahih',
  de: 'de.abourida',
};

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

export async function getSurahList() {
  const res = await fetch(`${BASE}/surah`);
  if (!res.ok) throw new Error('surah-list');
  const json = await res.json();
  return json.data.map((s) => ({
    number: s.number,
    name: s.name,             // arabic
    englishName: s.englishName,
    englishTranslation: s.englishNameTranslation,
    ayahs: s.numberOfAyahs,
    revelation: s.revelationType,
  }));
}

export async function getSurahVerses(number, lang) {
  const edition = EDITIONS[lang];
  const fields = ['quran-uthmani', edition].filter(Boolean).join(',');
  let res;
  for (let attempt = 0; attempt < 3; attempt++) {
    res = await fetch(`${BASE}/surah/${number}/editions/${fields}`);
    if (res.ok) break;
    await pause(600);
  }
  if (!res || !res.ok) throw new Error('surah-verses');
  const json = await res.json();
  const arabicEdition = json.data.find((e) => e.edition.identifier === 'quran-uthmani') || json.data[0];
  const translationEdition = json.data.find((e) => e.edition.identifier === edition);
  const ayahs = (arabicEdition?.ayahs || []).map((a) => ({
    number: a.numberInSurah,
    arabic: a.text,
    translation: translationEdition ? translationEdition.ayahs[a.numberInSurah - 1]?.text : '',
  }));
  return {
    surah: {
      number: arabicEdition?.number || number,
      name: arabicEdition?.name,
      englishName: arabicEdition?.englishName,
      ayahs: arabicEdition?.numberOfAyahs,
    },
    ayahs,
  };
}