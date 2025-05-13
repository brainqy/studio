
"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Bot, Maximize, Minimize, Settings2 } from "lucide-react"; 
import { useToast } from '@/hooks/use-toast';
import type { 
  MockInterviewStepId, 
  GenerateMockInterviewQuestionsInput, 
  MockInterviewSession, 
  MockInterviewQuestion,
  EvaluateInterviewAnswerInput,
  GenerateOverallInterviewFeedbackInput,
  GenerateOverallInterviewFeedbackOutput 
} from '@/types';
import { MOCK_INTERVIEW_STEPS } from '@/types';
import AiMockInterviewStepper from '@/components/features/ai-mock-interview/AiMockInterviewStepper';
import StepSetup from '@/components/features/ai-mock-interview/StepSetup';
import StepInterview from '@/components/features/ai-mock-interview/StepInterview';
import StepFeedback from '@/components/features/ai-mock-interview/StepFeedback';
import { sampleUserProfile } from '@/lib/sample-data';
import { generateMockInterviewQuestions } from '@/ai/flows/generate-mock-interview-questions';
import { evaluateInterviewAnswer } from '@/ai/flows/evaluate-interview-answer';
import { generateOverallInterviewFeedback } from '@/ai/flows/generate-overall-interview-feedback';
import { cn } from '@/lib/utils';
import { useSearchParams, useRouter } from 'next/navigation';


