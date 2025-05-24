// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter as FontSans } from "next/font/google";
import './globals.css';
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans", // Ensure this matches the variable name used in globals.css
})

export const metadata: Metadata = {
  title: 'ResumeMatch AI',
  description: 'AI-powered resume analysis and job matching platform.',
  // The 'manifest' property has been removed to prevent fetching /manifest.json
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
  return (
    <html lang="en" suppressHydrationWarning>
      {/* No explicit <head /> tag. Next.js will populate it based on metadata. */}
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
