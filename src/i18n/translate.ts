import { en } from './locales/en';
import { fa, type TranslationKey } from './locales/fa';
import type { Locale, TranslationParams } from './types';

const catalogs: Record<Locale, Record<TranslationKey, string>> = {
  fa,
  en,
};

export function translate(
  locale: Locale,
  key: TranslationKey,
  params?: TranslationParams,
): string {
  const template = catalogs[locale][key] ?? catalogs.en[key] ?? key;
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
    params[name] !== undefined ? String(params[name]) : `{{${name}}}`,
  );
}

export type { TranslationKey };
