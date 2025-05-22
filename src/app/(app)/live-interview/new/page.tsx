
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Settings, Users, Send, ListChecks, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
// import { sampleUserProfile } from "@/lib/sample-data"; // Currently not used for creator ID
import type { LiveInterviewSession, MockInterviewQuestion } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function NewLiveInterviewPage() {
  const [title, setTitle] = useState('');
  const [participantEmails, setParticipantEmails] = useState('');
  const [questionIds, setQuestionIds] = useState('');
  const { toast } = useToast();
  const router = useRouter(); // router is initialized but not used in current mock logic

  const handleSubmit = () => {
    if (!title.trim()) {
      toast({ title: "Title Required", description: "Please enter an interview title.", variant: "destructive" });
      return;
    }
    const emails = participantEmails.split(',').map(e => e.trim()).filter(e => e);
    if (emails.length === 0) {
      toast({ title: "Participants Required", description: "Please add at least one participant email.", variant: "destructive" });
      return;
    }

    const newSessionId = `live-session-${Date.now()}`;
    // In a real app, you would get the current user's ID from an authentication context.
    // const currentUserId = sampleUserProfile.id; // Example, if sampleUserProfile was imported and used

    const newSession: Partial<LiveInterviewSession> = {
      id: newSessionId,
      // tenantId: currentUserId ? sampleUserProfile.tenantId : 'default-tenant', // Example
      title: title,
      participants: [
        // Example: { userId: currentUserId, name: "Your Name (Interviewer)", role: 'interviewer', profilePictureUrl: sampleUserProfile.profilePictureUrl },
        ...emails.map((email, index) => ({
            userId: `participant-temp-${index}-${Date.now()}`,
            name: email.split('@')[0],
            role: 'candidate',
            profilePictureUrl: `https://avatar.vercel.sh/${email}.png`
        }))
      ],
      scheduledTime: new Date().toISOString(),
      status: 'Scheduled',
      preSelectedQuestions: questionIds.split(',').map(id => id.trim()).filter(id => id)
                          .map(id => ({ id: id, questionText: `(Placeholder) Question ID: ${id}`, category: 'Common', difficulty: 'Medium' } as MockInterviewQuestion)),
    };

    // This is where you would typically make an API call to your backend to save the new session.
    // For demonstration, we're just showing a toast.
    // e.g., await createLiveInterviewSessionOnBackend(newSession);
    // If manipulating sampleData directly (not recommended for components):
    // import { sampleLiveInterviewSessions } from "@/lib/sample-data";
    // sampleLiveInterviewSessions.push(newSession as LiveInterviewSession);

    toast({
      title: "Live Interview Session Setup (Mock)",
      description: `Session "${title}" would be created. Participants: ${emails.join(', ')}. Questions (IDs): ${questionIds || 'None'}. Backend integration needed.`,
      duration: 8000,
    });
    // router.push(`/live-interview/${newSessionId}`); // Enable when live interview page is fully functional
  }; // This brace correctly closes handleSubmit

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
            Define the details for your upcoming live interview. Pre-select questions from the Question Bank if desired.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-700">
            <Settings className="h-4 w-4 !text-blue-700"/>
            <AlertTitle>Full Feature Under Development</AlertTitle>
            <AlertDescription>
              This page is for conceptual setup. Actual session creation and real-time features require backend integration. For a functional experience, explore AI Mock Interviews or pre-configured sessions.
            </AlertDescription>
          </Alert>
          <div>
            <Label htmlFor="interview-title">Interview Title / Purpose</Label>
            <Input 
              id="interview-title" 
              placeholder="e.g., Frontend Developer - Round 1" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
             <Label htmlFor="participants">Participant Emails (comma-separated)</Label>
            <Textarea 
              id="participants" 
              placeholder="e.g., candidate@example.com, colleague@example.com" 
              rows={2} 
              value={participantEmails}
              onChange={(e) => setParticipantEmails(e.target.value)}
            />
          </div>
           <div>
             <Label htmlFor="question-ids" className="flex items-center gap-1">
                <ListChecks className="h-4 w-4"/> Question IDs (comma-separated, from Question Bank)
             </Label>
            <Textarea 
              id="question-ids" 
              placeholder="e.g., iq1, mcq2 (Copy IDs from Interview Prep Hub > Question Bank)" 
              rows={3} 
              value={questionIds}
              onChange={(e) => setQuestionIds(e.target.value)}
            />
             <p className="text-xs text-muted-foreground mt-1">Visit the <Link href="/interview-prep#question-bank" className="text-primary hover:underline">Question Bank</Link> in the Interview Prep Hub to find question IDs.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Send className="mr-2 h-4 w-4" /> Create Session (Mock)
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
