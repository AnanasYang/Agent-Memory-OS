'use client';

import { MemoryGalaxy } from '@/components/memory-galaxy';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMemoryStore } from '@/lib/store';
import { useLanguage } from '@/components/language-provider';
import { Brain, Filter } from 'lucide-react';

export default function MemoryPage() {
  const { filterLevel, setFilterLevel, filterCategory, setFilterCategory, memories } = useMemoryStore();
  const { t } = useLanguage();

  const categories = Array.from(new Set(memories.map(m => m.category)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-memory-l4" />
          <div>
            <h1 className="text-2xl font-bold">{t('memory.title')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('memory.subtitle')}
            </p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filterLevel} onValueChange={(v) => setFilterLevel(v as any)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder={t('memory.filterLevel')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('memory.allLevels')}</SelectItem>
              <SelectItem value="L4">{t('memory.l4Core')}</SelectItem>
              <SelectItem value="L3">{t('memory.l3Semantic')}</SelectItem>
              <SelectItem value="L2">{t('memory.l2Procedural')}</SelectItem>
              <SelectItem value="L1">{t('memory.l1Episodic')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder={t('memory.filterCategory')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('memory.allCategories')}</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Galaxy Visualization */}
      <div className="bg-card border rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
        <MemoryGalaxy />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-memory-l4 shadow-lg shadow-memory-l4/50" />
          <span>L4 - {t('memory.l4Desc')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-memory-l3" />
          <span>L3 - {t('memory.l3Desc')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-memory-l2" />
          <span>L2 - {t('memory.l2Desc')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-memory-l1" />
          <span>L1 - {t('memory.l1Desc')}</span>
        </div>
      </div>
    </div>
  );
}
