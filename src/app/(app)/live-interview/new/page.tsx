
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Settings, Users, Send } from "lucide-react";
import Link from "next/link";

export default function NewLiveInterviewPage() {
  // Placeholder for form state and submission logic
  // e.g., const [title, setTitle] = useState('');
  // const [participants, setParticipants] = useState([]); // etc.

  const handleSubmit = () => {
    // Logic to create a new live interview session
    console.log("Submitting new live interview setup...");
    // router.push('/live-interview/session-id'); // Redirect to the actual interview room
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Video className="h-8 w-8" /> Start New Live Interview
        </h1>
        <Button variant="outline" asChild>
            <Link href="/interview-prep">Back to Prep Hub</Link>
        </Button>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Setup Your Interview Session</CardTitle>
          <CardDescription>
            Configure the details for your upcoming live interview. 
            This feature is under development.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Placeholder for form fields */}
          <div className="p-8 border-2 border-dashed border-muted rounded-lg text-center">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Interview setup form will be here.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              You'll be able to set a title, invite participants (interviewers/candidates),
              schedule a time, and potentially link a job description for AI-suggested questions.
            </p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="interview-title" className="font-medium">Interview Title (Example)</label>
            <input id="interview-title" placeholder="e.g., Frontend Developer - Round 1" className="w-full p-2 border rounded-md bg-background" />
          </div>

          <div className="space-y-2">
             <label htmlFor="participants" className="font-medium flex items-center gap-1"><Users className="h-4 w-4"/>Participants (Example)</label>
            <textarea id="participants" placeholder="Enter email addresses of participants, separated by commas..." rows={3} className="w-full p-2 border rounded-md bg-background" />
          </div>

        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled>
            <Send className="mr-2 h-4 w-4" /> Create & Start Session (Coming Soon)
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
