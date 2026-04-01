'use client';

import { IntentOrbit } from '@/components/intent-orbit';
import { useLanguage } from '@/components/language-provider';
import { Target, Sparkles } from 'lucide-react';

export default function IntentPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Target className="w-8 h-8 text-intent-mid" />
        <div>
          <h1 className="text-2xl font-bold">{t('intent.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('intent.subtitle')}
          </p>
        </div>
      </div>

      {/* Intent Visualization */}
      <div className="bg-card border rounded-lg p-6">
        <IntentOrbit />
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-intent-mid/10 to-intent-short/10 border rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-intent-mid mt-0.5" />
          <div>
            <h3 className="font-medium">{t('intent.tips')}</h3>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>• {t('intent.tip1')}</li>
              <li>• {t('intent.tip2')}</li>
              <li>• {t('intent.tip3')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
