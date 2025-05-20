// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter as FontSans } from "next/font/google";
import './globals.css';
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans", // Corrected variable name
})

export const metadata: Metadata = {
  title: 'ResumeMatch AI',
  description: 'AI-powered resume analysis and job matching platform.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ResumeMatch AI',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#008080',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        fontSans.variable
      )}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
