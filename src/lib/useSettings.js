import { useEffect, useState, useCallback } from 'react';

const KEY = 'hudaa-settings';

export const DEFAULT_SETTINGS = {
  notifAyet: true,
  notifHadis: true,
  notifEvliya: true,
  notifNamaz: true,
  notifSound: 'default',
  notifVibration: false,
  notifEnabled: false,
  locationGranted: false,
};

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return { ...DEFAULT_SETTINGS, ...(raw ? JSON.parse(raw) : {}) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(settings));
  }, [settings]);

  const update = useCallback((patch) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  return { settings, update };
}

export async function ensureNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const res = await Notification.requestPermission();
  return res === 'granted';
}

export function vibrate(pattern = [60, 40, 60]) {
  try {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  } catch (e) {
    // sessizce geç
  }
}

export function playSound(sound = 'default') {
  if (!sound || sound === 'none') return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const tone = ({ freq, type = 'sine', start = 0, dur = 0.6, gain = 0.14 }) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      o.connect(g);
      g.connect(ctx.destination);
      const t0 = ctx.currentTime + start;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(gain, t0 + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.start(t0);
      o.stop(t0 + dur + 0.02);
    };
    switch (sound) {
      case 'soft':
        tone({ freq: 523, type: 'sine', dur: 1.1, gain: 0.12 });
        break;
      case 'nefes':
        tone({ freq: 392, type: 'sine', dur: 1.5, gain: 0.08 });
        tone({ freq: 587, type: 'sine', start: 0.5, dur: 1.2, gain: 0.06 });
        break;
      case 'ud':
        tone({ freq: 294, type: 'triangle', dur: 0.7, gain: 0.16 });
        tone({ freq: 440, type: 'triangle', start: 0.16, dur: 0.6, gain: 0.12 });
        break;
      case 'neva':
        tone({ freq: 880, type: 'sine', dur: 0.9, gain: 0.10 });
        tone({ freq: 1318, type: 'sine', start: 0.26, dur: 0.8, gain: 0.08 });
        break;
      case 'default':
      default:
        tone({ freq: 660, type: 'sine', dur: 0.5, gain: 0.16 });
        tone({ freq: 880, type: 'sine', start: 0.18, dur: 0.5, gain: 0.14 });
        break;
    }
  } catch (e) {
    // sessizce geç
  }
}

export function sendNotification(title, body, sound = 'default', vibration = false) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    const n = new Notification(title, { body, tag: 'hudaa-' + Date.now() });
    if (sound !== 'none') playSound(sound);
    if (vibration) vibrate([60, 40, 60]);
    setTimeout(() => n.close(), 8000);
  } catch (e) {
    // sessizce geç
  }
}