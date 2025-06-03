// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { I18nProvider } from '@/app/contexts/i18n-provider'; // Corrected path for consistency (though this file does not exist in current context, keeping as example if user adds it) // Corrected import path
// const fontSans = FontSans({ // Removed next/font/google
//   subsets: ["latin"],
//   variable: "--font-sans",
// })

export const metadata: Metadata = {
  title: 'ResumeMatch AI',
  description: 'AI-powered resume analysis and job matching platform.',
  // manifest: '/manifest.json', // Keep manifest commented out or removed if still causing issues
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default', // Or 'black-translucent'
    title: 'ResumeMatch AI',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#008080', // Matches primary color
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Manually link to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased"
        // fontSans.variable // Removed as fontSans is no longer used
      )}>
        
          {/* I18nProvider is typically used in [locale]/layout.tsx now */}
          {/* If you intend to use it here, ensure messages are passed correctly or it's configured for a default locale */}
          <I18nProvider>
            {children}
            <Toaster />
          </I18nProvider>
        
      </body>
    </html>
  );
}
