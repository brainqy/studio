// src/app/[locale]/layout.tsx
import type { ReactNode } from 'react';
import { AbstractIntlMessages, NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { i18nConfig } from '@/i18n-config'; // Ensure this path is correct
import { defaultLocale } from '@/types';
import TestTranslations from '@/components/TestTranslations';

interface LocaleLayoutProps {
  children: ReactNode;
  // Add any other props from the root layout if needed
  params: { locale: string };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: LocaleLayoutProps) {
  console.log(`[LocaleLayout V5] Rendering for locale: ${locale}`);

  if (!i18nConfig.locales.includes(locale as any)) {
    console.error(`[LocaleLayout V5] Invalid locale detected in params: "${locale}". Calling notFound().`);
    notFound();
  }

  let messages: AbstractIntlMessages | undefined;
  let messageSource = "unknown";

  try {
    console.log(`[LocaleLayout V5] Attempting to get messages for locale: ${locale}`);
    const { getMessages } = await import('next-intl/server');
    messageSource = `getMessages("${locale}")`;

    if (!messages || typeof messages !== 'object' || Object.keys(messages).length === 0) {
      console.warn(`[LocaleLayout V5] Messages from getMessages("${locale}") were invalid or empty. Type: ${typeof messages}, Keys: ${messages ? Object.keys(messages).length : 'N/A'}. Attempting fallback to defaultLocale: ${defaultLocale}`);
      messages = await getMessages({ locale: i18nConfig.defaultLocale });
      messageSource = `getMessages("${i18nConfig.defaultLocale}") after fallback`;
      if (!messages || typeof messages !== 'object' || Object.keys(messages).length === 0) {
        console.error(`[LocaleLayout V5] CRITICAL: Fallback messages for default locale "${i18nConfig.defaultLocale}" also invalid or empty. Using minimal hardcoded messages.`);
        messages = { AppHeader: { languageSwitcherLabel: `Lang (Emergency Fallback ${locale})` } };
        messageSource = "Emergency Hardcoded";
      } else {
        console.log(`[LocaleLayout V5] Successfully fetched fallback messages for default locale "${i18nConfig.defaultLocale}".`);
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


  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
 <TestTranslations />
    </NextIntlClientProvider>
  );
}

