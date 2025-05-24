// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter as FontSans } from "next/font/google";
import './globals.css';
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: 'ResumeMatch AI',
  description: 'AI-powered resume analysis and job matching platform.',
  // manifest: '/manifest.json', // Removed to prevent CORS error due to environment redirect
  appleWebApp: { // Kept for iOS specific "add to homescreen" behavior if needed
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
  themeColor: '#008080', // Matches primary color
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  // Ensure there's no whitespace between <html>, <head />, and <body> in the JSX
  return (<html lang="en" suppressHydrationWarning>
      {/* Next.js automatically manages most head elements via metadata */}
      {/* No explicit <head /> tag here is standard for App Router */}
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        fontSans.variable
      )}>
        {children}
        <Toaster />
      </body>
    </html>);
}
