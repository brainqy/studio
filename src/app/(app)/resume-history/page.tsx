
// src/app/(app)/resume-history/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { History } from "lucide-react";

export default function ResumeHistoryPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <History className="h-8 w-8" /> Resume Scan History
      </h1>
      <CardDescription>
        View a detailed log of all your past resume scans and analyses.
      </CardDescription>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Scan Log</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Resume scan history will be displayed here. Feature under development.
            {/* You can reuse the ResumeScanHistoryCard component here later */}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
