import { useNavigate } from 'react-router-dom';
import { IconSearch, IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import { AppLayout, PageHeader } from '@/components/ui/Layout';
import { useSearch } from '@/features/posts/hooks/useSearch';
import { formatDate, stripHtml, truncate } from '@/utils/format';
import { useI18n, useT } from '@/i18n';

export function SearchPage() {
  const navigate = useNavigate();
  const t = useT();
  const { locale, isRtl } = useI18n();
  const ResultArrow = isRtl ? IconArrowLeft : IconArrowRight;
  const { query, setQuery, results, loading } = useSearch();

  return (
    <AppLayout>
      <PageHeader title={t('search.title')} />

      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="relative mb-6">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className="w-full rounded-2xl border border-border bg-surface py-3.5 pe-11 ps-4 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            autoFocus
          />
          <IconSearch
            size={20}
            className="absolute end-4 top-1/2 -translate-y-1/2 text-text-secondary"
          />
        </div>

        {loading && query && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-3xl bg-surface animate-pulse shadow-card" />
            ))}
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="text-center py-16">
            <IconSearch size={48} className="mx-auto text-text-secondary/30 mb-4" />
            <p className="text-text-secondary text-sm">{t('search.noResults')}</p>
          </div>
        )}

        {!query && (
          <div className="text-center py-16">
            <IconSearch size={48} className="mx-auto text-text-secondary/30 mb-4" />
            <p className="text-text-secondary text-sm">{t('search.hint')}</p>
          </div>
        )}

        <div className="space-y-3">
          {results.map(({ post, categoryName, matchType }) => (
            <button
              key={post.id}
              onClick={() => navigate(`/category/${post.categoryId}`)}
              className="w-full text-start rounded-3xl bg-surface p-4 shadow-card hover:shadow-card-hover transition-all active:scale-[0.99]"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-accent font-medium">{categoryName}</span>
                <ResultArrow size={16} className="text-text-secondary" />
              </div>
              <h3 className="font-bold text-text mb-1">{post.title}</h3>
              <p className="text-sm text-text-secondary line-clamp-2 mb-2">
                {truncate(stripHtml(post.content), 100)}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary">
                  {formatDate(post.createdAt, locale)}
                </span>
                <span className="text-xs text-text-secondary/70">
                  {matchType === 'title' && t('search.match.title')}
                  {matchType === 'content' && t('search.match.content')}
                  {matchType === 'filename' && t('search.match.filename')}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
