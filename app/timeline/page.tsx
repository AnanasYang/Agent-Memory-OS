'use client';

import { EvolutionTimeline } from '@/components/evolution-timeline';
import { useLanguage } from '@/components/language-provider';
import { Clock } from 'lucide-react';

export default function TimelinePage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Clock className="w-8 h-8 text-green-500" />
        <div>
          <h1 className="text-2xl font-bold">{t('timeline.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('timeline.subtitle')}
          </p>
        </div>
      </div>

      {/* Timeline */}
      <EvolutionTimeline />
    </div>
  );
}
