
'use client'; 

import type React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'; // Removed Sidebar
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import FloatingMessenger from '@/components/features/FloatingMessenger';
import { usePathname } from 'next/navigation'; 
import { useEffect } from 'react'; 
import { addRecentPage, getLabelForPath } from '@/lib/recent-pages';
import { useLocale, AbstractIntlMessages } from 'next-intl'; // Correct import
import { NextIntlClientProvider, useMessages } from 'next-intl'; // Import useMessages

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const locale = useLocale();
  const messages = useMessages(); // Use useMessages to get the messages for the current locale

  useEffect(() => {
    if (pathname) {
      // For recent pages, we might want the path without the locale prefix
      const pathForRecent = pathname.startsWith(`/${locale}`) 
        ? pathname.substring(`/${locale}`.length) || '/' 
        : pathname;
      const label = getLabelForPath(pathForRecent);
      addRecentPage(pathForRecent, label);
    }
  }, [pathname, locale]);

  // It's generally better to pass only the necessary part of messages
  // or let child components use useTranslations() directly if they are client components.
  // AppHeader and AppSidebar now correctly use useLocale and useTranslations directly.

  return (
    // We don't need NextIntlClientProvider here if src/app/[locale]/layout.tsx
    // already provides it and AppLayout is a child of that.
    // Assuming AppLayout is used within a structure already providing the context.
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">
          {children}
        </main>
        <FloatingMessenger />
      </SidebarInset>
    </SidebarProvider