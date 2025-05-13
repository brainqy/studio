
import type {Metadata} from 'next';
import { Inter as FontSans } from "next/font/google";
import './globals.css';
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";

// import { NextIntlClientProvider } from 'next-intl'; // Example import
// import { getMessages } from 'next-intl/server'; // Example import

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: 'ResumeMatch AI',
  description: 'AI-powered resume analysis and job matching platform.',
};

export default function RootLayout({ // Add async and params if using next-intl with App Router
  children,
  // params: {locale} // Example for next-intl
}: Readonly<{
  children: React.ReactNode;
  // params: {locale: string}; // Example for next-intl
}>) {
  // const messages = await getMessages(); // Example for next-intl

  return (
    // <NextIntlClientProvider locale={locale} messages={messages}> // Example wrapper
    <html lang="en" suppressHydrationWarning> {/* TODO: lang should be dynamic based on locale */}
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        {children}
        <Toaster />
      </body>
    </html>
    // </NextIntlClientProvider> // Example wrapper
  );
}
