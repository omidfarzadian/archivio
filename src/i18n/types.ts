export const LOCALES = ['fa', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

export type Direction = 'rtl' | 'ltr';

export const LOCALE_STORAGE_KEY = 'mava.locale';

export const LOCALE_META: Record<
  Locale,
  { label: string; nativeLabel: string; direction: Direction; htmlLang: string }
> = {
  fa: {
    label: 'Persian',
    nativeLabel: 'فارسی',
    direction: 'rtl',
    htmlLang: 'fa',
  },
  en: {
    label: 'English',
    nativeLabel: 'English',
    direction: 'ltr',
    htmlLang: 'en',
  },
};

export type TranslationParams = Record<string, string | number>;
