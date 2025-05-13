
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Calendar, Users, ShieldAlert, Type, Languages, MessageSquare, CheckCircle, XCircle, Mic } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { sampleUserProfile, samplePracticeSessions } from "@/lib/sample-data";
import type { PracticeSession } from "@/types";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

type InterviewType = "friends" | "experts" | "ai";

export default function InterviewPracticeHubPage() {
  const [isInterviewTypeDialogOpen, setIsInterviewTypeDialogOpen] = useState(false);
  const [selectedInterviewType, setSelectedInterviewType] = useState<InterviewType | null>(null);
  const [practiceSessions, setPracticeSessions] = useState<PracticeSession[]>(samplePracticeSessions);
  const router = useRouter();
  const { toast } = useToast();
  const currentUser = sampleUserProfile;

  const handleStartPractice = () => {
    setIsInterviewTypeDialogOpen(true);
  };

  const handleInterviewTypeSelect = (type: InterviewType) => {
    setSelectedInterviewType(type);
  };

  const handleProceedWithInterviewType = () => {
    setIsInterviewTypeDialogOpen(false);
    if (selectedInterviewType === "ai") {
      router.push("/ai-mock-interview");
    } else if (selectedInterviewType === "friends") {
      toast({ title: "Practice with Friends", description: "This feature is coming soon! You'll be able to invite friends for mock interviews." });
    } else if (selectedInterviewType === "experts") {
      toast({ title: "Practice with Experts", description: "Connect with industry experts for mock interviews (Coming Soon!)." });
    }
    setSelectedInterviewType(null); // Reset selection
  };

  const handleCancelPracticeSession = (sessionId: string) => {
    setPracticeSessions(prev =>
      prev.map(session =>
        session.id === sessionId ? { ...session, status: 'CANCELLED' } : session
      )
    );
    toast({ title: "Session Cancelled", description: "The practice session has been cancelled.", variant: "destructive" });
  };
  
  const handleRescheduleSession = (sessionId: string) => {
     toast({ title: "Reschedule Mocked", description: "Rescheduling functionality for this session is not yet implemented." });
  };


  const upcomingSessions = practiceSessions.filter(s => s.status === 'SCHEDULED' && isFuture(parseISO(s.date)));
  const allUserSessions = practiceSessions; // In real app, filter by user
  const cancelledSessions = practiceSessions.filter(s => s.status === 'CANCELLED');

  const renderSessionCard = (session: PracticeSession) => (
    <Card key={session.id} className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{format(parseISO(session.date), "MMM dd, yyyy")}</CardTitle>
          <span className={cn(
            "px-2 py-1 text-xs font-semibold rounded-full",
            session.status === 'SCHEDULED' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {session.status}
          </span>
        </div>
        <CardDescription className="text-sm">{session.category}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1 text-xs text-muted-foreground">
        <p className="flex items-center gap-1"><Type className="h-3.5 w-3.5"/>Type: {session.type}</p>
        <p className="flex items-center gap-1"><Languages className="h-3.5 w-3.5"/>Language: {session.language}</p>
      </CardContent>
      <CardFooter className="flex gap-2">
        {session.status === 'SCHEDULED' && (
          <>
            <Button variant="destructive" size="sm" onClick={() => handleCancelPracticeSession(session.id)}>
              <XCircle className="mr-1 h-4 w-4"/>Cancel
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleRescheduleSession(session.id)}>
              <Calendar className="mr-1 h-4 w-4"/>Reschedule
            </Button>
          </>
        )}
        {session.status === 'CANCELLED' && (
           <p className="text-xs text-red-500">This session was cancelled.</p>
        )}
      </CardFooter>
    </Card>
  );

  return (
    <div className="space-y-8">
      <Card className="bg-secondary/30 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Home / Practice</p>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">PRACTICE MAKES PERFECT</h1>
            </div>
            <Button size="lg" onClick={handleStartPractice} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Mic className="mr-2 h-5 w-5" /> Start a Practice session
            </Button>
          </div>
          <div className="mt-4">
            <p className="text-sm text-foreground">Credits left: <span className="font-semibold text-primary">{currentUser.interviewCredits || 2} interviews</span></p>
            <Button variant="link" className="p-0 h-auto text-primary text-sm">GET MORE FOR FREE</Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming Interviews</TabsTrigger>
          <TabsTrigger value="all">All Interviews</TabsTrigger>
          <TabsTrigger value="cancelled">Canceled Interviews</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">UPCOMING PRACTICE INTERVIEWS</h2>
          {upcomingSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingSessions.map(renderSessionCard)}
            </div>
          ) : (
            <Card className="text-center py-10">
              <CardContent>
                 <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3"/>
                <p className="text-muted-foreground">No upcoming practice sessions scheduled.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="all" className="mt-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">ALL PRACTICE INTERVIEWS</h2>
          {allUserSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allUserSessions.map(renderSessionCard)}
            </div>
          ) : (
             <Card className="text-center py-10">
                <CardContent>
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3"/>
                    <p className="text-muted-foreground">No practice sessions found.</p>
                </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="cancelled" className="mt-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">CANCELLED INTERVIEWS</h2>
          {cancelledSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cancelledSessions.map(renderSessionCard)}
            </div>
          ) : (
            <Card className="text-center py-10">
                <CardContent>
                    <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto mb-3"/>
                    <p className="text-muted-foreground">No cancelled interviews found.</p>
                </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isInterviewTypeDialogOpen} onOpenChange={setIsInterviewTypeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Interview Type</DialogTitle>
            <DialogDescription>Select interview type here...</DialogDescription>
          </DialogHeader>
          <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['friends', 'experts', 'ai'] as InterviewType[]).map(type => (
              <Button
                key={type}
                variant={selectedInterviewType === type ? "default" : "outline"}
                onClick={() => handleInterviewTypeSelect(type)}
                className="h-20 text-sm flex flex-col items-center justify-center"
              >
                {type === 'friends' && <Users className="mb-1 h-5 w-5"/>}
                {type === 'experts' && <Brain className="mb-1 h-5 w-5"/>}
                {type === 'ai' && <Mic className="mb-1 h-5 w-5"/>}
                Practice with {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button onClick={handleProceedWithInterviewType} disabled={!selectedInterviewType} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Next
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
