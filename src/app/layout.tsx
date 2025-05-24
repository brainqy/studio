// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
// import { Inter as FontSans } from "next/font/google"; // Removed next/font/google
import './globals.css';
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";

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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
