
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function AiMentorshipRemovedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-6">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold text-foreground">Feature Not Available</CardTitle>
          <CardDescription className="text-muted-foreground">
            The AI Mentorship Matching feature has been temporarily removed or is under reconstruction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            We are working on improving our platform. Please check back later or explore other features.
          </p>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/alumni-connect">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Alumni Directory
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
