
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
import { Mic, Video as VideoIcon, ScreenShare, PhoneOff, Send, Bot, ListChecks, Loader2, AlertTriangle, ThumbsUp, ChevronDown, Square, Play, Download as DownloadIcon, VideoOff, MessageSquare as ChatIcon, Users as ParticipantsIcon, HelpCircle, Maximize, Minimize, Radio, CheckSquare as CheckSquareIcon, RotateCcw } from 'lucide-react';
import { sampleUserProfile, sampleLiveInterviewSessions, sampleInterviewQuestions } from '@/lib/sample-data';
import type { LiveInterviewSession, LiveInterviewParticipant, RecordingReference, MockInterviewQuestion } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { format } from 'date-fns';

const logger = {
  debug: (message: string, ...args: any[]) => console.debug(`[LiveInterviewPage] ${message}`, ...args),
  info: (message: string, ...args: any[]) => console.info(`[LiveInterviewPage] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`[LiveInterviewPage] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[LiveInterviewPage] ${message}`, ...args),
};


export default function LiveInterviewPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const sessionId = params.sessionId as string;

  const [sessionDetails, setSessionDetails] = useState<LiveInterviewSession | null | undefined>(undefined);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [activeStreamType, setActiveStreamType] = useState<'camera' | 'screen' | 'none'>('none');
  
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasScreenPermission, setHasScreenPermission] = useState<boolean | null>(null);

  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const selfVideoRef = useRef<HTMLVideoElement>(null);

  const [chatMessages, setChatMessages] = useState<{ user: string, text: string, id: string }[]>([]);
  const [chatInput, setChatInput] = useState('');

  const [askedQuestions, setAskedQuestions] = useState<Set<string>>(new Set()); // Store IDs of asked questions

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [audioURL, setAudioURL] = useState<string | null>(null); 
  const [browserSupportsRecording, setBrowserSupportsRecording] = useState(true);
  const [localRecordingReferences, setLocalRecordingReferences] = useState<RecordingReference[]>([]);
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);


  const currentUser = sampleUserProfile;

  const isInterviewer = useMemo(() => {
    if (!sessionDetails) return false;
    const participant = sessionDetails.participants.find(p => p.userId === currentUser.id);
    return participant?.role === 'interviewer';
  }, [sessionDetails, currentUser.id]);
  
  useEffect(() => {
    if (isInterviewer) {
      setOpenAccordionItems(['interview-questions', 'chat', 'participants']);
    } else {
      setOpenAccordionItems(['chat', 'participants']);
    }
  }, [isInterviewer, sessionDetails]);


  const selfParticipant = useMemo(() =>
    sessionDetails?.participants.find(p => p.userId === currentUser.id) ||
    { name: currentUser.name, role: isInterviewer ? "interviewer" : "candidate", profilePictureUrl: currentUser.profilePictureUrl, userId: currentUser.id },
    [sessionDetails, currentUser, isInterviewer]
  );

  const otherParticipant = useMemo(() =>
    sessionDetails?.participants.find(p => p.userId !== currentUser.id) ||
    { name: "Participant Placeholder", role: isInterviewer ? "candidate" : "interviewer", profilePictureUrl: `https://avatar.vercel.sh/participantB.png`, userId: 'participant-placeholder-B' },
    [sessionDetails, currentUser, isInterviewer]
  );


  useEffect(() => {
    setIsLoadingSession(true);
    if (sessionId) {
      const foundSession = sampleLiveInterviewSessions.find(s => s.id === sessionId);
      if (foundSession) {
        setSessionDetails(foundSession);
        setLocalRecordingReferences(foundSession.recordingReferences || []);
        logger.info("Session details loaded:", foundSession.title);
      } else {
        setSessionDetails(null); 
        toast({
          title: "Session Not Found",
          description: `Could not find an interview session with ID: ${sessionId}`,
          variant: "destructive",
        });
        router.push('/interview-prep');
      }
    } else {
      setSessionDetails(null); 
       toast({ title: "Invalid Session", description: "No session ID provided.", variant: "destructive"});
       router.push('/interview-prep');
    }
    setIsLoadingSession(false);
  }, [sessionId, toast, router]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); 
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && (!navigator.mediaDevices?.getUserMedia || !navigator.mediaDevices?.getDisplayMedia)) {
      setBrowserSupportsRecording(false);
      toast({ title: "Media Not Fully Supported", description: "Your browser may not support all media features (camera/screen sharing/recording).", variant: "default", duration: 7000 });
    }
  }, [toast]);

  const stopStreamTracks = useCallback((stream: MediaStream | null) => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
      logger.debug("Tracks stopped for stream:", stream.id);
    }
  }, []);

  const startCameraStream = useCallback(async () => {
    logger.debug("Attempting to start camera stream...");
    if (!navigator.mediaDevices?.getUserMedia) {
      setHasCameraPermission(false);
      toast({ title: "Camera Error", description: "Camera access not supported or permission denied.", variant: "destructive" });
      return null;
    }
    try {
      if (cameraStream) {
        stopStreamTracks(cameraStream);
        setCameraStream(null);
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: !isMicMuted });
      setCameraStream(stream);
      setHasCameraPermission(true);
      setIsVideoActive(true);
      logger.info("Camera stream started and set to state:", stream.id);
      return stream;
    } catch (err) {
      console.error("Error accessing camera:", err);
      setHasCameraPermission(false);
      setIsVideoActive(false);
      toast({ title: "Camera Access Denied", description: "Please enable camera permissions in your browser settings.", variant: "destructive" });
      return null;
    }
  }, [isMicMuted, toast, cameraStream, stopStreamTracks]);

  const stopCameraStream = useCallback(() => {
    logger.debug("Attempting to stop camera stream.");
    if (cameraStream) {
      stopStreamTracks(cameraStream);
      setCameraStream(null);
    }
    setIsVideoActive(false); // Ensure this reflects the camera state accurately
    logger.debug("Camera stream stopped and isVideoActive set to false.");
  }, [cameraStream, stopStreamTracks]);

  const startScreenShareStream = useCallback(async () => {
    logger.debug("Attempting to start screen share stream...");
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setHasScreenPermission(false);
      toast({ title: "Screen Share Error", description: "Screen sharing not supported by your browser.", variant: "destructive" });
      return null;
    }
    try {
      if (screenStream) {
        stopStreamTracks(screenStream);
        setScreenStream(null);
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" } as any, 
        audio: false 
      });
      
      stream.getVideoTracks()[0].onended = () => {
        logger.info("Screen share ended by browser control or track ending.");
        setActiveStreamType(isVideoActive && cameraStream ? 'camera' : 'none'); // Revert to camera if it was on
        setScreenStream(null);
      };
      setScreenStream(stream);
      setHasScreenPermission(true);
      logger.info("Screen share stream started and set to state:", stream.id);
      return stream;
    } catch (err) {
      console.error("Error starting screen share:", err);
      setHasScreenPermission(false);
      toast({ title: "Screen Share Failed", description: "Could not start screen sharing. Ensure permission is granted.", variant: "destructive" });
      return null;
    }
  }, [toast, screenStream, stopStreamTracks, isVideoActive, cameraStream]);

  const stopScreenShareStream = useCallback(() => {
    logger.debug(`Attempting to stop screen share.`);
    if (screenStream) {
      stopStreamTracks(screenStream);
      setScreenStream(null);
    }
    // If screen share was active, revert to camera if it was on, otherwise none.
    setActiveStreamType(isVideoActive && cameraStream ? 'camera' : 'none');
    toast({ title: "Screen Sharing Stopped", duration: 2000 });
    logger.debug("Screen share stream stopped.");
  }, [screenStream, stopStreamTracks, toast, isVideoActive, cameraStream]);

  // Effect to manage self view (always camera if active)
  useEffect(() => {
    if (selfVideoRef.current) {
      if (isVideoActive && cameraStream) {
        selfVideoRef.current.srcObject = cameraStream;
        logger.debug("Self view assigned camera stream:", cameraStream.id);
      } else {
        selfVideoRef.current.srcObject = null;
        logger.debug("Self view cleared (camera off or no stream).");
      }
    }
  }, [isVideoActive, cameraStream]);

  // Effect to manage main view based on activeStreamType
  useEffect(() => {
    if (mainVideoRef.current) {
      if (activeStreamType === 'screen' && screenStream) {
        mainVideoRef.current.srcObject = screenStream;
        logger.debug("Main view assigned screen stream:", screenStream.id);
      } else if (activeStreamType === 'camera' && cameraStream) {
        // Mock: If this user's camera is active, show it in main for demo.
        // In a real app, this would be the OTHER participant's stream.
        mainVideoRef.current.srcObject = cameraStream; 
        logger.debug("Main view assigned (mocked other's) camera stream:", cameraStream.id);
      } else {
        mainVideoRef.current.srcObject = null;
        logger.debug("Main view cleared (no active stream or stream unavailable).");
      }
    }
  }, [activeStreamType, cameraStream, screenStream]);


  const handleToggleVideo = async () => {
    if (isVideoActive) { // If video is currently on, turn it off
      stopCameraStream();
      // If camera was the main feed, set main feed to none. Screen share takes precedence.
      if (activeStreamType === 'camera') {
          setActiveStreamType('none'); 
      }
    } else { // If video is off, try to turn it on
      const stream = await startCameraStream();
      if (stream) {
        // If no other stream is primary, or if screen isn't shared, make camera primary.
        if (activeStreamType === 'none' || activeStreamType === 'camera') {
           setActiveStreamType('camera');
        }
      }
    }
  };
  
  const handleToggleScreenShare = async () => {
    if (activeStreamType === 'screen') {
      stopScreenShareStream(); // This will attempt to revert to camera if it was on
    } else {
      const stream = await startScreenShareStream();
      if (stream) {
        setActiveStreamType('screen'); // Screen share becomes the main active stream
      }
    }
  };


  const handleToggleMic = () => {
    const newMutedState = !isMicMuted;
    setIsMicMuted(newMutedState);
    if (cameraStream) {
      cameraStream.getAudioTracks().forEach(track => track.enabled = !newMutedState);
      logger.debug(`Mic toggled. New state: ${newMutedState ? "Muted" : "Unmuted"}. Audio tracks in cameraStream enabled: ${!newMutedState}`);
    }
    toast({ title: newMutedState ? "Mic Muted" : "Mic Unmuted", duration: 1500 });
  };


  const handleEndCall = () => {
    if (isRecording) stopRecording();
    stopCameraStream();
    stopScreenShareStream(); 
    setActiveStreamType('none');
    toast({ title: "Interview Ended", description: "You have left the interview session." });
    router.push('/interview-prep');
  };

  const handleSendChatMessage = () => {
    if (chatInput.trim() && sessionDetails) {
      const newMsg = { user: selfParticipant.name, text: chatInput.trim(), id: Date.now().toString() };
      setChatMessages(prev => [...prev, newMsg]);
      logger.debug("Chat message sent (local):", newMsg);
      setChatInput('');
    }
  };
  
  const markQuestionAsAsked = (questionId: string) => {
    setAskedQuestions(prev => new Set(prev).add(questionId));
    toast({title: "Question Marked as Asked", duration: 2000})
    logger.debug("Question marked as asked:", questionId);
  };
  
  const resetAskedQuestions = () => {
    setAskedQuestions(new Set());
    toast({title: "Asked Questions Reset", duration: 2000});
    logger.debug("Asked questions list reset.");
  };


  const startRecording = async () => {
    if (!browserSupportsRecording || isRecording) return;
    
    let streamToRecord: MediaStream | null = null;
    let recordingType: 'video' | 'audio' = 'audio';

    if (activeStreamType === 'screen' && screenStream?.getVideoTracks().length > 0) {
        const videoTracks = screenStream.getVideoTracks();
        const audioTracks = (cameraStream && !isMicMuted) ? cameraStream.getAudioTracks() : [];
        streamToRecord = new MediaStream([...videoTracks, ...audioTracks]);
        recordingType = 'video';
        logger.info("Recording: Screen video + mic audio (if available & unmuted)");
    } else if (isVideoActive && cameraStream) {
        const videoTracks = cameraStream.getVideoTracks();
        const audioTracks = !isMicMuted ? cameraStream.getAudioTracks() : [];
        streamToRecord = new MediaStream([...videoTracks, ...audioTracks]);
        recordingType = videoTracks.length > 0 ? 'video' : 'audio';
        logger.info(`Recording: Camera ${videoTracks.length > 0 ? 'video' : 'no video'} + mic audio (if available & unmuted)`);
    } else if (cameraStream && cameraStream.getAudioTracks().length > 0 && !isMicMuted) {
        streamToRecord = new MediaStream(cameraStream.getAudioTracks());
        recordingType = 'audio';
        logger.info("Recording: Mic audio only");
    }

    if (!streamToRecord || streamToRecord.getTracks().length === 0) {
        toast({ title: "Recording Error", description: "No active audio or video stream to record. Ensure mic or camera/screen is enabled.", variant: "destructive"});
        logger.warn("Recording error: No active stream with tracks.");
        return;
    }
    
    logger.info("Attempting to record stream with tracks:", streamToRecord.getTracks().map(t => `${t.kind}:${t.label}`));

    try {
      const mimeType = recordingType === 'video' ? 'video/webm; codecs=vp9,opus' : 'audio/webm; codecs=opus';
      const options = MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(mimeType) ? { mimeType } : {};
      if (!options.mimeType) {
          logger.warn(`MIME type ${mimeType} not supported, falling back to browser default for ${recordingType}.`);
      }

      mediaRecorderRef.current = new MediaRecorder(streamToRecord, options);
      recordedChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
          logger.debug("Recording data available, chunk size:", event.data.size);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const finalMimeType = mediaRecorderRef.current?.mimeType || (recordingType === 'video' ? 'video/webm' : 'audio/webm');
        const recordedBlob = new Blob(recordedChunksRef.current, { type: finalMimeType });
        const url = URL.createObjectURL(recordedBlob);
        setAudioURL(url); 
        
        if (sessionDetails) {
            const newRecordingRef: RecordingReference = {
                id: `rec-${Date.now()}`,
                sessionId: sessionDetails.id,
                startTime: new Date().toISOString(), 
                durationSeconds: Math.round(recordedChunksRef.current.reduce((acc, chunk) => acc + ((chunk as any).duration || (chunk.size / 1000) ), 0)), 
                localStorageKey: `recording_${sessionDetails.id}_${Date.now()}`, 
                type: recordingType,
                blobUrl: url, 
                fileName: `recording_${sessionDetails.id}_${new Date().toISOString().replace(/:/g,'-')}.${finalMimeType.split('/')[1].split(';')[0]}`
            };
            setLocalRecordingReferences(prev => [...prev, newRecordingRef]);
            const sessionIndex = sampleLiveInterviewSessions.findIndex(s => s.id === sessionDetails.id);
            if (sessionIndex !== -1) {
                const updatedSession = {...sampleLiveInterviewSessions[sessionIndex]};
                updatedSession.recordingReferences = [...(updatedSession.recordingReferences || []), newRecordingRef];
                sampleLiveInterviewSessions[sessionIndex] = updatedSession;
            }
        }
        logger.info("Recording stopped. Blob URL created:", url);
        toast({ title: "Recording Stopped", description: "Recording available for playback/download.", duration: 5000 });
      };
      mediaRecorderRef.current.start(1000); 
      setIsRecording(true);
      setAudioURL(null);
      toast({ title: "Recording Started" });
      logger.info("Recording started.");
    } catch (err) {
      console.error("MediaRecorder error:", err);
      toast({ title: "Recording Error", description: (err as Error).message || "Could not start recording.", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false); 
      logger.info("Recording stop requested.");
    }
  };


  if (isLoadingSession || sessionDetails === undefined) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="ml-4 text-muted-foreground">Loading session...</p></div>;
  }
  if (sessionDetails === null) { 
    return <div className="flex flex-col items-center justify-center min-h-screen text-center p-4"><AlertTriangle className="h-16 w-16 text-destructive mb-4" /><h1 className="text-2xl font-bold">Session Not Found</h1><p className="text-muted-foreground mb-6">ID: {sessionId}</p><Button asChild><Link href="/interview-prep">Back to Prep</Link></Button></div>;
  }

  const mainFeedName = activeStreamType === 'screen' && screenStream ? "Your Screen Share" : (activeStreamType === 'camera' && cameraStream ? otherParticipant.name : `${otherParticipant.name}'s Video Off`);
  const mainFeedIsActive = (activeStreamType === 'camera' && isVideoActive && cameraStream) || (activeStreamType === 'screen' && screenStream);


  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-900 text-foreground p-2 md:p-4 overflow-hidden">
      <div className="mb-2 md:mb-4 text-center md:text-left">
        <h1 className="text-xl md:text-2xl font-semibold truncate">{sessionDetails.title}</h1>
        <p className="text-xs md:text-sm text-muted-foreground">
          Candidate: {isInterviewer ? otherParticipant.name : selfParticipant.name}
          <span className="mx-2 hidden md:inline">|</span>
          <span className="block md:inline">Current Time: {format(currentTime, 'p')}</span>
        </p>
      </div>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-4 overflow-hidden">
        <div className="lg:col-span-2 bg-black rounded-lg flex flex-col p-1 md:p-2 relative shadow-2xl justify-between overflow-hidden">
          <div className="w-full aspect-video bg-slate-800 rounded-md flex items-center justify-center text-slate-400 relative overflow-hidden mb-1 md:mb-2 flex-grow">
            <video ref={mainVideoRef} className={cn("w-full h-full object-contain", !mainFeedIsActive && "hidden" )} autoPlay playsInline muted={activeStreamType !== 'camera' && activeStreamType !== 'screen'} />
            {!mainFeedIsActive && (
                <div className="text-center p-4">
                    <VideoOff className="h-12 w-12 md:h-16 md:w-16 text-slate-500 mx-auto mb-2"/>
                    <p className="text-sm md:text-base">{mainFeedName}</p>
                </div>
            )}
            {activeStreamType === 'camera' && !cameraStream && hasCameraPermission === false && <Alert variant="destructive" className="m-2 md:m-4 max-w-xs md:max-w-sm text-xs md:text-sm"><AlertTriangle className="h-4 w-4" /> <AlertTitle>Camera Permission Denied</AlertTitle><AlertDescription>Please enable camera access.</AlertDescription></Alert>}
            {activeStreamType === 'screen' && !screenStream && hasScreenPermission === false && <Alert variant="destructive" className="m-2 md:m-4 max-w-xs md:max-w-sm text-xs md:text-sm"><AlertTriangle className="h-4 w-4" /> <AlertTitle>Screen Share Denied</AlertTitle><AlertDescription>Please grant permission.</AlertDescription></Alert>}

            <p className="absolute bottom-1 md:bottom-2 left-1 md:left-2 text-[10px] md:text-xs bg-black/50 px-1 py-0.5 md:px-1.5 md:py-0.5 rounded text-white">
                {mainFeedName}
            </p>

            <div className="absolute top-1 right-1 md:top-2 md:right-2 w-24 h-auto md:w-32 lg:w-40 aspect-video bg-slate-700 rounded shadow-md overflow-hidden border border-slate-600">
              <video ref={selfVideoRef} className={cn("w-full h-full object-cover", !isVideoActive && "hidden")} autoPlay playsInline muted />
              { !isVideoActive && (
                <div className="w-full h-full flex items-center justify-center">
                    <VideoOff className="h-5 w-5 md:h-6 md:w-6 text-slate-400"/>
                </div>
              )}
              <p className="absolute bottom-0.5 left-0.5 md:bottom-1 md:left-1 text-[8px] md:text-[10px] bg-black/50 px-0.5 py-px md:px-1 md:py-0.5 rounded text-white">You</p>
            </div>
          </div>

          <div className="flex justify-center items-center gap-1 md:gap-2 p-1 md:p-2 bg-slate-800/50 backdrop-blur-sm rounded-md">
            <Button variant={isMicMuted ? "destructive" : "outline"} size="icon" onClick={handleToggleMic} title={isMicMuted ? "Unmute" : "Mute"} className="bg-white/10 text-white hover:bg-white/20 border-white/20 h-9 w-9 md:h-10 md:w-10"> <Mic className={cn("h-4 w-4 md:h-5 md:w-5", isMicMuted && "text-red-400")} /></Button>
            <Button variant={!isVideoActive ? "destructive" : "outline"} size="icon" onClick={handleToggleVideo} title={isVideoActive ? "Stop Video" : "Start Video"} className="bg-white/10 text-white hover:bg-white/20 border-white/20 h-9 w-9 md:h-10 md:w-10"><VideoIcon className="h-4 w-4 md:h-5 md:w-5" /></Button>
            <Button variant={activeStreamType === 'screen' ? "default" : "outline"} size="icon" onClick={handleToggleScreenShare} className={cn("bg-white/10 text-white hover:bg-white/20 border-white/20 h-9 w-9 md:h-10 md:w-10", activeStreamType === 'screen' && "bg-green-500 hover:bg-green-600 border-green-600")} title={activeStreamType === 'screen' ? "Stop Sharing" : "Share Screen"}><ScreenShare className="h-4 w-4 md:h-5 md:w-5" /></Button>
            {browserSupportsRecording && (
              <Button variant={isRecording ? "destructive" : "outline"} size="icon" onClick={isRecording ? stopRecording : startRecording} title={isRecording ? "Stop Recording" : "Start Recording"} className="bg-white/10 text-white hover:bg-white/20 border-white/20 h-9 w-9 md:h-10 md:w-10">
                {isRecording ? <Square className="h-4 w-4 md:h-5 md:w-5 animate-pulse text-red-400 fill-current" /> : <Radio className="h-4 w-4 md:h-5 md:w-5 text-red-400" />}
              </Button>
            )}
            <Button variant="destructive" size="default" onClick={handleEndCall} className="px-2 py-1 md:px-3 md:py-2 text-xs md:text-sm h-9 md:h-10"><PhoneOff className="mr-0 md:mr-1 h-4 w-4 md:h-5 md:w-5" /> <span className="hidden md:inline">End</span></Button>
          </div>
        </div>

        <Card className="flex flex-col shadow-lg bg-card text-card-foreground rounded-lg overflow-hidden max-h-full">
          <Accordion 
            type="multiple" 
            value={openAccordionItems}
            onValueChange={setOpenAccordionItems}
            className="w-full flex-grow flex flex-col overflow-hidden"
          >
            {isInterviewer && sessionDetails?.preSelectedQuestions && sessionDetails.preSelectedQuestions.length > 0 && (
              <AccordionItem value="interview-questions" className="border-b">
                <AccordionTrigger className="px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm font-medium hover:bg-secondary/50">
                    <div className="flex items-center gap-1 md:gap-2"><ListChecks className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary"/>Interview Questions</div>
                </AccordionTrigger>
                <AccordionContent className="px-3 py-2 md:px-4 md:pb-3 space-y-1 md:space-y-2 text-xs md:text-sm">
                   <Button size="xs" variant="outline" onClick={resetAskedQuestions} className="mb-2 text-[10px] h-6"><RotateCcw className="mr-1 h-3 w-3"/> Reset Asked</Button>
                  {sessionDetails.preSelectedQuestions.filter(q => !askedQuestions.has(q.id)).length > 0 ? (
                    <ScrollArea className="h-28 md:h-32 mt-1 p-0.5 border rounded-md bg-secondary/20">
                      <ul className="space-y-0.5">
                        {sessionDetails.preSelectedQuestions.filter(q => !askedQuestions.has(q.id)).map((q) => (
                          <li key={q.id} className="text-[10px] md:text-xs p-1 md:p-1.5 rounded hover:bg-primary/10 flex justify-between items-center group">
                            <span className="flex-1 mr-1 truncate" title={q.questionText}>{q.questionText} {q.category && <span className="text-[9px] md:text-[10px] text-muted-foreground">({q.category})</span>}</span>
                            <Button variant="ghost" size="xs" className="h-auto p-px md:p-0.5 text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => markQuestionAsAsked(q.id)}>Ask</Button>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  ) : <p className="text-[10px] md:text-xs text-muted-foreground text-center py-1 md:py-2">All pre-selected questions asked or none available.</p>}

                  {askedQuestions.size > 0 && (
                    <div className="mt-2">
                        <h4 className="text-[10px] md:text-xs font-semibold text-muted-foreground mb-0.5">Asked Questions:</h4>
                        <ScrollArea className="h-16 md:h-20 p-0.5 border rounded-md bg-background">
                             <ul className="space-y-0.5">
                                {Array.from(askedQuestions).map(qid => {
                                    const q = sessionDetails.preSelectedQuestions?.find(pq => pq.id === qid);
                                    return q ? <li key={qid} className="text-[10px] md:text-xs p-1 rounded text-muted-foreground line-through truncate" title={q.questionText}>{q.questionText}</li> : null;
                                })}
                            </ul>
                        </ScrollArea>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            )}
            <AccordionItem value="chat" className="border-b flex-grow flex flex-col overflow-hidden min-h-[150px] md:min-h-[200px]">
              <AccordionTrigger className="px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm font-medium hover:bg-secondary/50">
                <div className="flex items-center gap-1 md:gap-2"><ChatIcon className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary"/>Chat</div>
              </AccordionTrigger>
              <AccordionContent className="px-0 pt-0 pb-0 flex-grow flex flex-col overflow-hidden">
                 <ScrollArea className="flex-grow p-2 md:p-3">
                  <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className={cn("p-1.5 md:p-2 rounded-md max-w-[90%]", msg.user === selfParticipant.name ? "bg-primary/80 text-primary-foreground ml-auto text-right" : "bg-muted text-muted-foreground")}>
                        <span className="font-semibold block text-[10px] md:text-xs">{msg.user === selfParticipant.name ? "You" : msg.user}</span>
                        {msg.text}
                      </div>
                    ))}
                    {chatMessages.length === 0 && <p className="text-center text-muted-foreground py-2 md:py-4">Chat messages appear here.</p>}
                  </div>
                </ScrollArea>
                <div className="p-2 md:p-3 border-t mt-auto">
                  <div className="flex w-full gap-1 md:gap-1.5">
                    <Input placeholder="Type message..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendChatMessage()} className="h-8 md:h-9 text-xs md:text-sm"/>
                    <Button size="icon" onClick={handleSendChatMessage} className="h-8 w-8 md:h-9 md:w-9 shrink-0"><Send className="h-3.5 w-3.5 md:h-4 md:w-4"/></Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="participants" className="border-b-0">
              <AccordionTrigger className="px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm font-medium hover:bg-secondary/50">
                 <div className="flex items-center gap-1 md:gap-2"><ParticipantsIcon className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary"/>Participants ({sessionDetails.participants.length})</div>
              </AccordionTrigger>
              <AccordionContent className="px-3 py-2 md:px-4 md:pb-3">
                <ul className="space-y-1 md:space-y-1.5 text-xs md:text-sm">
                  {sessionDetails.participants.map(p => (
                    <li key={p.userId} className="flex items-center gap-1.5 md:gap-2 p-1 rounded hover:bg-secondary/30">
                      <img src={p.profilePictureUrl || `https://avatar.vercel.sh/${p.userId}.png`} alt={p.name} className="h-5 w-5 md:h-6 md:w-6 rounded-full" data-ai-hint="person avatar"/>
                      <span>{p.name} <span className="text-muted-foreground/80 text-[10px] md:text-xs">({p.role})</span></span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </div>
      {audioURL && (
        <div className="fixed bottom-16 right-2 md:bottom-4 md:right-4 z-50 bg-card p-1.5 md:p-2 rounded shadow-lg border flex items-center gap-1 md:gap-2">
            <audio src={audioURL} controls className="h-7 md:h-8 w-40 md:w-auto"/>
            {localRecordingReferences.length > 0 && 
              <a href={localRecordingReferences[localRecordingReferences.length -1].blobUrl} download={localRecordingReferences[localRecordingReferences.length -1].fileName}>
                <Button variant="outline" size="icon" title="Download Recording" className="h-7 w-7 md:h-8 md:w-8"><DownloadIcon className="h-3.5 w-3.5 md:h-4 md:w-4"/></Button>
              </a>
            }
        </div>
      )}
    </div>
  );
}
