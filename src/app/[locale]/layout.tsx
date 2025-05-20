// src/app/[locale]/layout.tsx
import type { ReactNode } from 'react';
import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n-config'; // Ensure this path is correct

interface LocaleLayoutProps {
  children: ReactNode;
  params: { locale: string };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: LocaleLayoutProps) {
  if (!locales.includes(locale as any)) {
    console.error(`[LocaleLayout] Invalid locale detected in URL params: "${locale}". Calling notFound().`);
    notFound();
  }

  let messages: AbstractIntlMessages;
  try {
    // getMessages() will internally call the getRequestConfig from src/i18n.ts
    // which now returns a hardcoded minimal object.
    const msgData = await getMessages({ locale });
    if (!msgData || typeof msgData !== 'object' || Object.keys(msgData).length === 0) {
        console.error(`[LocaleLayout] getMessages() returned invalid or empty messages for locale "${locale}". Triggering notFound.`);
        notFound();
    }
    messages = msgData;
    console.log(`[LocaleLayout] Successfully obtained messages for locale "${locale}". Provider will be rendered.`);
  } catch (error) {
    console.error(`[LocaleLayout] CRITICAL ERROR fetching messages via getMessages() for locale "${locale}":`, error);
    // This catch block might be hit if getMessages() itself throws an unrecoverable error,
    // or if src/i18n.ts throws an error that getMessages() doesn't handle before re-throwing.
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
