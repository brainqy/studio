
// src/app/layout.tsx
import type {Metadata} from 'next';
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Ensure there's no whitespace between <html>, <head />, and <body> in the JSX
  return (<html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>{children}<Toaster /></body>
    </html>);
}

