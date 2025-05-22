
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Settings, Users, Send, ListChecks } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { sampleLiveInterviewSessions } from "@/lib/sample-data"; // For adding new session
import { sampleUserProfile } from "@/lib/sample-data"; // For creator ID

export default function NewLiveInterviewPage() {
  const [title, setTitle] = useState('');
  const [participantEmails, setParticipantEmails] = useState(''); // Comma-separated
  const [questionIds, setQuestionIds] = useState(''); // Comma-separated IDs from question bank
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = () => {
    if (!title.trim()) {
      toast({ title: "Title Required", description: "Please enter an interview title.", variant: "destructive" });
      return;
    }
    // Basic email validation (simple check)
    const emails = participantEmails.split(',').map(e => e.trim()).filter(e => e);
    if (emails.length === 0) {
      toast({ title: "Participants Required", description: "Please add at least one participant email.", variant: "destructive" });
      return;
    }

    // Mock session creation
    const newSessionId = `live-session-${Date.now()}`;
    const newSession = {
      id: newSessionId,
      tenantId: sampleUserProfile.tenantId || 'default-tenant',
      title: title,
      participants: [
        // Add current user as interviewer (or derive based on role)
        { userId: sampleUserProfile.id, name: sampleUserProfile.name, role: 'interviewer', profilePictureUrl: sampleUserProfile.profilePictureUrl },
        ...emails.map((email, index) => ({ 
            userId: `participant-${index}-${Date.now()}`, // Mock ID
            name: email.split('@')[0], // Mock name
            role: 'candidate', // Default to candidate
            profilePictureUrl: `https://avatar.vercel.sh/${email}.png`
        }))
      ],
      scheduledTime: new Date().toISOString(), // Schedule for now
      status: 'Scheduled',
      // Mocking preSelectedQuestions - in a real app, you'd fetch question details by ID
      preSelectedQuestions: questionIds.split(',').map(id => ({ id: id.trim(), questionText: `Question ID: ${id.trim()}` })),
    };
    
    // Add to sample data for demo purposes (in a real app, this would be an API call)
    sampleLiveInterviewSessions.push(newSession as any); 

    toast({ title: "Interview Session Created (Mock)", description: `Session "${title}" scheduled. Redirecting...` });
    router.push(`/live-interview/${newSessionId}`);
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
            Configure details for your live interview. You can select questions from the Question Bank on the Interview Prep Hub page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="interview-title">Interview Title / Purpose</Label>
            <Input 
              id="interview-title" 
              placeholder="e.g., Frontend Developer - Round 1 with Candidate X" 
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
                <ListChecks className="h-4 w-4"/> Question IDs (from Question Bank, comma-separated)
             </Label>
            <Textarea 
              id="question-ids" 
              placeholder="e.g., iq1, mcq2, coding1 (Copy IDs from the Question Bank page)" 
              rows={3} 
              value={questionIds}
              onChange={(e) => setQuestionIds(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Tip: Open the <Link href="/interview-prep#question-bank" target="_blank" className="underline text-primary">Question Bank</Link> in a new tab to find and copy question IDs.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Send className="mr-2 h-4 w-4" /> Create & Start Session (Mock)
          </Button>
        </