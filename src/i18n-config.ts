// src/i18n-config.ts
export const locales = ["en", "es", "hi", "mr"] as const;
export type Locale = typeof locales[number];

export const i18nConfig = {
  defaultLocale: locales[0],
  locales,
  prefixDefault: true,
};