export default function AiMockInterviewPage() {
  const [currentUiStepId, setCurrentUiStepId] = useState<MockInterviewStepId>('setup');
  const [interviewConfig, setInterviewConfig] = useState<GenerateMockInterviewQuestionsInput | null>(null);
  const [session, setSession] = useState<MockInterviewSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false); 
  const [isEvaluatingAnswer, setIsEvaluatingAnswer] = useState(false); 

  const { toast } = useToast();
  const currentUser = sampleUserProfile;
  const searchParams = useSearchParams();
  const router = useRouter();

  const contentRef = useRef<HTMLDivElement>(null);
  const [isInterviewFullScreen, setIsInterviewFullScreen] = useState(false);

  // Initialize interview from query params if present (redirected from hub)
  useEffect(() => {
    const topic = searchParams.get('topic');
    if (topic && !session) { // Only if topic is present and session not already started
      const jobDescription = searchParams.get('jobDescription') || undefined;
      const numQuestions = parseInt(searchParams.get('numQuestions') || '5', 10);
      const difficulty = (searchParams.get('difficulty') as GenerateMockInterviewQuestionsInput['difficulty']) || 'medium';
      const timerPerQuestion = parseInt(searchParams.get('timerPerQuestion') || '0', 10);
      const categoriesParam = searchParams.get('categories');
      const questionCategories = categoriesParam ? categoriesParam.split(',') as GenerateMockInterviewQuestionsInput['questionCategories'] : undefined;

      const initialConfig: GenerateMockInterviewQuestionsInput = {
        topic,
        jobDescription,
        numQuestions,
        difficulty,
        timerPerQuestion: timerPerQuestion === 0 ? undefined : timerPerQuestion,
        questionCategories,
      };
      handleSetupComplete(initialConfig);
    }
  }, [searchParams, session]); // Added session to dependency to prevent re-triggering

  // Fullscreen logic
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsInterviewFullScreen(!!document.fullscreenElement);
    };
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

  // Auto-fullscreen when interview step starts and query param is set
  useEffect(() => {
    if (currentUiStepId === 'interview' && searchParams.get('autoFullScreen') === 'true' && !isInterviewFullScreen) {
      if (contentRef.current && !document.fullscreenElement) {
        contentRef.current.requestFullscreen().catch(err => {
          // Silently fail or show a less intrusive notification if auto-fullscreen fails
          console.warn("Auto-fullscreen failed:", err.message);
        });
      }
    }
  }, [currentUiStepId, searchParams, isInterviewFullScreen]);


  const handleSetupComplete = async (config: GenerateMockInterviewQuestionsInput) => {
    setIsLoading(true);
    setInterviewConfig(config);
    try {
      const { questions } = await generateMockInterviewQuestions(config);
      if (questions.length === 0) {
        toast({ title: "No Questions Generated", description: "The AI could not generate any questions for this topic. Please try adjusting your setup.", variant: "destructive", duration: 7000 });
        setIsLoading(false);
        setCurrentUiStepId('setup'); // Go back to setup
        router.replace('/ai-mock-interview', undefined); // Clear query params
        return;
      }
      const newSession: MockInterviewSession = {
        id: `session-${Date.now()}`,
        userId: currentUser.id,
        topic: config.topic,
        jobDescription: config.jobDescription,
        questions: questions,
        answers: [],
        status: 'in-progress',
        createdAt: new Date().toISOString(),
        timerPerQuestion: config.timerPerQuestion, 
        difficulty: config.difficulty,
        questionCategories: config.questionCategories,
      };
      setSession(newSession);
      setCurrentQuestionIndex(0);
      setCurrentUiStepId('interview');
      toast({ title: "Interview Ready!", description: `${questions.length} questions generated. Let's begin!` });
    } catch (error) {
      console.error("Error generating questions:", error);
      toast({ title: "Setup Failed", description: "Could not generate interview questions.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = async (userAnswer: string, isRecording?: boolean) => {
    if (!session || !session.questions) return;
    
    setIsEvaluatingAnswer(true);
    const currentQuestion = session.questions[currentQuestionIndex];

    try {
      const evaluationInput: EvaluateInterviewAnswerInput = {
        questionText: currentQuestion.questionText,
        userAnswer,
        topic: session.topic,
        jobDescription: session.jobDescription,
      };
      const evaluationResult = await evaluateInterviewAnswer(evaluationInput);

      setSession(prevSession => {
        if (!prevSession) return null;
        const updatedAnswers = [
          ...(prevSession.answers || []),
          {
            questionId: currentQuestion.id,
            questionText: currentQuestion.questionText,
            userAnswer,
            aiFeedback: evaluationResult.feedback,
            aiScore: evaluationResult.score,
            isRecording, 
            ...(evaluationResult.strengths && {strengths: evaluationResult.strengths}),
            ...(evaluationResult.areasForImprovement && {areasForImprovement: evaluationResult.areasForImprovement}),
            ...(evaluationResult.suggestedImprovements && {suggestedImprovements: evaluationResult.suggestedImprovements}),
          }
        ];
        return { ...prevSession, answers: updatedAnswers };
      });

      if (currentQuestionIndex < session.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        
        await handleCompleteInterview();
      }
    } catch (error) {
      console.error("Error evaluating answer:", error);
      toast({ title: "Evaluation Failed", description: "Could not evaluate your answer.", variant: "destructive" });
    } finally {
      setIsEvaluatingAnswer(false);
    }
  };
  
  const handleCompleteInterview = async () => {
    if (!session || !session.answers || session.answers.length === 0) {
      toast({ title: "Interview Not Completed", description: "No answers recorded to generate feedback.", variant: "destructive" });
      setCurrentUiStepId('setup'); 
      router.replace('/ai-mock-interview', undefined); // Clear query params
      return;
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
    } catch (error) {
        console.error("Error generating overall feedback:", error);
        toast({ title: "Feedback Generation Failed", description: "Could not generate overall interview feedback.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  const handleRestartInterview = () => {
    setCurrentUiStepId('setup');
    setInterviewConfig(null);
    setSession(null);
    setCurrentQuestionIndex(0);
    setIsLoading(false);
    setIsEvaluatingAnswer(false);
    if (isInterviewFullScreen && document.fullscreenElement) {
      document.exitFullscreen();
    }
    router.replace('/ai-mock-interview', undefined); // Clear query params
  };

  const renderCurrentStep = () => {
    switch (currentUiStepId) {
      case 'setup':
        return <StepSetup onSetupComplete={handleSetupComplete} isLoading={isLoading} />;
      case 'interview':
        if (!session || !session.questions) return <p>Error: Interview session not initialized.</p>;
        return (
          <StepInterview 
            questions={session.questions} 
            currentQuestionIndex={currentQuestionIndex}
            onAnswerSubmit={handleAnswerSubmit}
            onCompleteInterview={handleCompleteInterview} 
            isEvaluating={isEvaluatingAnswer}
            timerPerQuestion={session.timerPerQuestion} 
          />
        );
      case 'feedback':
        if (!session) return <p>Error: Interview session data not available for feedback.</p>;
        return <StepFeedback session={session} onRestart={handleRestartInterview} />;
      default:
        return <p>Invalid step.</p>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Bot className="h-8 w-8 text-primary" /> AI Mock Interview
            </CardTitle>
            <CardDescription>
              Practice your interviewing skills with AI-generated questions and feedback.
              {MOCK_INTERVIEW_STEPS.find(s => s.id === currentUiStepId)?.description}
            </CardDescription>
          </div>
          {currentUiStepId === 'interview' && (
            <Button onClick={toggleInterviewFullScreen} variant="outline" size="icon" title={isInterviewFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
              {isInterviewFullScreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
          )}
        </CardHeader>
      </Card>

      <div className={cn(
          "grid gap-8 items-start",
          currentUiStepId === 'interview' && isInterviewFullScreen ? "grid-cols-1" : "md:grid-cols-[200px_1fr]"
        )}>
        <div className={cn(
            "sticky top-24",
            currentUiStepId === 'interview' && isInterviewFullScreen && "hidden" 
          )}>
          <AiMockInterviewStepper currentStep={currentUiStepId} />
        </div>
        
        <div ref={contentRef} className={cn(currentUiStepId === 'interview' && isInterviewFullScreen ? "bg-background p-4" : "")}>
          <Card className={cn("shadow-lg min-h-[400px]", currentUiStepId === 'interview' && isInterviewFullScreen && "border-0 shadow-none")}>
            <CardContent className="p-6">
              {isLoading && currentUiStepId !== 'interview' && !isEvaluatingAnswer ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="mt-3 text-muted-foreground">Loading, please wait...</p>
                </div>
              ) : (
                renderCurrentStep()
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
