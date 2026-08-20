// Aladhan API yardımcıları (anahtar gerektirmez) — method 13 = Diyanet
const BASE = 'https://api.aladhan.com/v1';

export async function getPrayerTimes(lat, lng, date = new Date()) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const url = `${BASE}/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lng}&method=13`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('TIMINGS');
  const json = await res.json();
  const t = json.data.timings;
  return {
    imsak: t.Imsak,
    gunes: t.Sunrise,
    ogle: t.Dhuhr,
    ikindi: t.Asr,
    aksam: t.Maghrib,
    yatsi: t.Isha,
    hijri: json.data.date.hijri,
    gregorian: json.data.date.gregorian,
  };
}

export async function getHijriMonth(year, month) {
  const url = `${BASE}/gToHCalendar/${month}/${year}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Hicri takvim alınamadı');
  const json = await res.json();
  return json.data;
}

export const PRAYER_LABELS = {
  imsak: 'İmsak',
  gunes: 'Güneş',
  ogle: 'Öğle',
  ikindi: 'İkindi',
  aksam: 'Akşam',
  yatsi: 'Yatsı',
};

export function nextPrayer(times) {
  const keys = ['imsak', 'gunes', 'ogle', 'ikindi', 'aksam', 'yatsi'];
  const now = new Date();
  for (const k of keys) {
    const [h, m] = times[k].split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    if (d > now) return { key: k, label: PRAYER_LABELS[k], at: d, time: times[k] };
  }
  const [h, m] = times.imsak.split(':').map(Number);
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(h, m, 0, 0);
  return { key: 'imsak', label: PRAYER_LABELS.imsak, at: d, time: times.imsak, tomorrow: true };
}

export function fmtCountdown(ms) {
  if (ms < 0) ms = 0;
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function getPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('LOCATION'));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(new Error('LOCATION')),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 600000 }
    );
  });
}