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

const RICH_TEXT_TAGS = new Set([
  'B',
  'STRONG',
  'I',
  'EM',
  'U',
  'BR',
  'DIV',
  'P',
  'SPAN',
  'A',
]);

function sanitizeInlineStyle(style: string): string | null {
  const kept: string[] = [];
  for (const declaration of style.split(';')) {
    const colon = declaration.indexOf(':');
    if (colon === -1) continue;
    const prop = declaration.slice(0, colon).trim().toLowerCase();
    const value = declaration.slice(colon + 1).trim();
    if (!value || /url\s*\(|expression|javascript:/i.test(value)) continue;
    if (
      prop === 'font-weight' ||
      prop === 'font-style' ||
      prop === 'text-decoration'
    ) {
      kept.push(`${prop}: ${value}`);
    }
  }
  return kept.length > 0 ? kept.join('; ') : null;
}

function sanitizeHref(href: string): string | null {
  const trimmed = href.trim();
  if (!trimmed) return null;
  if (/^(https?:|mailto:|#|\/)/i.test(trimmed)) return trimmed;
  return null;
}

/** Allow only editor formatting tags for safe HTML preview rendering. */
export function sanitizeRichTextHtml(html: string): string {
  if (!html?.trim()) return '';
  if (typeof DOMParser === 'undefined') return htmlToPlainText(html);

  const source = new DOMParser().parseFromString(html, 'text/html');
  const cleanRoot = document.createElement('div');

  const cloneSafe = (node: Node): Node | null => {
    if (node.nodeType === Node.TEXT_NODE) {
      return document.createTextNode(node.textContent ?? '');
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const el = node as HTMLElement;
    if (!RICH_TEXT_TAGS.has(el.tagName)) {
      const frag = document.createDocumentFragment();
      el.childNodes.forEach((child) => {
        const safe = cloneSafe(child);
        if (safe) frag.appendChild(safe);
      });
      return frag;
    }

    const out = document.createElement(el.tagName.toLowerCase());
    if (el.tagName === 'A') {
      const href = sanitizeHref(el.getAttribute('href') ?? '');
      if (href) {
        out.setAttribute('href', href);
        out.setAttribute('target', '_blank');
        out.setAttribute('rel', 'noopener noreferrer');
      }
    }

    const style = sanitizeInlineStyle(el.getAttribute('style') ?? '');
    if (style) out.setAttribute('style', style);

    el.childNodes.forEach((child) => {
      const safe = cloneSafe(child);
      if (safe) out.appendChild(safe);
    });
    return out;
  };

  source.body.childNodes.forEach((child) => {
    const safe = cloneSafe(child);
    if (safe) cleanRoot.appendChild(safe);
  });

  return cleanRoot.innerHTML;
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
