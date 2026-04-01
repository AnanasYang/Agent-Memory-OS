'use client';

import { GlobalSearch } from '@/components/global-search';
import { useLanguage } from '@/components/language-provider';
import { Search } from 'lucide-react';

export default function SearchPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Search className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">{t('search.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('search.subtitle')}
          </p>
        </div>
      </div>

      {/* Search */}
      <GlobalSearch />
    </div>
  );
}
