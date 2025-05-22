
"use client";

import type React from 'react';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, Video, ScreenShare, PhoneOff, Send, Bot, ListChecks, Loader2, AlertTriangle, ThumbsUp, ChevronDown, Square, Play, Download as DownloadIcon } from 'lucide-react';
import { generateLiveInterviewQuestions, type GenerateLiveInterviewQuestionsInput, type GenerateLiveInterviewQuestionsOutput } from '@/ai/flows/generate-live-interview-questions';
import { sampleUserProfile, sampleLiveInterviewSessions } from '@/lib/sample-data';
import type { LiveInterviewSession, LiveInterviewParticipant, RecordingReference } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function LiveInterviewPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const sessionId = params.sessionId as string;

  const [sessionDetails, setSessionDetails] = useState<LiveInterviewSession | null | undefined>(undefined);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ user: string, text: string, id: string }[]>([]);
  const [chatInput, setChatInput] = useState('');

  const [aiContextJobTitle, setAiContextJobTitle] = useState('');
  const [aiContextTopics, setAiContextTopics] = useState('');
  const [suggestedQuestions, setSuggestedQuestions] = useState<GenerateLiveInterviewQuestionsOutput['suggestedQuestions']>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [browserSupportsRecording, setBrowserSupportsRecording] = useState(true);
  const [localRecordingReferences, setLocalRecordingReferences] = useState<RecordingReference[]>([]);


  const currentUser = sampleUserProfile;

  const isInterviewer = useMemo(() => {
    if (!sessionDetails) return false;
    const participant = sessionDetails.participants.find(p => p.userId === currentUser.id);
    return participant?.role === 'interviewer';
  }, [sessionDetails, currentUser.id]);

  useEffect(() => {
    setIsLoadingSession(true);
    if (sessionId) {
      const foundSession = sampleLiveInterviewSessions.find(s => s.id === sessionId);
      if (foundSession) {
        setSessionDetails(foundSession);
        setAiContextJobTitle(foundSession.jobRoleId || foundSession.title || '');
        setAiContextTopics((foundSession.interviewTopics || []).join(', '));
        setLocalRecordingReferences(foundSession.recordingReferences || []);
      } else {
        setSessionDetails(null);
        toast({
          title: "Session Not Found",
          description: `Could not find an interview session with ID: ${sessionId}`,
          variant: "destructive",
        });
      }
    }
    setIsLoadingSession(false);
  }, [sessionId, toast]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !navigator.mediaDevices?.getUserMedia) {
      setBrowserSupportsRecording(false);
      toast({
        title: "Recording Not Supported",
        description: "Your browser does not support audio/video recording.",
        variant: "destructive",
        duration: 7000,
      });
    }
  }, [toast]);

  const handleToggleMic = () => setIsMicMuted(!isMicMuted);
  const handleToggleVideo = () => setIsVideoOff(!isVideoOff);
  const handleToggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    toast({ title: isScreenSharing ? "Screen Sharing Stopped (Mock)" : "Screen Sharing Started (Mock)", duration: 2000 });
  };
  const handleEndCall = () => {
    if (isRecording) {
      stopRecording();
    }
    toast({ title: "Interview Ended", description: "You have left the interview session." });
    router.push('/interview-prep');
  };

  const handleSendChatMessage = () => {
    if (chatInput.trim()) {
      setChatMessages([...chatMessages, { user: currentUser.name, text: chatInput.trim(), id: Date.now().toString() }]);
      setChatInput('');
    }
  };

  const handleGetNewSuggestions = async () => {
    if (!isInterviewer) return;
    setIsLoadingSuggestions(true);
    try {
      const input: GenerateLiveInterviewQuestionsInput = {
        jobTitle: aiContextJobTitle || sessionDetails?.title,
        interviewTopics: aiContextTopics.split(',').map(t => t.trim()).filter(t => t),
        previousQuestions: askedQuestions,
        count: 3,
      };
      const result = await generateLiveInterviewQuestions(input);
      setSuggestedQuestions(prev => [...result.suggestedQuestions, ...prev.slice(0, Math.max(0, 2 - result.suggestedQuestions.length))]);
    } catch (error) {
      toast({ title: "Failed to Get Suggestions", description: "Could not fetch AI question suggestions.", variant: "destructive" });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const markQuestionAsAsked = (questionText: string) => {
    setAskedQuestions(prev => [...prev, questionText]);
    setSuggestedQuestions(prev => prev.filter(q => q.questionText !== questionText));
  };

  const startRecording = async () => {
    if (!browserSupportsRecording) {
      toast({ title: "Recording Not Supported", variant: "destructive"});
      return;
    }
    if (isRecording || !navigator.mediaDevices?.getUserMedia) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false }); // Audio only for now
      mediaRecorderRef.current = new MediaRecorder(stream);
      recordedChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(recordedChunksRef.current, { type: 'audio/webm' }); // or audio/ogg, audio/wav
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url); // For potential playback

        const newRecordingRef: RecordingReference = {
          id: `rec-${Date.now()}`,
          sessionId: sessionId,
          startTime: new Date().toISOString(), // This should be the actual start time
          durationSeconds: Math.round(audioBlob.size / 16000), // Rough estimate, actual duration needs better tracking
          localStorageKey: `recording_${sessionId}_${Date.now()}` // Mock key
        };
        setLocalRecordingReferences(prev => [...prev, newRecordingRef]);
        
        // In a real app, you'd upload audioBlob to a server here.
        // For now, just log it.
        console.log("Recording stopped. Blob available at:", url, "Size:", audioBlob.size);
        toast({ title: "Recording Stopped", description: "Audio recording saved (mocked to local blob)." });
        
        // Clean up stream tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAudioURL(null);
      toast({ title: "Recording Started", description: "Audio recording is now active." });
    } catch (err) {
      console.error("Error starting recording:", err);
      toast({ title: "Recording Error", description: "Could not start audio recording.", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // onstop handler will do the rest
    }
  };


  if (isLoadingSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading interview session...</p>
      </div>
    );
  }

  if (sessionDetails === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold">Interview Session Not Found</h1>
        <p className="text-muted-foreground mb-6">The interview session ID "{sessionId}" is invalid or the session does not exist.</p>
        <Button asChild><Link href="/interview-prep">Back to Interview Prep</Link></Button>
      </div>
    );
  }
  if (!sessionDetails) return <p>Error loading session.</p>;

  const otherParticipant = sessionDetails.participants.find(p => p.userId !== currentUser.id) || { name: "Participant", role: "candidate", profilePictureUrl: `https://avatar.vercel.sh/participant.png` };
  const selfParticipant = sessionDetails.participants.find(p => p.userId === currentUser.id) || { name: currentUser.name, role: isInterviewer ? "interviewer" : "candidate", profilePictureUrl: currentUser.profilePictureUrl };


  return (
    <div className="flex flex-col h-screen bg-background text-foreground p-2 sm:p-4">
      <Card className="mb-2 sm:mb-4 shadow-md">
        <CardHeader className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <CardTitle className="text-xl sm:text-2xl">{sessionDetails.title}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Live Interview Session - {isInterviewer ? "You are the Interviewer" : `You are the Candidate (with ${otherParticipant.name})`}
              </CardDescription>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Scheduled: {new Date(sessionDetails.scheduledTime).toLocaleString()}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4 overflow-hidden">
        <div className={cn("lg:col-span-2 bg-muted rounded-lg flex flex-col p-2 relative shadow-inner min-h-[300px] sm:min-h-[400px]", isScreenSharing ? "border-4 border-green-500" : "")}>
          {isScreenSharing ? (
            <div className="w-full h-full bg-slate-700 text-white flex items-center justify-center rounded-md">
              <p>[Screen Share Active (Mock)]</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full h-full">
              <div className="bg-slate-800 text-white rounded-md flex items-center justify-center p-2 aspect-video sm:aspect-auto relative overflow-hidden">
                <img src={isVideoOff && selfParticipant.role === 'candidate' ? `https://placehold.co/300x200/222/eee?text=${selfParticipant.name.charAt(0)}` : selfParticipant.profilePictureUrl || `https://placehold.co/300x200/222/eee?text=You`} alt="Self view" className="w-full h-full object-cover" data-ai-hint="person video call"/>
                <p className="absolute bottom-1 left-1 text-xs bg-black/50 px-1.5 py-0.5 rounded">{selfParticipant.name} (You)</p>
                {isVideoOff && <p className="text-xs absolute top-1 right-1 bg-destructive/80 p-1 rounded">Video Off</p>}
              </div>
              <div className="bg-slate-700 text-white rounded-md flex items-center justify-center p-2 aspect-video sm:aspect-auto relative overflow-hidden">
                 <img src={otherParticipant.profilePictureUrl || `https://placehold.co/300x200/111/ddd?text=${otherParticipant.name.charAt(0)}`} alt="Participant view" className="w-full h-full object-cover" data-ai-hint="person video call"/>
                <p className="absolute bottom-1 left-1 text-xs bg-black/50 px-1.5 py-0.5 rounded">{otherParticipant.name}</p>
              </div>
            </div>
          )}
        </div>

        <Card className="flex flex-col shadow-md">
          <CardHeader className="p-3 border-b">
            <CardTitle className="text-md">{isInterviewer ? "Interviewer Tools & Chat" : "Chat"}</CardTitle>
          </CardHeader>
          
          {isInterviewer && (
            <CardContent className="p-3 border-b space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-1"><Bot className="h-4 w-4 text-primary"/>AI Question Suggester</h3>
              <div className="space-y-1">
                <Label htmlFor="ai-job-title" className="text-xs">Job Title Context</Label>
                <Input id="ai-job-title" placeholder="e.g., Senior Software Engineer" value={aiContextJobTitle} onChange={e => setAiContextJobTitle(e.target.value)} className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ai-topics" className="text-xs">Focus Topics (comma-sep)</Label>
                <Input id="ai-topics" placeholder="e.g., React, System Design" value={aiContextTopics} onChange={e => setAiContextTopics(e.target.value)} className="h-8 text-xs" />
              </div>
              <Button size="sm" onClick={handleGetNewSuggestions} disabled={isLoadingSuggestions} className="w-full text-xs">
                {isLoadingSuggestions ? <Loader2 className="mr-1 h-3 w-3 animate-spin"/> : <ThumbsUp className="mr-1 h-3 w-3"/>}
                Get New Suggestions
              </Button>
              {suggestedQuestions.length > 0 && (
                <ScrollArea className="h-24 mt-1 p-1 border rounded-md bg-secondary/30">
                  <ul className="space-y-1">
                    {suggestedQuestions.map((q, idx) => (
                      <li key={idx} className="text-xs p-1.5 rounded hover:bg-primary/10 flex justify-between items-center">
                        <span>{q.questionText} {q.category && <span className="text-[10px] text-muted-foreground">({q.category})</span>}</span>
                        <Button variant="ghost" size="xs" className="h-auto p-0.5 text-primary" onClick={() => markQuestionAsAsked(q.questionText)}>Ask</Button>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </CardContent>
          )}

          <div className="flex-grow overflow-hidden p-0">
            <ScrollArea className="h-full p-3">
              <div className="space-y-2 text-xs">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={cn("p-1.5 rounded-md max-w-[80%]", msg.user === currentUser.name ? "bg-primary/80 text-primary-foreground ml-auto text-right" : "bg-muted text-muted-foreground")}>
                    <span className="font-semibold block">{msg.user === currentUser.name ? "You" : msg.user}</span>
                    {msg.text}
                  </div>
                ))}
                {chatMessages.length === 0 && <p className="text-center text-muted-foreground py-4">Chat history will appear here.</p>}
              </div>
            </ScrollArea>
          </div>
          <CardFooter className="p-2 border-t">
            <div className="flex w-full gap-1.5">
              <Input placeholder="Type a message..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendChatMessage()} className="h-9 text-sm"/>
              <Button size="icon" onClick={handleSendChatMessage} className="h-9 w-9 shrink-0"><Send className="h-4 w-4"/></Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 p-2 sm:p-3 mt-2 sm:mt-4 bg-card rounded-lg shadow-top border">
        <Button variant={isMicMuted ? "destructive" : "outline"} size="icon" onClick={handleToggleMic} title={isMicMuted ? "Unmute Mic" : "Mute Mic"}> <Mic className="h-5 w-5" /></Button>
        <Button variant={isVideoOff ? "destructive" : "outline"} size="icon" onClick={handleToggleVideo} title={isVideoOff ? "Start Video" : "Stop Video"}><Video className="h-5 w-5" /></Button>
        <Button variant={isScreenSharing ? "default" : "outline"} size="icon" onClick={handleToggleScreenShare} className={cn(isScreenSharing && "bg-green-600 hover:bg-green-700")} title={isScreenSharing ? "Stop Sharing" : "Share Screen"}><ScreenShare className="h-5 w-5" /></Button>
        {browserSupportsRecording && (
          <Button variant={isRecording ? "destructive" : "outline"} size="icon" onClick={isRecording ? stopRecording : startRecording} title={isRecording ? "Stop Recording" : "Start Recording"}>
            {isRecording ? <Square className="h-5 w-5 animate-pulse fill-current" /> : <Mic className="h-5 w-5 text-red-500" />}
          </Button>
        )}
        <Button variant="destructive" size="lg" onClick={handleEndCall} className="px-4 sm:px-6"><PhoneOff className="mr-0 sm:mr-2 h-5 w-5" /> <span className="hidden sm:inline">End Call</span></Button>
        
        {audioURL && (
          <div className="flex items-center gap-2 pl-4 border-l ml-2">
            <audio src={audioURL} controls className="h-8"/>
            <a href={audioURL} download={`recording_${sessionId}_${Date.now()}.webm`}>
              <Button variant="outline" size="icon" title="Download Recording"><DownloadIcon className="h-4 w-4"/></Button>
            </a>
          </div>
        )}
      </div>
      {localRecordingReferences.length > 0 && (
        <Card className="mt-2 text-xs p-2">
            <p className="font-semibold">Mock Recordings:</p>
            <ul className="list-disc list-inside">
                {localRecordingReferences.map(ref => <li key={ref.id}>{ref.localStorageKey} (Duration: {ref.durationSeconds}s)</li>)}
            </ul>
        </Card>
      )}
    </div>
  );
}

