
// src/app/layout.tsx
import type {Metadata, Viewport} from 'next'; // Added Viewport
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
  manifest: '/manifest.json', // Link to the manifest file
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default', // Or 'black', 'black-translucent'
    title: 'ResumeMatch AI',
  },
  // themeColor is also useful for Android PWA app bar color
  // Match this with manifest.json theme_color
  themeColor: '#008080', 
};

// It's also good practice to define viewport settings via the viewport export
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // themeColor also can be set here for some browsers
  // themeColor: '#008080', 
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (<html lang="en" suppressHydrationWarning><head />
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>{children}<Toaster /></body>
    </html>);
}
