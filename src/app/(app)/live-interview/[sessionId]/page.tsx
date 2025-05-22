
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Mic, Video as VideoIcon, ScreenShare, PhoneOff, Send, Bot, ListChecks, Loader2, AlertTriangle, ThumbsUp, ChevronDown, Square, Play, Download as DownloadIcon, VideoOff, MessageSquare as ChatIcon, Users as ParticipantsIcon, HelpCircle, Maximize, Minimize, RadioButton } from 'lucide-react';
import { generateLiveInterviewQuestions, type GenerateLiveInterviewQuestionsInput, type GenerateLiveInterviewQuestionsOutput } from '@/ai/flows/generate-live-interview-questions';
import { sampleUserProfile, sampleLiveInterviewSessions } from '@/lib/sample-data';
import type { LiveInterviewSession, LiveInterviewParticipant, RecordingReference } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { format } from 'date-fns';

export default function LiveInterviewPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const sessionId = params.sessionId as string;

  const [sessionDetails, setSessionDetails] = useState<LiveInterviewSession | null | undefined>(undefined);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Media states
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [activeStreamType, setActiveStreamType] = useState<'camera' | 'screen' | 'none'>('none');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasScreenPermission, setHasScreenPermission] = useState<boolean | null>(null);

  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const selfVideoRef = useRef<HTMLVideoElement>(null);

  // Chat states
  const [chatMessages, setChatMessages] = useState<{ user: string, text: string, id: string }[]>([]);
  const [chatInput, setChatInput] = useState('');

  // AI Question Suggester states
  const [aiContextJobTitle, setAiContextJobTitle] = useState('');
  const [aiContextTopics, setAiContextTopics] = useState('');
  const [suggestedQuestions, setSuggestedQuestions] = useState<GenerateLiveInterviewQuestionsOutput['suggestedQuestions']>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [audioURL, setAudioURL] = useState<string | null>(null); // For playback/download
  const [browserSupportsRecording, setBrowserSupportsRecording] = useState(true);
  const [localRecordingReferences, setLocalRecordingReferences] = useState<RecordingReference[]>([]);


  const currentUser = sampleUserProfile;

  const isInterviewer = useMemo(() => {
    if (!sessionDetails) return false;
    const participant = sessionDetails.participants.find(p => p.userId === currentUser.id);
    return participant?.role === 'interviewer';
  }, [sessionDetails, currentUser.id]);

  const selfParticipant = useMemo(() => 
    sessionDetails?.participants.find(p => p.userId === currentUser.id) || 
    { name: currentUser.name, role: isInterviewer ? "interviewer" : "candidate", profilePictureUrl: currentUser.profilePictureUrl, userId: currentUser.id },
    [sessionDetails, currentUser, isInterviewer]
  );

  const otherParticipant = useMemo(() =>
    sessionDetails?.participants.find(p => p.userId !== currentUser.id) ||
    { name: "Participant", role: "candidate", profilePictureUrl: `https://avatar.vercel.sh/participant.png`, userId: 'participant-placeholder' },
    [sessionDetails, currentUser]
  );

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
        router.push('/interview-prep'); // Redirect if session not found
      }
    }
    setIsLoadingSession(false);
  }, [sessionId, toast, router]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update time every minute
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && !navigator.mediaDevices?.getUserMedia) {
      setBrowserSupportsRecording(false);
    }
  }, []);

  const stopStream = useCallback((stream: MediaStream | null) => {
    stream?.getTracks().forEach(track => track.stop());
  }, []);

  const startCameraStream = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setHasCameraPermission(false);
      toast({ title: "Camera Error", description: "Camera access not supported.", variant: "destructive" });
      return null;
    }
    try {
      stopStream(screenStream); setScreenStream(null); // Stop screen share if active
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: !isMicMuted });
      setCameraStream(stream);
      setHasCameraPermission(true);
      if (selfVideoRef.current) selfVideoRef.current.srcObject = stream;
      // If self is also the main view (e.g., only one participant or screen sharing self)
      if (activeStreamType === 'camera' && mainVideoRef.current && selfParticipant.userId === currentUser.id) {
        mainVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.error("Error accessing camera:", err);
      setHasCameraPermission(false);
      toast({ title: "Camera Access Denied", description: "Please enable camera permissions.", variant: "destructive" });
      return null;
    }
  }, [isMicMuted, stopStream, screenStream, activeStreamType, selfParticipant, currentUser.id, toast]);

  const stopCameraStream = useCallback(() => {
    stopStream(cameraStream);
    setCameraStream(null);
    if (selfVideoRef.current) selfVideoRef.current.srcObject = null;
     if (mainVideoRef.current && activeStreamType === 'camera' && selfParticipant.userId === currentUser.id) {
        mainVideoRef.current.srcObject = null;
    }
  }, [cameraStream, stopStream, activeStreamType, selfParticipant, currentUser.id]);

  const startScreenShareStream = useCallback(async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setHasScreenPermission(false);
      toast({ title: "Screen Share Error", description: "Screen sharing not supported.", variant: "destructive" });
      return null;
    }
    try {
      stopCameraStream(); // Stop camera if active
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      setScreenStream(stream);
      setHasScreenPermission(true);
      if (mainVideoRef.current) mainVideoRef.current.srcObject = stream;
      
      // Listen for when the user stops sharing via browser UI
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShareStream(true); // Pass true to indicate it was stopped by browser
      };
      return stream;
    } catch (err) {
      console.error("Error starting screen share:", err);
      setHasScreenPermission(false);
      toast({ title: "Screen Share Failed", description: "Could not start screen sharing.", variant: "destructive" });
      return null;
    }
  }, [stopCameraStream, toast]);

  const stopScreenShareStream = useCallback((browserInitiated = false) => {
    stopStream(screenStream);
    setScreenStream(null);
    if (mainVideoRef.current) mainVideoRef.current.srcObject = null;
    setActiveStreamType('camera'); // Attempt to revert to camera
    if (!browserInitiated) {
        toast({ title: "Screen Sharing Stopped", duration: 2000 });
    }
  }, [screenStream, stopStream]);


  useEffect(() => {
    // Effect to manage active stream based on activeStreamType
    (async () => {
      if (activeStreamType === 'camera') {
        await startCameraStream();
      } else if (activeStreamType === 'screen') {
        await startScreenShareStream();
      } else { // 'none'
        stopCameraStream();
        stopScreenShareStream();
      }
    })();
    // Cleanup streams on unmount or when activeStreamType changes to 'none'
    return () => {
      if (activeStreamType !== 'camera') stopCameraStream();
      if (activeStreamType !== 'screen') stopScreenShareStream();
    };
  }, [activeStreamType, startCameraStream, stopCameraStream, startScreenShareStream, stopScreenShareStream]);


  const handleToggleVideo = () => setActiveStreamType(prev => prev === 'camera' ? 'none' : 'camera');
  const handleToggleMic = () => {
    setIsMicMuted(!isMicMuted);
    [cameraStream, screenStream].forEach(stream => {
        stream?.getAudioTracks().forEach(track => track.enabled = isMicMuted); // isMicMuted is previous state
    });
    toast({ title: !isMicMuted ? "Mic Muted" : "Mic Unmuted", duration: 1500 });
  };
  const handleToggleScreenShare = () => setActiveStreamType(prev => prev === 'screen' ? (cameraStream ? 'camera' : 'none') : 'screen');

  const handleEndCall = () => {
    if (isRecording) stopRecording();
    stopStream(cameraStream); setCameraStream(null);
    stopStream(screenStream); setScreenStream(null);
    setActiveStreamType('none');
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
      setSuggestedQuestions(prev => [...result.suggestedQuestions, ...prev.slice(0, Math.max(0, 5 - result.suggestedQuestions.length))].slice(0,5));
    } catch (error) {
      toast({ title: "Failed to Get Suggestions", variant: "destructive" });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const markQuestionAsAsked = (questionText: string) => {
    setAskedQuestions(prev => [...prev, questionText]);
    setSuggestedQuestions(prev => prev.filter(q => q.questionText !== questionText));
  };

  const startRecording = async () => {
    if (!browserSupportsRecording || isRecording) return;
    const streamToRecord = screenStream || cameraStream; // Prefer screen stream if active
    if (!streamToRecord || streamToRecord.getAudioTracks().length === 0) {
        toast({ title: "Recording Error", description: "No active audio stream to record. Ensure mic is enabled for camera or screen share.", variant: "destructive"});
        return;
    }

    try {
      mediaRecorderRef.current = new MediaRecorder(streamToRecord);
      recordedChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => recordedChunksRef.current.push(event.data);
      mediaRecorderRef.current.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm'; // Default if not available
        const audioBlob = new Blob(recordedChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        // ... (rest of recording save logic) ...
        toast({ title: "Recording Stopped", description: "Recording available for playback/download." });
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAudioURL(null);
      toast({ title: "Recording Started" });
    } catch (err) {
      toast({ title: "Recording Error", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };


  if (isLoadingSession || sessionDetails === undefined) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="ml-4 text-muted-foreground">Loading session...</p></div>;
  }
  if (sessionDetails === null) {
    return <div className="flex flex-col items-center justify-center min-h-screen text-center p-4"><AlertTriangle className="h-16 w-16 text-destructive mb-4" /><h1 className="text-2xl font-bold">Session Not Found</h1><p className="text-muted-foreground mb-6">ID: {sessionId}</p><Button asChild><Link href="/interview-prep">Back to Prep</Link></Button></div>;
  }
  
  const mainFeedName = activeStreamType === 'screen' ? "Your Screen Share" : otherParticipant.name;

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-900 text-foreground p-2 md:p-4">
      {/* Header bar - Kept minimal as AppHeader provides global session title */}
      <div className="mb-2 md:mb-4 text-center md:text-left">
        <h1 className="text-xl md:text-2xl font-semibold">{sessionDetails.title}</h1>
        <p className="text-xs md:text-sm text-muted-foreground">
          Candidate: {otherParticipant.role === 'candidate' ? otherParticipant.name : selfParticipant.name}
          <span className="mx-2 hidden md:inline">|</span> 
          <span className="block md:inline">Current Time: {format(currentTime, 'p')}</span>
        </p>
      </div>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-4 overflow-hidden">
        {/* Main Video and Controls Area */}
        <div className="lg:col-span-2 bg-black rounded-lg flex flex-col p-2 md:p-4 relative shadow-2xl justify-between">
          {/* Main Video Display */}
          <div className="w-full aspect-video bg-slate-800 rounded-md flex items-center justify-center text-slate-400 relative overflow-hidden mb-2 md:mb-4 flex-grow">
            <video ref={mainVideoRef} className={cn("w-full h-full object-contain", (activeStreamType === 'none' && otherParticipant.userId === 'participant-placeholder') && "hidden")} autoPlay playsInline />
            {(activeStreamType === 'none' && otherParticipant.userId === 'participant-placeholder') && <p>{otherParticipant.name}'s video is off</p>}
            {activeStreamType === 'screen' && <p className="absolute bottom-2 left-2 text-xs bg-black/50 px-1.5 py-0.5 rounded text-white">Sharing Screen</p>}
            {activeStreamType !== 'screen' && <p className="absolute bottom-2 left-2 text-xs bg-black/50 px-1.5 py-0.5 rounded text-white">{mainFeedName}</p>}

            {/* Self Video (Picture-in-Picture) */}
            <div className="absolute top-2 right-2 w-24 h-auto md:w-32 lg:w-40 aspect-video bg-slate-700 rounded shadow-md overflow-hidden border-2 border-slate-600">
              <video ref={selfVideoRef} className={cn("w-full h-full object-cover", activeStreamType !== 'camera' && "hidden")} autoPlay playsInline muted />
              {activeStreamType !== 'camera' && (
                <div className="w-full h-full flex items-center justify-center">
                    <VideoOff className="h-6 w-6 text-slate-400"/>
                </div>
              )}
              <p className="absolute bottom-1 left-1 text-[10px] bg-black/50 px-1 py-0.5 rounded text-white">You ({selfParticipant.name})</p>
            </div>
          </div>
          
          {/* Controls Bar */}
          <div className="flex justify-center items-center gap-2 md:gap-3 p-2 bg-slate-800/50 backdrop-blur-sm rounded-md">
            <Button variant={isMicMuted ? "destructive" : "outline"} size="icon" onClick={handleToggleMic} title={isMicMuted ? "Unmute" : "Mute"} className="bg-white/10 text-white hover:bg-white/20 border-white/20"> <Mic className={cn("h-5 w-5", isMicMuted && "text-red-400")} /></Button>
            <Button variant={activeStreamType !== 'camera' ? "destructive" : "outline"} size="icon" onClick={handleToggleVideo} title={activeStreamType !== 'camera' ? "Start Video" : "Stop Video"} className="bg-white/10 text-white hover:bg-white/20 border-white/20"><VideoIcon className="h-5 w-5" /></Button>
            <Button variant={activeStreamType === 'screen' ? "default" : "outline"} size="icon" onClick={handleToggleScreenShare} className={cn("bg-white/10 text-white hover:bg-white/20 border-white/20", activeStreamType === 'screen' && "bg-green-500 hover:bg-green-600 border-green-600")} title={activeStreamType === 'screen' ? "Stop Sharing" : "Share Screen"}><ScreenShare className="h-5 w-5" /></Button>
            {browserSupportsRecording && (
              <Button variant={isRecording ? "destructive" : "outline"} size="icon" onClick={isRecording ? stopRecording : startRecording} title={isRecording ? "Stop Recording" : "Start Recording"} className="bg-white/10 text-white hover:bg-white/20 border-white/20">
                {isRecording ? <RadioButton className="h-5 w-5 animate-pulse text-red-500 fill-current" /> : <RadioButton className="h-5 w-5 text-red-400" />}
              </Button>
            )}
            <Button variant="destructive" size="default" onClick={handleEndCall} className="px-3 md:px-4 py-2 text-sm"><PhoneOff className="mr-0 md:mr-2 h-5 w-5" /> <span className="hidden md:inline">End Call</span></Button>
          </div>
        </div>

        {/* Right Sidebar for Tools */}
        <Card className="flex flex-col shadow-lg bg-card text-card-foreground rounded-lg">
          <Accordion type="multiple" defaultValue={['suggested-questions', 'chat']} className="w-full flex-grow flex flex-col overflow-hidden">
            {isInterviewer && (
              <AccordionItem value="suggested-questions" className="border-b">
                <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:bg-secondary/50">
                    <div className="flex items-center gap-2"><HelpCircle className="h-4 w-4 text-primary"/>Suggested Questions</div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-3 space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="ai-job-title-sidebar" className="text-xs">Job Title Context</Label>
                    <Input id="ai-job-title-sidebar" placeholder="e.g., Senior Software Engineer" value={aiContextJobTitle} onChange={e => setAiContextJobTitle(e.target.value)} className="h-8 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="ai-topics-sidebar" className="text-xs">Focus Topics</Label>
                    <Input id="ai-topics-sidebar" placeholder="e.g., React, System Design" value={aiContextTopics} onChange={e => setAiContextTopics(e.target.value)} className="h-8 text-xs" />
                  </div>
                  <Button size="sm" onClick={handleGetNewSuggestions} disabled={isLoadingSuggestions} className="w-full text-xs bg-primary/80 hover:bg-primary/90 h-8">
                    {isLoadingSuggestions ? <Loader2 className="mr-1 h-3 w-3 animate-spin"/> : <ThumbsUp className="mr-1 h-3 w-3"/>} Get New Suggestions
                  </Button>
                  {suggestedQuestions.length > 0 && (
                    <ScrollArea className="h-28 mt-1 p-1 border rounded-md bg-secondary/20">
                      <ul className="space-y-0.5">
                        {suggestedQuestions.map((q, idx) => (
                          <li key={idx} className="text-xs p-1.5 rounded hover:bg-primary/10 flex justify-between items-center group">
                            <span className="flex-1 mr-1" title={q.questionText}>{q.questionText} {q.category && <span className="text-[10px] text-muted-foreground">({q.category})</span>}</span>
                            <Button variant="ghost" size="xs" className="h-auto p-0.5 text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => markQuestionAsAsked(q.questionText)}>Ask</Button>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  )}
                </AccordionContent>
              </AccordionItem>
            )}
            <AccordionItem value="chat" className="border-b flex-grow flex flex-col overflow-hidden">
              <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:bg-secondary/50">
                <div className="flex items-center gap-2"><ChatIcon className="h-4 w-4 text-primary"/>Chat</div>
              </AccordionTrigger>
              <AccordionContent className="px-0 pt-0 pb-0 flex-grow flex flex-col overflow-hidden">
                 <ScrollArea className="flex-grow p-3">
                  <div className="space-y-2 text-xs">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className={cn("p-1.5 rounded-md max-w-[85%]", msg.user === currentUser.name ? "bg-primary/80 text-primary-foreground ml-auto text-right" : "bg-muted text-muted-foreground")}>
                        <span className="font-semibold block">{msg.user === currentUser.name ? "You" : msg.user}</span>
                        {msg.text}
                      </div>
                    ))}
                    {chatMessages.length === 0 && <p className="text-center text-muted-foreground py-4">Chat messages appear here.</p>}
                  </div>
                </ScrollArea>
                <div className="p-3 border-t mt-auto">
                  <div className="flex w-full gap-1.5">
                    <Input placeholder="Type message..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendChatMessage()} className="h-9 text-xs"/>
                    <Button size="icon" onClick={handleSendChatMessage} className="h-9 w-9 shrink-0"><Send className="h-4 w-4"/></Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="participants" className="border-b-0">
              <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:bg-secondary/50">
                 <div className="flex items-center gap-2"><ParticipantsIcon className="h-4 w-4 text-primary"/>Participants ({sessionDetails.participants.length})</div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3">
                <ul className="space-y-1.5 text-xs">
                  {sessionDetails.participants.map(p => (
                    <li key={p.userId} className="flex items-center gap-2 p-1 rounded hover:bg-secondary/30">
                      <img src={p.profilePictureUrl || `https://avatar.vercel.sh/${p.userId}.png`} alt={p.name} className="h-6 w-6 rounded-full" data-ai-hint="person avatar"/>
                      <span>{p.name} <span className="text-muted-foreground/80">({p.role})</span></span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </div>
      {audioURL && (
        <div className="fixed bottom-20 right-4 z-50 bg-card p-2 rounded shadow-lg border flex items-center gap-2">
            <audio src={audioURL} controls className="h-8"/>
            <a href={audioURL} download={`recording_${sessionId}_${Date.now()}.webm`}>
              <Button variant="outline" size="icon" title="Download Recording"><DownloadIcon className="h-4 w-4"/></Button>
            </a>
        </div>
      )}
    </div>
  );
}

