'use client';

import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
import { ReactNode } from 'react';

interface NextIntlProviderWrapperProps {
  messages: AbstractIntlMessages;
  locale: string;
  children: ReactNode;
}

export default function NextIntlProviderWrapper({
  messages,
  locale,
  children,
}: NextIntlProviderWrapperProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}