
"use client";

import { Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link'; // For linking back to home if needed later

export default function MaintenancePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4 text-center">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader>
          <Wrench className="h-16 w-16 text-primary mx-auto mb-6" />
          <CardTitle className="text-3xl font-bold text-foreground">
            Under Maintenance
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            We&rsquo;re currently performing scheduled maintenance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-md text-foreground mb-2">
            We expect to be back online shortly. Thank you for your patience!
          </p>
          <p className="text-sm text-muted-foreground">
            For urgent inquiries, please contact support at [Your Support Email/Link].
          </p>
          {/* 
          Optionally, you can add a link back to the homepage, 
          but during true maintenance, this might also be inaccessible.
          <div className="mt-6">
            <Link href="/" className="text-primary hover:underline">
              Go to Homepage
            </Link>
          </div>
          */}
        </CardContent>
      </Card>
      <footer className="mt-8 text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} ResumeMatch AI. All rights reserved.
      </footer>
    </div>
  );
}
