'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SymptomsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="container mx-auto py-8 px-4">
      <p className="text-center text-gray-600 dark:text-gray-400">Redirecting to dashboard...</p>
    </div>
  );
}
