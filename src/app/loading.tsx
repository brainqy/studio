// src/app/loading.tsx
"use client"; // Though often not strictly necessary for simple UI, good practice for loading states.

import { Loader2 } from 'lucide-react';

export default function Loading() {
  // This UI will be displayed by Next.js when a page segment is loading.
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </div>
  );
}
