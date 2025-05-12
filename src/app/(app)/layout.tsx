'use client'; 

import type React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import FloatingMessenger from '@/components/features/FloatingMessenger';
import { usePathname } from 'next/navigation'; 
import { useEffect } from 'react'; 
import { addRecentPage, getLabelForPath } from '@/lib/recent-pages'; 

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      const label = getLabelForPath(pathname);
      // Add current page to recent pages AFTER navigation to it.
      // The addRecentPage function itself handles moving existing items to top
      // and also checks not to add auth pages or landing page.
      addRecentPage(pathname, label);
    }
  }, [pathname]); // Rerun effect when pathname changes

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">
          {children}
        </main>
        <FloatingMessenger />
      </SidebarInset>
    </SidebarProvider>
  );
}
