"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Bot, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import type { 
  MockInterviewStepId, 
  GenerateMockInterviewQuestionsInput, 
  MockInterviewSession, 
  MockInterviewQuestion,
  EvaluateInterviewAnswerInput,
  GenerateOverallInterviewFeedbackInput
} from '@/types';
import { MOCK_INTERVIEW_STEPS } from '@/types';
import AiMockInterviewStepper from '@/components/features/ai-mock-interview/AiMockInterviewStepper';
import StepSetup from '@/components/features/ai-mock-interview/StepSetup';
import StepInterview from '@/components/features/ai-mock-interview/StepInterview';
import StepFeedback from '@/components/features/ai-mock-interview/StepFeedback';
import { sampleUserProfile } from '@/lib/sample-data';

// Import AI Flows
import { generateMockInterviewQuestions } from '@/ai/flows/generate-mock-interview-questions';
import { evaluateInterviewAnswer } from '@/ai/flows/evaluate-interview-answer';
import { generateOverallInterviewFeedback } from '@/ai/flows/generate-overall-interview-feedback';

export default function AiMockInterviewPage() {
  const [currentUiStepId, setCurrentUiStepId] = useState<MockInterviewStepId>('setup');
  const [interviewConfig, setInterviewConfig] = useState<GenerateMockInterviewQuestionsInput | null>(null);
  const [session, setSession] = useState<MockInterviewSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // General loading for page transitions or AI calls
  const [isEvaluatingAnswer, setIsEvaluatingAnswer] = useState(false); // Specific loading for answer evaluation

  const { toast } = useToast();
  const currentUser = sampleUserProfile;

  const handleSetupComplete = async (config: GenerateMockInterviewQuestionsInput) => {
    setIsLoading(true);
    setInterviewConfig(config);
    try {
      const { questions } = await generateMockInterviewQuestions(config);
      const newSession: MockInterviewSession = {
        id: `session-${Date.now()}`,
        userId: currentUser.id,
        topic: config.topic,
        jobDescription: config.jobDescription,
        questions: questions,
        answers: [],
        status: 'in-progress',
        createdAt: new Date().toISOString(),
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

  const handleAnswerSubmit = async (userAnswer: string) => {
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
            // Storing detailed evaluation results if needed by StepFeedback component later
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
        // All questions answered, now generate overall feedback
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
      setCurrentUiStepId('setup'); // Go back to setup
      return;
    }
    setIsLoading(true); // Use general loading for this final step
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
        overallFeedback: overallFeedbackResult as any, // Cast as any to match structure for now
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
            onCompleteInterview={handleCompleteInterview} // This might be implicitly called by onAnswerSubmit now
            isEvaluating={isEvaluatingAnswer}
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
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary" /> AI Mock Interview
          </CardTitle>
          <CardDescription>
            Practice your interviewing skills with AI-generated questions and feedback.
            {MOCK_INTERVIEW_STEPS.find(s => s.id === currentUiStepId)?.description}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 items-start">
        <div className="sticky top-24"> {/* Make stepper sticky */}
          <AiMockInterviewStepper currentStep={currentUiStepId} />
        </div>
        
        <Card className="shadow-lg min-h-[400px]"> {/* Ensure card has some min height */}
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
  );
}