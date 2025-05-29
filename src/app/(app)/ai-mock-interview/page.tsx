
"use client";

import type React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, Bot, Maximize, Minimize, Settings2, Mic, Square, Video as VideoIcon, VideoOff, Send, MessageSquare, ListChecks, RefreshCw, Share2 } from "lucide-react"; 
import { useToast } from '@/hooks/use-toast';
import type { 
  MockInterviewStepId, 
  GenerateMockInterviewQuestionsInput, 
  MockInterviewSession, 
  MockInterviewQuestion,
  EvaluateInterviewAnswerInput,
  GenerateOverallInterviewFeedbackInput,
  GenerateOverallInterviewFeedbackOutput,
  MockInterviewAnswer,
  RecordingReference
} from '@/types';
import { MOCK_INTERVIEW_STEPS } from '@/types';
import AiMockInterviewStepper from '@/components/features/ai-mock-interview/AiMockInterviewStepper';
import StepSetup from '@/components/features/ai-mock-interview/StepSetup';
import StepFeedback from '@/components/features/ai-mock-interview/StepFeedback';
import { sampleUserProfile, sampleCommunityPosts } from '@/lib/sample-data';
import { generateMockInterviewQuestions } from '@/ai/flows/generate-mock-interview-questions';
import { evaluateInterviewAnswer } from '@/ai/flows/evaluate-interview-answer';
import { generateOverallInterviewFeedback } from '@/ai/flows/generate-overall-interview-feedback';
import { cn } from '@/lib/utils';
import { useSearchParams, useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const logger = {
  info: (message: string, ...args: any[]) => console.log(`[AIMockInterviewPage INFO] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[AIMockInterviewPage ERROR] ${message}`, ...args),
};

export default function AiMockInterviewPage() {
  const [currentUiStepId, setCurrentUiStepId] = useState<MockInterviewStepId>('setup');
  const [session, setSession] = useState<MockInterviewSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false); 
  const [isEvaluatingAnswer, setIsEvaluatingAnswer] = useState(false); 
  const [userAnswer, setUserAnswer] = useState('');
  const [currentAnswerFeedback, setCurrentAnswerFeedback] = useState<MockInterviewAnswer | null>(null);

  const { toast } = useToast();
  const currentUser = sampleUserProfile;
  const searchParams = useSearchParams();
  const router = useRouter();

  const contentRef = useRef<HTMLDivElement>(null);
  const [isInterviewFullScreen, setIsInterviewFullScreen] = useState(false);

  // Media states
  const selfVideoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);

  // Recording states
  const [isRecordingAnswer, setIsRecordingAnswer] = useState(false); // For speech-to-text
  const [isSessionRecording, setIsSessionRecording] = useState(false); // For overall session recording
  const [speechApiSupported, setSpeechApiSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [browserSupportsMediaRecording, setBrowserSupportsMediaRecording] = useState(true);


  // Timer State
  const [timeLeft, setTimeLeft] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = useMemo(() => {
    return session?.questions?.[currentQuestionIndex];
  }, [session, currentQuestionIndex]);


  // Initialize SpeechRecognition API
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setSpeechApiSupported(false);
      logger.info("Speech Recognition API not supported in this browser.");
      return;
    }
    recognitionRef.current = new SpeechRecognitionAPI();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setUserAnswer(prev => prev + finalTranscript.trim() + ' '); // Append final transcript
    };
    recognitionRef.current.onerror = (event: any) => {
      logger.error('Speech recognition error', event.error);
      toast({ title: "Speech Error", description: `Error: ${event.error}. Please try typing.`, variant: "destructive" });
      setIsRecordingAnswer(false);
    };
    recognitionRef.current.onend = () => {
      setIsRecordingAnswer(false); // Ensure recording state is reset
    };
  }, [toast]);

  // Initialize MediaRecorder check
   useEffect(() => {
    if (typeof window !== 'undefined' && (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder)) {
      setBrowserSupportsMediaRecording(false);
      logger.info("MediaRecorder API or getUserMedia not supported. Overall session recording disabled.");
    }
  }, []);


  const stopAllStreams = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      logger.info("Camera stream stopped.");
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      logger.info("MediaRecorder stream stopped.");
    }
    setIsVideoActive(false);
    setIsRecordingAnswer(false);
    setIsSessionRecording(false);
  }, [cameraStream]);

  // Initialize based on query params
  useEffect(() => {
    const topic = searchParams.get('topic');
    if (topic && !session) { 
      const initialConfig: GenerateMockInterviewQuestionsInput = {
        topic,
        jobDescription: searchParams.get('jobDescription') || undefined,
        numQuestions: parseInt(searchParams.get('numQuestions') || '5', 10),
        difficulty: (searchParams.get('difficulty') as GenerateMockInterviewQuestionsInput['difficulty']) || 'medium',
        timerPerQuestion: parseInt(searchParams.get('timerPerQuestion') || '0', 10) || undefined,
        questionCategories: searchParams.get('categories')?.split(',') as InterviewQuestionCategory[] | undefined,
      };
      handleSetupComplete(initialConfig);
      if (searchParams.get('autoFullScreen') === 'true' && contentRef.current && !document.fullscreenElement) {
        contentRef.current.requestFullscreen().catch(err => {
          logger.info("Auto-fullscreen failed on initial load:", err.message);
        });
      }
    }
    return () => {
      stopAllStreams(); // Cleanup on unmount
    }
  }, [searchParams]); // Removed session from deps to avoid re-trigger if session is set by handleSetupComplete

  // Fullscreen logic
  useEffect(() => {
    const handleFullscreenChange = () => setIsInterviewFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  const toggleInterviewFullScreen = () => {
    if (!contentRef.current) return;
    if (!document.fullscreenElement) {
      contentRef.current.requestFullscreen().catch(err => {
        toast({ title: "Fullscreen Error", description: `Could not enter fullscreen: ${err.message}`, variant: "destructive" });
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Timer logic
  useEffect(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (currentQuestion && session?.timerPerQuestion && session.timerPerQuestion > 0 && timeLeft > 0 && !isEvaluatingAnswer && currentUiStepId === 'interview') {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerIntervalRef.current!);
            toast({ title: "Time's Up!", description: "Please submit your answer.", variant: "default" });
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [timeLeft, session?.timerPerQuestion, isEvaluatingAnswer, currentUiStepId, currentQuestion]);

  const handleSetupComplete = async (config: GenerateMockInterviewQuestionsInput) => {
    setIsLoading(true);
    setCurrentAnswerFeedback(null); 
    try {
      logger.info("Requesting interview questions with config:", config);
      const { questions: genQuestions } = await generateMockInterviewQuestions(config);
      logger.info("Received questions from AI:", genQuestions);

      if (!genQuestions || genQuestions.length === 0) {
        toast({ title: "Setup Failed", description: "The AI could not generate any questions for this topic/JD. Please try adjusting your setup or ensure the topic is specific enough.", variant: "destructive", duration: 7000 });
        setIsLoading(false);
        setCurrentUiStepId('setup'); 
        router.replace('/ai-mock-interview', undefined);
        return;
      }

      const newSession: MockInterviewSession = {
        id: `session-ai-${Date.now()}`,
        userId: currentUser.id,
        topic: config.topic,
        jobDescription: config.jobDescription,
        questions: genQuestions,
        answers: [],
        status: 'in-progress',
        createdAt: new Date().toISOString(),
        timerPerQuestion: config.timerPerQuestion, 
        difficulty: config.difficulty,
        questionCategories: config.questionCategories,
      };
      setSession(newSession);
      setCurrentQuestionIndex(0);
      setUserAnswer('');
      if (config.timerPerQuestion && config.timerPerQuestion > 0) {
        setTimeLeft(config.timerPerQuestion);
      } else {
        setTimeLeft(0);
      }
      setCurrentUiStepId('interview');
      toast({ title: "Interview Ready!", description: `${genQuestions.length} questions generated. Let's begin!` });
      
      // Attempt to start camera after setup is complete and UI is about to switch
      if (selfVideoRef.current) { // Check if ref is available
        await startVideoStream();
      }

    } catch (error: any) {
      logger.error("Error during setup or question generation:", error);
      toast({ title: "Setup Failed", description: error.message || "Could not generate interview questions.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!session || !currentQuestion || !userAnswer.trim() || isEvaluatingAnswer) return;
    
    setIsEvaluatingAnswer(true);
    setCurrentAnswerFeedback(null);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); // Stop timer during evaluation

    try {
      const evaluationInput: EvaluateInterviewAnswerInput = {
        questionText: currentQuestion.questionText,
        userAnswer,
        topic: session.topic,
        jobDescription: session.jobDescription,
      };
      const evaluationResult = await evaluateInterviewAnswer(evaluationInput);

      const newAnswer: MockInterviewAnswer = {
        questionId: currentQuestion.id,
        questionText: currentQuestion.questionText,
        userAnswer,
        aiFeedback: evaluationResult.feedback,
        aiScore: evaluationResult.score,
        strengths: evaluationResult.strengths,
        areasForImprovement: evaluationResult.areasForImprovement,
        suggestedImprovements: evaluationResult.suggestedImprovements,
      };
      
      setSession(prevSession => {
        if (!prevSession) return null;
        return { ...prevSession, answers: [...prevSession.answers, newAnswer] };
      });
      setCurrentAnswerFeedback(newAnswer); // Display feedback for current question

    } catch (error: any) {
      logger.error("Error evaluating answer:", error);
      toast({ title: "Evaluation Failed", description: error.message || "Could not evaluate your answer.", variant: "destructive" });
      // Allow user to try submitting again or skip
    } finally {
      setIsEvaluatingAnswer(false);
      // Timer will restart via useEffect if next question is loaded
    }
  };

  const handleNextQuestion = () => {
    if (!session || currentQuestionIndex >= session.questions.length - 1) {
        handleCompleteInterview();
        return;
    }
    setCurrentQuestionIndex(prev => prev + 1);
    setUserAnswer('');
    setCurrentAnswerFeedback(null);
    if (session.timerPerQuestion && session.timerPerQuestion > 0) {
        setTimeLeft(session.timerPerQuestion);
    }
  };
  
  const handleCompleteInterview = async () => {
    if (!session || !session.answers) {
      toast({ title: "Interview Issue", description: "No session data or answers recorded.", variant: "destructive" });
      setCurrentUiStepId('setup'); 
      router.replace('/ai-mock-interview', undefined);
      return;
    }
     if (session.answers.length === 0 && session.questions.length > 0) {
      toast({ title: "No Answers Provided", description: "Please answer at least one question to get overall feedback.", variant: "warning" });
      return; // Don't proceed if no answers given for a session with questions
    }


    setIsLoading(true); 
    try {
       const feedbackInput: GenerateOverallInterviewFeedbackInput = {
        topic: session.topic,
        jobDescription: session.jobDescription,
        evaluatedAnswers: session.answers.map(a => ({
            questionText: a.questionText,
            userAnswer: a.userAnswer,
            feedback: a.aiFeedback || "N/A",
            score: a.aiScore || 0,
        })),
      };
      const overallFeedbackResult = await generateOverallInterviewFeedback(feedbackInput);
      setSession(prevSession => prevSession ? ({
        ...prevSession,
        overallFeedback: overallFeedbackResult as GenerateOverallInterviewFeedbackOutput, 
        overallScore: overallFeedbackResult.overallScore,
        status: 'completed'
      }) : null);
      setCurrentUiStepId('feedback');
      toast({ title: "Interview Complete!", description: "Your overall feedback is ready." });
      if (isInterviewFullScreen && document.fullscreenElement) {
        document.exitFullscreen();
      }
      stopAllStreams();
    } catch (error: any) {
        logger.error("Error generating overall feedback:", error);
        toast({ title: "Feedback Generation Failed", description: error.message || "Could not generate overall interview feedback.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  const handleRestartInterview = () => {
    setCurrentUiStepId('setup');
    setSession(null);
    setCurrentQuestionIndex(0);
    setIsLoading(false);
    setIsEvaluatingAnswer(false);
    setUserAnswer('');
    setCurrentAnswerFeedback(null);
    setTimeLeft(0);
    stopAllStreams();
    if (isInterviewFullScreen && document.fullscreenElement) {
      document.exitFullscreen();
    }
    router.replace('/ai-mock-interview', undefined); 
  };

  // Media Handling
  const startVideoStream = useCallback(async () => {
    logger.info("Attempting to start video stream...");
    if (!navigator.mediaDevices?.getUserMedia) {
      setHasCameraPermission(false);
      setIsVideoActive(false);
      toast({ title: "Camera Error", description: "Camera access not supported.", variant: "destructive" });
      return null;
    }
    try {
      if (cameraStream) stopAllStreams(); // Stop existing before starting new
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: !isMicMuted });
      setCameraStream(stream);
      if (selfVideoRef.current) selfVideoRef.current.srcObject = stream;
      setHasCameraPermission(true);
      setIsVideoActive(true);
      logger.info("Video stream started.");
      return stream;
    } catch (err) {
      logger.error("Error accessing camera:", err);
      setHasCameraPermission(false);
      setIsVideoActive(false);
      toast({ title: "Camera Access Denied", description: "Please enable camera permissions.", variant: "destructive" });
      return null;
    }
  }, [isMicMuted, toast, stopAllStreams, cameraStream]);

  const handleToggleVideo = async () => {
    if (isVideoActive) {
      stopAllStreams(); // Will set isVideoActive to false
    } else {
      await startVideoStream();
    }
  };

  const handleToggleMic = () => {
    const newMutedState = !isMicMuted;
    setIsMicMuted(newMutedState);
    if (cameraStream) {
      cameraStream.getAudioTracks().forEach(track => track.enabled = !newMutedState);
    }
    toast({ title: newMutedState ? "Mic Muted" : "Mic Unmuted", duration: 1500 });
  };
  
  const toggleSpeechRecording = () => {
    if (!speechApiSupported) {
      toast({ title: "Not Supported", description: "Speech recognition isn't supported here. Please type.", variant: "destructive" });
      return;
    }
    if (isRecordingAnswer) {
      recognitionRef.current?.stop();
      setIsRecordingAnswer(false);
    } else {
      // setUserAnswer(''); // Option: Clear text before new recording
      recognitionRef.current?.start();
      setIsRecordingAnswer(true);
    }
  };

  const toggleSessionRecording = async () => {
    if (!browserSupportsMediaRecording) {
        toast({ title: "Recording Not Supported", description: "Your browser does not support session recording.", variant: "destructive" });
        return;
    }
    if (isSessionRecording) {
        mediaRecorderRef.current?.stop();
        setIsSessionRecording(false);
    } else {
        let streamToRecord: MediaStream | null = null;
        if (cameraStream && cameraStream.getAudioTracks().length > 0 && !isMicMuted) {
            streamToRecord = new MediaStream(cameraStream.getAudioTracks()); // Record audio only for now
        } else {
            toast({ title: "No Audio", description: "Please enable your microphone to record the session.", variant: "warning" });
            return;
        }
        
        try {
            mediaRecorderRef.current = new MediaRecorder(streamToRecord);
            recordedChunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) recordedChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.onstop = () => {
                const recordedBlob = new Blob(recordedChunksRef.current, { type: 'audio/webm' }); // Adjust type if video
                const url = URL.createObjectURL(recordedBlob);
                const newRecRef: RecordingReference = { id: `rec-${Date.now()}`, sessionId: session!.id, startTime: new Date().toISOString(), durationSeconds: 0, localStorageKey: `rec-${session!.id}-${Date.now()}`, type: 'audio', blobUrl: url, fileName: `ai_mock_interview_${session!.id}.webm` };
                setSession(s => s ? ({ ...s, recordingReferences: [...(s.recordingReferences || []), newRecRef] }) : null);
                toast({ title: "Recording Saved (Mock)", description: "Audio recording available in session details (mock)." });
            };
            mediaRecorderRef.current.start();
            setIsSessionRecording(true);
            toast({ title: "Session Recording Started" });
        } catch (err) {
            logger.error("MediaRecorder init error:", err);
            toast({ title: "Recording Error", description: "Could not start session recording.", variant: "destructive" });
        }
    }
  };


  const renderCurrentStep = () => {
    if (currentUiStepId === 'setup') {
      return <StepSetup onSetupComplete={handleSetupComplete} isLoading={isLoading} />;
    }
    if (currentUiStepId === 'interview' && session && currentQuestion) {
      const progressPercentage = ((currentQuestionIndex + 1) / session.questions.length) * 100;
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
          {/* Main Video/Interaction Area */}
          <div className="lg:col-span-2 bg-slate-800 rounded-lg flex flex-col p-2 relative shadow-xl justify-between">
            {/* AI Placeholder / Question context */}
            <div className="w-full aspect-video bg-slate-700 rounded-md flex items-center justify-center text-slate-300 relative overflow-hidden mb-2 flex-grow">
              <Bot className="h-16 w-16 text-slate-400" />
              <p className="ml-3 text-lg">AI Interviewer</p>
              {/* Could display currentQuestion.questionText here for main view */}
            </div>
            {/* Self-View */}
            <div className="absolute top-2 right-2 w-32 md:w-40 aspect-video bg-slate-700 rounded shadow-md overflow-hidden border border-slate-600">
              <video ref={selfVideoRef} className={cn("w-full h-full object-cover", !isVideoActive && "hidden")} autoPlay playsInline muted />
              {!isVideoActive && <div className="w-full h-full flex items-center justify-center"><VideoOff className="h-6 w-6 text-slate-400"/></div>}
              <p className="absolute bottom-1 left-1 text-[10px] bg-black/50 px-1 py-0.5 rounded text-white">{currentUser.name} (You)</p>
            </div>
             {/* Controls */}
            <div className="flex justify-center items-center gap-2 p-2 bg-slate-900/70 backdrop-blur-sm rounded-md">
              <Button variant={isMicMuted ? "destructive" : "outline"} size="icon" onClick={handleToggleMic} title={isMicMuted ? "Unmute" : "Mute"} className="bg-white/10 hover:bg-white/20 border-white/20 text-white"><Mic className="h-5 w-5" /></Button>
              <Button variant={!isVideoActive ? "destructive" : "outline"} size="icon" onClick={handleToggleVideo} title={isVideoActive ? "Stop Video" : "Start Video"} className="bg-white/10 hover:bg-white/20 border-white/20 text-white"><VideoIcon className="h-5 w-5" /></Button>
              <Button variant={isSessionRecording ? "destructive" : "outline"} size="icon" onClick={toggleSessionRecording} disabled={!browserSupportsMediaRecording} title={isSessionRecording ? "Stop Session Recording" : "Record Session (Audio)"} className="bg-white/10 hover:bg-white/20 border-white/20 text-white">
                {isSessionRecording ? <Square className="h-5 w-5 animate-pulse fill-current"/> : <Mic className="h-5 w-5 text-red-400"/>}
              </Button>
              <Button variant="destructive" size="default" onClick={handleCompleteInterview} className="px-3 py-2 text-sm"><VideoOff className="mr-1 h-5 w-5" /> End Interview</Button>
            </div>
          </div>

          {/* Right Sidebar: Question, Answer, Feedback */}
          <Card className="lg:col-span-1 flex flex-col shadow-xl max-h-full overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-md font-medium">Question {currentQuestionIndex + 1}/{session.questions.length}</CardTitle>
                    {session.timerPerQuestion && session.timerPerQuestion > 0 && <Label className="text-sm font-medium text-primary">{formatTime(timeLeft)}</Label>}
                </div>
                <Progress value={progressPercentage} className="w-full h-1.5 mt-1 [&>div]:bg-primary" />
            </CardHeader>
            <ScrollArea className="flex-grow">
              <CardContent className="space-y-3 pt-2">
                <div className="p-3 border rounded-md bg-secondary/40">
                  <p className="text-sm font-semibold text-foreground whitespace-pre-line">{currentQuestion.questionText}</p>
                  <p className="text-xs text-muted-foreground mt-1">Category: {currentQuestion.category} | Difficulty: {currentQuestion.difficulty}</p>
                </div>
                {!currentAnswerFeedback && (
                  <>
                    <div>
                      <Label htmlFor="userAnswer" className="text-sm">Your Answer:</Label>
                      <Textarea id="userAnswer" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} placeholder={isRecordingAnswer ? "Listening..." : "Type or record your answer..."} rows={5} disabled={isEvaluatingAnswer || isRecordingAnswer} className="mt-1"/>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={toggleSpeechRecording} disabled={!speechApiSupported || isEvaluatingAnswer} variant={isRecordingAnswer ? "secondary" : "outline"} className="flex-1">
                        {isRecordingAnswer ? <Square className="mr-1 h-4 w-4 animate-ping"/> : <Mic className="mr-1 h-4 w-4"/>} {isRecordingAnswer ? 'Stop' : 'Record'}
                      </Button>
                      <Button onClick={handleAnswerSubmit} disabled={!userAnswer.trim() || isEvaluatingAnswer} className="flex-1 bg-primary hover:bg-primary/90">
                        {isEvaluatingAnswer ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : <Send className="mr-1 h-4 w-4"/>} Submit
                      </Button>
                    </div>
                  </>
                )}
                {currentAnswerFeedback && (
                  <Card className="bg-primary/5 border-primary/20 p-3 space-y-2">
                    <h4 className="font-semibold text-primary text-sm">Feedback on Your Answer:</h4>
                    <p className="text-xs text-muted-foreground">Score: <span className="font-bold text-primary">{currentAnswerFeedback.aiScore}/100</span></p>
                    <p className="text-xs text-muted-foreground whitespace-pre-line">{currentAnswerFeedback.aiFeedback}</p>
                    {currentAnswerFeedback.strengths && currentAnswerFeedback.strengths.length > 0 && <p className="text-xs"><strong className="text-green-600">Strengths:</strong> {currentAnswerFeedback.strengths.join(', ')}</p>}
                    {currentAnswerFeedback.areasForImprovement && currentAnswerFeedback.areasForImprovement.length > 0 && <p className="text-xs"><strong className="text-yellow-600">Areas for Improvement:</strong> {currentAnswerFeedback.areasForImprovement.join(', ')}</p>}
                    <Button onClick={handleNextQuestion} className="w-full mt-2" size="sm">
                        {currentQuestionIndex < session.questions.length - 1 ? "Next Question" : "View Overall Report"}
                    </Button>
                  </Card>
                )}
                 {timeLeft === 0 && session.timerPerQuestion && session.timerPerQuestion > 0 && !isEvaluatingAnswer && !currentAnswerFeedback && (
                    <Alert variant="destructive" className="text-xs"><AlertDescription>Time's up! Please submit your current answer or click Next.</AlertDescription></Alert>
                )}
              </CardContent>
            </ScrollArea>
          </Card>
        </div>
      );
    }
    if (currentUiStepId === 'feedback' && session) {
      return <StepFeedback session={session} onRestart={handleRestartInterview} />;
    }
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-3 text-muted-foreground">Loading interview state...</p>
      </div>
    );
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <Card className="shadow-xl bg-card">
        <CardHeader className="flex flex-row justify-between items-center">
          <div className="flex-1">
            <CardTitle className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Bot className="h-6 w-6 md:h-7 md:w-7 text-primary" /> AI Mock Interview
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {MOCK_INTERVIEW_STEPS.find(s => s.id === currentUiStepId)?.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {currentUiStepId === 'interview' && (
                <Button onClick={toggleInterviewFullScreen} variant="outline" size="icon" title={isInterviewFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"} className="h-8 w-8">
                    {isInterviewFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
            )}
            {currentUiStepId !== 'setup' && (
                <Button onClick={handleRestartInterview} variant="outline" size="sm" className="text-xs"><RefreshCw className="mr-1 h-3 w-3"/>Restart</Button>
            )}
          </div>
        </CardHeader>
        {!(currentUiStepId === 'interview' && isInterviewFullScreen) && (
             <CardContent className="border-t pt-4">
                <AiMockInterviewStepper currentStep={currentUiStepId} />
             </CardContent>
        )}
      </Card>

      <div ref={contentRef} className={cn("transition-all duration-300", currentUiStepId === 'interview' && isInterviewFullScreen ? "fixed inset-0 z-50 bg-background p-2 md:p-4" : "relative")}>
          { (currentUiStepId === 'interview' && isInterviewFullScreen) ? renderCurrentStep() : (
            <Card className="shadow-lg min-h-[400px]">
                <CardContent className="p-4 md:p-6">
                {isLoading && currentUiStepId !== 'interview' ? (
                    <div className="flex flex-col items-center justify-center h-64">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="mt-3 text-muted-foreground">Loading, please wait...</p>
                    </div>
                ) : (
                    renderCurrentStep()
                )}
                </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
}

