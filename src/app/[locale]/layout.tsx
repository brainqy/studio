// src/app/[locale]/layout.tsx
import type { ReactNode } from 'react';
import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
import { getMessages } from 'next-intl/server';
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
  console.log(`[LocaleLayout V5] Rendering for locale: ${locale}`);

  if (!locales.includes(locale as any)) {
    console.error(`[LocaleLayout V5] Invalid locale detected in params: "${locale}". Calling notFound().`);
    notFound();
  }

  let messages: AbstractIntlMessages | undefined;
  let messageSource = "unknown";

  try {
    console.log(`[LocaleLayout V5] Attempting to get messages for locale: ${locale}`);
    messages = await getMessages({ locale });
    messageSource = `getMessages("${locale}")`;

    if (!messages || typeof messages !== 'object' || Object.keys(messages).length === 0) {
      console.warn(`[LocaleLayout V5] Messages from getMessages("${locale}") were invalid or empty. Type: ${typeof messages}, Keys: ${messages ? Object.keys(messages).length : 'N/A'}. Attempting fallback to defaultLocale: ${defaultLocale}`);
      messages = await getMessages({ locale: defaultLocale });
      messageSource = `getMessages("${defaultLocale}") after fallback`;
      if (!messages || typeof messages !== 'object' || Object.keys(messages).length === 0) {
        console.error(`[LocaleLayout V5] CRITICAL: Fallback messages for default locale "${defaultLocale}" also invalid or empty. Using minimal hardcoded messages.`);
        messages = { AppHeader: { languageSwitcherLabel: `Lang (Emergency Fallback ${locale})` } };
        messageSource = "Emergency Hardcoded";
      } else {
        console.log(`[LocaleLayout V5] Successfully fetched fallback messages for default locale "${defaultLocale}".`);
      }
    } else {
      console.log(`[LocaleLayout V5] Successfully fetched messages for locale: "${locale}".`);
    }
  } catch (error) {
    console.error(`[LocaleLayout V5] CRITICAL ERROR fetching messages (source: ${messageSource}) for locale "${locale}":`, error);
    messages = { AppHeader: { languageSwitcherLabel: `Lang (Error Fallback ${locale})` } };
    messageSource = "Error Hardcoded";
    console.warn(`[LocaleLayout V5] Using minimal error fallback messages for locale "${locale}".`);
  }

  // Final check to ensure messages is an object
  if (typeof messages !== 'object' || messages === null) {
    console.error(`[LocaleLayout V5] Messages is NOT an object before passing to provider. Type: ${typeof messages}. Source: ${messageSource}. Setting to minimal object.`);
    messages = { AppHeader: { languageSwitcherLabel: `Lang (Final Type Fallback ${locale})` } };
    messageSource = "Final Type Hardcoded";
  }

  console.log(`[LocaleLayout V5] Passing to NextIntlClientProvider for locale "${locale}". Message source: "${messageSource}". Message keys: ${Object.keys(messages || {}).join(', ')}`);
  // Log a sample message if available
  if (messages && (messages as any).AppHeader) {
    console.log(`[LocaleLayout V5] Sample message AppHeader.languageSwitcherLabel: ${JSON.stringify((messages as any).AppHeader.languageSwitcherLabel)}`);
  } else {
    console.log(`[LocaleLayout V5] AppHeader namespace not found in messages for locale "${locale}".`);
  }


  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
