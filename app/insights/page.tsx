'use client';

import { InsightsRadar } from '@/components/insights-radar';
import { useLanguage } from '@/components/language-provider';
import { LineChart } from 'lucide-react';

export default function InsightsPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <LineChart className="w-8 h-8 text-purple-500" />
        <div>
          <h1 className="text-2xl font-bold">{t('insights.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('insights.subtitle')}
          </p>
        </div>
      </div>

      {/* Insights */}
      <InsightsRadar />
    </div>
  );
}
