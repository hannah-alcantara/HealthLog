'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function StorageWarningBanner() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('storage-warning-dismissed') === 'true';
  });

  const handleDismiss = () => {
    localStorage.setItem('storage-warning-dismissed', 'true');
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-amber-900 dark:text-amber-100 text-sm mb-1">
            Data Storage Notice
          </h3>
          <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
            Your health data is stored locally in your browser. <strong>If you clear your browser data or cookies, all records will be permanently deleted.</strong> Consider taking regular backups.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDismiss}
            className="text-amber-900 dark:text-amber-100 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/40"
          >
            I Understand
          </Button>
        </div>
      </div>
    </div>
  );
}