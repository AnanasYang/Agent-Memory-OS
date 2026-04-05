/**
 * Loading Components
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function Loading({ message = '加载中...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <p className="mt-4 text-gray-500 text-sm">{message}</p>
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-20 bg-gray-100 rounded-lg animate-pulse"
        />
      ))}
    </div>
  );
}
