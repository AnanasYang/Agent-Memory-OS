'use client';

import { motion } from 'framer-motion';
import { IntentNode } from '@/lib/types';
import { useMemoryStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { 
  Target, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  Circle, 
  ArrowRight,
  Calendar,
  Tag
} from 'lucide-react';

interface IntentOrbitProps {
  className?: string;
  compact?: boolean;
}

const typeConfig = {
  'short-term': {
    label: 'Short-term',
    color: 'text-intent-short',
    bgColor: 'bg-intent-short/10',
    borderColor: 'border-intent-short/30',
    orbitRadius: 120,
    duration: 20,
  },
  'mid-term': {
    label: 'Mid-term',
    color: 'text-intent-mid',
    bgColor: 'bg-intent-mid/10',
    borderColor: 'border-intent-mid/30',
    orbitRadius: 200,
    duration: 35,
  },
  'long-term': {
    label: 'Long-term',
    color: 'text-intent-long',
    bgColor: 'bg-intent-long/10',
    borderColor: 'border-intent-long/30',
    orbitRadius: 280,
    duration: 50,
  },
};

export function IntentOrbit({ className, compact = false }: IntentOrbitProps) {
  const { intents, selectedIntentId, setSelectedIntent, getIntentById } = useMemoryStore();
  const selectedIntent = selectedIntentId ? getIntentById(selectedIntentId) : null;

  const intentsByType = {
    'short-term': intents.filter(i => i.type === 'short-term'),
    'mid-term': intents.filter(i => i.type === 'mid-term'),
    'long-term': intents.filter(i => i.type === 'long-term'),
  };

  const activeIntent = intents.reduce((prev, current) => {
    if (current.progress >= 1) return prev;
    if (!prev) return current;
    return current.priority === 'high' && prev.priority !== 'high' ? current :
           current.progress > prev.progress ? current : prev;
  }, null as IntentNode | null);

  if (compact) {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Active Intent Card */}
        {activeIntent && (
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                typeConfig[activeIntent.type].bgColor
              )}>
                <Target className={cn("w-5 h-5", typeConfig[activeIntent.type].color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{activeIntent.title}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className={cn("px-1.5 py-0.5 rounded", typeConfig[activeIntent.type].bgColor, typeConfig[activeIntent.type].color)}>
                    {typeConfig[activeIntent.type].label}
                  </span>
                  <span>{(activeIntent.progress * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          {(['short-term', 'mid-term', 'long-term'] as const).map(type => (
            <div 
              key={type} 
              className={cn(
                "text-center p-2 rounded-lg border",
                typeConfig[type].borderColor,
                typeConfig[type].bgColor
              )}
            >
              <p className={cn("text-lg font-bold", typeConfig[type].color)}>
                {intentsByType[type].length}
              </p>
              <p className="text-xs text-muted-foreground">
                {typeConfig[type].label}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Orbit Visualization */}
      <div className="relative flex items-center justify-center" style={{ height: 650 }}>
        {/* Central Hub - Active Intent */}
        <motion.div 
          className="absolute z-20 flex flex-col items-center"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center shadow-lg shadow-primary/30">
            <div className="text-center p-4">
              <Target className="w-6 h-6 mx-auto mb-1 text-primary-foreground" />
              <p className="text-xs font-medium text-primary-foreground/80">Active</p>
            </div>
          </div>
          {activeIntent && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -bottom-16 w-48 text-center"
            >
              <p className="font-medium text-sm truncate">{activeIntent.title}</p>
              <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                <div 
                  className="bg-primary rounded-full h-1.5 transition-all"
                  style={{ width: `${activeIntent.progress * 100}%` }}
                />
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Orbital Rings */}
        {(['long-term', 'mid-term', 'short-term'] as const).map((type, index) => {
          const config = typeConfig[type];
          const typeIntents = intentsByType[type];
          
          return (
            <div key={type}>
              {/* Orbit Ring */}
              <div 
                className={cn(
                  "absolute rounded-full border-2 border-dashed",
                  config.borderColor
                )}
                style={{
                  width: config.orbitRadius * 2,
                  height: config.orbitRadius * 2,
                }}
              />
              
              {/* Orbiting Satellites */}
              {typeIntents.map((intent, i) => {
                const angle = (i / Math.max(typeIntents.length, 1)) * 360;
                const isSelected = selectedIntentId === intent.id;
                
                return (
                  <motion.div
                    key={intent.id}
                    className={cn(
                      "absolute cursor-pointer transition-all",
                      isSelected && "z-10"
                    )}
                    style={{
                      '--orbit-radius': `${config.orbitRadius}px`,
                      '--orbit-duration': `${config.duration}s`,
                    } as React.CSSProperties}
                    animate={{ 
                      rotate: 360,
                    }}
                    transition={{
                      duration: config.duration,
                      repeat: Infinity,
                      ease: "linear",
                      delay: i * (config.duration / typeIntents.length),
                    }}
                    onClick={() => setSelectedIntent(intent.id)}
                  >
                    <div 
                      className={cn(
                        "relative -translate-x-1/2 -translate-y-1/2",
                        isSelected && "scale-125"
                      )}
                      style={{
                        transform: `translateX(${config.orbitRadius}px)`,
                      }}
                    >
                      <motion.div 
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center border-2",
                          config.bgColor,
                          config.borderColor,
                          isSelected && "ring-2 ring-offset-2 ring-offset-background",
                          isSelected && config.color.replace('text-', 'ring-')
                        )}
                        style={{
                          boxShadow: intent.progress >= 1 
                            ? `0 0 20px ${type === 'short-term' ? '#34d399' : type === 'mid-term' ? '#60a5fa' : '#f87171'}`
                            : undefined
                        }}
                        animate={{ rotate: -360 }}
                        transition={{
                          duration: config.duration,
                          repeat: Infinity,
                          ease: "linear",
                          delay: i * (config.duration / typeIntents.length),
                        }}
                      >
                        {intent.progress >= 1 ? (
                          <CheckCircle2 className={cn("w-5 h-5", config.color)} />
                        ) : (
                          <Circle className={cn("w-5 h-5", config.color)} />
                        )}
                      </motion.div>
                      
                      {/* Progress indicator */}
                      <svg 
                        className="absolute inset-0 w-10 h-10 -rotate-90"
                        viewBox="0 0 40 40"
                      >
                        <circle
                          cx="20"
                          cy="20"
                          r="18"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeDasharray={`${intent.progress * 113} 113`}
                          className={cn("opacity-50", config.color)}
                        />
                      </svg>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Intent List */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['short-term', 'mid-term', 'long-term'] as const).map(type => (
          <div key={type} className="space-y-3">
            <h3 className={cn("font-semibold flex items-center gap-2", typeConfig[type].color)}>
              <Clock className="w-4 h-4" />
              {typeConfig[type].label}
            </h3>
            <div className="space-y-2">
              {intentsByType[type].map(intent => (
                <motion.div
                  key={intent.id}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all",
                    selectedIntentId === intent.id 
                      ? cn(typeConfig[type].borderColor, typeConfig[type].bgColor)
                      : "border-muted hover:border-muted-foreground/30"
                  )}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedIntent(intent.id)}
                >
                  <div className="flex items-start gap-2">
                    {intent.progress >= 1 ? (
                      <CheckCircle2 className={cn("w-4 h-4 mt-0.5", typeConfig[type].color)} />
                    ) : (
                      <Circle className={cn("w-4 h-4 mt-0.5", typeConfig[type].color)} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium truncate",
                        intent.progress >= 1 && "line-through opacity-60"
                      )}>
                        {intent.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-muted rounded-full h-1">
                          <div 
                            className={cn(
                              "rounded-full h-1 transition-all",
                              typeConfig[type].color.replace('text-', 'bg-')
                            )}
                            style={{ width: `${intent.progress * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {(intent.progress * 100).toFixed(0)}%
                        </span>
                      </div>
                      {intent.deadline && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(intent.deadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Intent Detail */}
      {selectedIntent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "mt-6 p-6 rounded-lg border",
            typeConfig[selectedIntent.type].bgColor,
            typeConfig[selectedIntent.type].borderColor
          )}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={cn(
                  "px-2 py-0.5 rounded text-xs font-medium",
                  "bg-background",
                  typeConfig[selectedIntent.type].color
                )}>
                  {typeConfig[selectedIntent.type].label}
                </span>
                {selectedIntent.priority && (
                  <span className={cn(
                    "px-2 py-0.5 rounded text-xs font-medium",
                    selectedIntent.priority === 'high' ? "bg-red-500/20 text-red-500" :
                    selectedIntent.priority === 'medium' ? "bg-yellow-500/20 text-yellow-500" :
                    "bg-green-500/20 text-green-500"
                  )}>
                    {selectedIntent.priority}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold">{selectedIntent.title}</h3>
              {selectedIntent.description && (
                <p className="text-muted-foreground mt-1">{selectedIntent.description}</p>
              )}
            </div>
            <button 
              onClick={() => setSelectedIntent(null)}
              className="p-1 hover:bg-background rounded"
            >
              ×
            </button>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Progress</span>
              <span className="font-medium">{(selectedIntent.progress * 100).toFixed(0)}%</span>
            </div>
            <div className="bg-background rounded-full h-2">
              <div 
                className={cn(
                  "rounded-full h-2 transition-all",
                  typeConfig[selectedIntent.type].color.replace('text-', 'bg-')
                )}
                style={{ width: `${selectedIntent.progress * 100}%` }}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {selectedIntent.tags?.map(tag => (
              <span 
                key={tag} 
                className="text-xs px-2 py-1 bg-background rounded-full flex items-center gap-1"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>

          {selectedIntent.dependencies.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2">Dependencies</p>
              <div className="flex flex-wrap gap-2">
                {selectedIntent.dependencies.map(depId => {
                  const dep = getIntentById(depId);
                  return dep ? (
                    <span 
                      key={depId}
                      className="text-xs px-2 py-1 bg-background rounded flex items-center gap-1"
                    >
                      <ArrowRight className="w-3 h-3" />
                      {dep.title}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
