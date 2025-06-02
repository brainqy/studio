// src/components/TestTranslations.tsx
"use client";

import { useTranslations } from 'next-intl';
import React from 'react';

const TestTranslations: React.FC = () => {
  console.log('[TestTranslations] Rendering');

  const t = useTranslations('Test'); // Assuming a 'Test' namespace in your messages

  return (
    <div>
      <p>{t('greeting')}</p>
    </div>
  );
};

export default TestTranslations;