
"use client"; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Boundary Caught:", error);
  }, [error]);

  return (
    // The <html> and <body> tags are removed from here.
    // This component's output will be rendered within the RootLayout's <body>.
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl text-center">
        <CardHeader>
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold">Oops! Something Went Wrong</CardTitle>
          <CardDescription className="text-muted-foreground">
            We encountered an unexpected error. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {process.env.NODE_ENV === 'development' && error?.message && (
            <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-xs text-left">
              <p><strong>Error Details (Dev Mode):</strong></p>
              <pre className="whitespace-pre-wrap break-all">{error.message}</pre>
              {error.digest && <p className="mt-1">Digest: {error.digest}</p>}
            </div>
          )}
          <Button
            onClick={
              // Attempt to recover by trying to re-render the segment
              () => reset()
            }
            className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
