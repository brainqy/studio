// src/i18n.ts
import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {locales} from './i18n-config';

// This is an ULTRA-MINIMAL DIAGNOSTIC version.
export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  // Minimal hardcoded messages
  let messages;
  if (locale === 'en') {
    messages = {AppHeader: {languageSwitcherLabel: "Language (EN Test)"}, Dashboard: {title: "Dashboard (EN Test)"}, ProfilePage: {title: "Profile (EN Test)"}, FeatureRequestsPage: {title: "Feature Requests (EN Test)"} };
  } else if (locale === 'hi') {
    messages = {AppHeader: {languageSwitcherLabel: "भाषा (HI Test)"}, Dashboard: {title: "डैशबोर्ड (HI Test)"}, ProfilePage: {title: "प्रोफ़ाइल (HI Test)"}, FeatureRequestsPage: {title: "सुविधा अनुरोध (HI Test)"} };
  } else if (locale === 'mr') {
    messages = {AppHeader: {languageSwitcherLabel: "भाषा (MR Test)"}, Dashboard: {title: "डॅशबोर्ड (MR Test)"}, ProfilePage: {title: "प्रोफाइल (MR Test)"}, FeatureRequestsPage: {title: "वैशिष्ट्य विनंत्या (MR Test)"} };
  } else {
    // Fallback to English if somehow an unsupported locale gets here, though middleware should prevent this.
    messages = {AppHeader: {languageSwitcherLabel: "Language (Fallback Test)"}, Dashboard: {title: "Dashboard (Fallback Test)"}, ProfilePage: {title: "Profile (Fallback Test)"}, FeatureRequestsPage: {title: "Feature Requests (Fallback Test)"}};
  }

  if (!messages) {
    console.error(`[i18n - ULTRA-MINIMAL] No messages resolved for locale: ${locale}`);
    notFound();
  }
  
  console.log(`[i18n - ULTRA-MINIMAL] Providing messages for locale: ${locale}`, messages);
  return { messages };
});