import { translate, type TranslationKey } from '@/i18n/translate';
import type { Locale, TranslationParams } from '@/i18n/types';

type TranslateFn = (
  key: TranslationKey,
  params?: TranslationParams,
) => string;

function localeTag(locale: Locale): string {
  return locale === 'fa' ? 'fa-IR' : 'en-US';
}

export function formatNumber(value: number, locale: Locale = 'fa'): string {
  return value.toLocaleString(localeTag(locale));
}

/** @deprecated Prefer formatNumber with locale */
export function formatPersianNumber(value: number): string {
  return formatNumber(value, 'fa');
}

export function formatFileSize(
  bytes: number,
  locale: Locale = 'fa',
  t: TranslateFn = (key, params) => translate(locale, key, params),
): string {
  if (bytes < 1024) {
    return t('format.byte', { n: formatNumber(bytes, locale) });
  }
  if (bytes < 1024 * 1024) {
    return t('format.kilobyte', {
      n: formatNumber(Math.round(bytes / 1024), locale),
    });
  }
  const mb = (bytes / (1024 * 1024)).toFixed(1);
  const formatted =
    locale === 'fa' ? mb.replace('.', '/') : mb;
  return t('format.megabyte', { n: formatted });
}

export function formatRelativeDate(
  dateStr: string,
  locale: Locale = 'fa',
  t: TranslateFn = (key, params) => translate(locale, key, params),
): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return t('format.today');
  if (diffDays === 1) return t('format.yesterday');
  if (diffDays < 7) {
    return t('format.daysAgo', { n: formatNumber(diffDays, locale) });
  }

  return date.toLocaleDateString(localeTag(locale), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDate(dateStr: string, locale: Locale = 'fa'): string {
  return new Date(dateStr).toLocaleDateString(localeTag(locale), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function stripHtml(html: string): string {
  return htmlToPlainText(html);
}

export function htmlToPlainText(html: string): string {
  if (!html) return '';

  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|tr|blockquote)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
