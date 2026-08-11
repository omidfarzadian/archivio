import {
  LOCALE_META,
  LOCALE_STORAGE_KEY,
  LOCALES,
  type Locale,
} from './types';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export function detectDeviceLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en';
  const candidates = [
    navigator.language,
    ...(navigator.languages ?? []),
  ]
    .filter(Boolean)
    .map((l) => l.toLowerCase());

  return candidates.some((l) => l === 'fa' || l.startsWith('fa-')) ? 'fa' : 'en';
}

export function readStoredLocale(): Locale | null {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function persistLocale(locale: Locale): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // ignore quota / private mode
  }
}

export function resolveInitialLocale(): Locale {
  return readStoredLocale() ?? detectDeviceLocale();
}

export function applyDocumentLocale(locale: Locale): void {
  const meta = LOCALE_META[locale];
  const root = document.documentElement;
  root.lang = meta.htmlLang;
  root.dir = meta.direction;
  root.dataset.locale = locale;
  document.title = locale === 'fa' ? 'ماوا' : 'Mava';
}
