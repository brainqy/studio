// src/app/[locale]/layout.tsx
import type { ReactNode } from 'react';
import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
import { getMessages } from 'next-intl/server'; // This should call your src/i18n.ts
import { notFound } from 'next/navigation';
import { locales, defaultLocale } from '@/i18n-config'; // Ensure this path is correct

interface LocaleLayoutProps {
  children: ReactNode;
  params: { locale: string };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: LocaleLayoutProps) {
  console.log(`[LocaleLayout] ENTERING for locale: ${locale}`);

  if (!locales.includes(locale as any)) {
    console.error(`[LocaleLayout] Invalid locale in params: "${locale}". Calling notFound().`);
    notFound();
  }

  let messages: AbstractIntlMessages | undefined;
  let usedLocale = locale; // Track which locale's messages are actually used

  try {
    console.log(`[LocaleLayout] Attempting to fetch messages for locale: "${locale}"`);
    messages = await getMessages({ locale }); // Ensure getMessages is called correctly
    if (!messages || typeof messages !== 'object' || Object.keys(messages).length === 0) {
        console.warn(`[LocaleLayout] Messages for locale "${locale}" were invalid or empty. Will attempt fallback.`);
        throw new Error("Primary locale messages invalid or empty."); // Force into catch for fallback
    }
    console.log(`[LocaleLayout] Successfully fetched messages for locale: "${locale}".`);
  } catch (error) {
    console.error(`[LocaleLayout] Error fetching messages for primary locale "${locale}":`, (error as Error).message);
    console.warn(`[LocaleLayout] Attempting to fetch messages for default locale "${defaultLocale}" as fallback.`);
    usedLocale = defaultLocale;
    try {
      messages = await getMessages({ locale: defaultLocale });
      if (!messages || typeof messages !== 'object' || Object.keys(messages).length === 0) {
        console.error(`[LocaleLayout] CRITICAL: Fallback messages for default locale "${defaultLocale}" also invalid or empty. Providing empty object.`);
        messages = {}; // Provide empty messages to avoid crashing the provider if all else fails
      } else {
        console.log(`[LocaleLayout] Successfully fetched fallback messages for default locale "${defaultLocale}".`);
      }
    } catch (fallbackError) {
      console.error(`[LocaleLayout] CRITICAL: Error fetching messages for default locale "${defaultLocale}" as well:`, (fallbackError as Error).message);
      messages = {}; // Provide empty messages
    }
  }
  
  // Final check, should always be an object by now
  if (messages === undefined || typeof messages !== 'object') {
    console.error("[LocaleLayout] CRITICAL: Messages ended up undefined or not an object. This shouldn't happen with fallbacks. Providing empty object.");
    messages = {};
  }

  console.log(`[LocaleLayout] Rendering NextIntlClientProvider with effective locale: "${usedLocale}" and message keys:`, messages ? Object.keys(messages) : 'NONE');

  return (
    <NextIntlClientProvider locale={usedLocale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
