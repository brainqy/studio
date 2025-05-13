
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Bookmark, Check, ChevronLeft, ChevronRight, Clock, Send, X } from 'lucide-react';
import { sampleInterviewQuestions } from '@/lib/sample-data';
import type { InterviewQuestion } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const QUIZ_TIME_SECONDS = 15 * 60; // 15 minutes for the whole quiz, can be adjusted

export default function QuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME_SECONDS);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());

  useEffect(() => {
    const questionIdsParam = searchParams.get('questions');
    let loadedQuestions: InterviewQuestion[];

    if (questionIdsParam) {
      const questionIds = questionIdsParam.split(',');
      loadedQuestions = sampleInterviewQuestions.filter(q => questionIds.includes(q.id) && q.isMCQ && q.mcqOptions && q.mcqOptions.length > 0 && q.approved);
    } else {
      // Fallback if no specific questions are passed, load all approved MCQs
      loadedQuestions = sampleInterviewQuestions.filter(q => q.isMCQ && q.mcqOptions && q.mcqOptions.length > 0 && q.approved);
    }
    
    if (loadedQuestions.length === 0) {
        toast({title: "No Questions Found", description: "Could not load questions for the quiz. Returning to prep page.", variant: "destructive"});
        router.push('/interview-prep');
        return;
    }
    setQuestions(loadedQuestions);
  }, [searchParams, router, toast]);

  useEffect(() => {
    if (quizSubmitted || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleSubmitQuiz(true); // Auto-submit when time runs out
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizSubmitted, questions]);

  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);

  const handleAnswerSelect = (option: string) => {
    if (!currentQuestion) return;
    setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: option }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const toggleBookmark = () => {
    if (!currentQuestion) return;
    // Mock bookmark functionality
    toast({ title: "Bookmark Toggled (Mock)", description: `Question "${currentQuestion.question.substring(0,20)}..." bookmark status changed.` });
  };
  
  const toggleMarkForReview = () => {
    if (!currentQuestion) return;
    const newMarked = new Set(markedForReview);
    if (newMarked.has(currentQuestion.id)) {
        newMarked.delete(currentQuestion.id);
    } else {
        newMarked.add(currentQuestion.id);
    }
    setMarkedForReview(newMarked);
    toast({ title: `Marked for Review ${newMarked.has(currentQuestion.id) ? 'Added' : 'Removed'}`, description: `Question marked status updated.` });
  };


  const handleSubmitQuiz = (autoSubmitted = false) => {
    setQuizSubmitted(true);
    // Calculate score or prepare results
    let score = 0;
    questions.forEach(q => {
      if (q.correctAnswer && userAnswers[q.id] === q.correctAnswer) {
        score++;
      }
    });
    const percentage = (score / questions.length) * 100;
    toast({
      title: autoSubmitted ? "Quiz Auto-Submitted!" : "Quiz Submitted!",
      description: `You scored ${score} out of ${questions.length} (${percentage.toFixed(0)}%). Further results page is a TODO.`,
      duration: 7000,
    });
    // Here, you would typically navigate to a results page or display results.
    // For now, just log and allow user to navigate away or restart.
    console.log("Quiz Data:", { questions, userAnswers, score, percentage });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (questions.length === 0 && !quizSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
        <Card className="w-full max-w-lg text-center p-8 shadow-lg">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <CardTitle className="text-2xl font-bold">Loading Quiz...</CardTitle>
          <CardDescription className="mt-2">
            Preparing your quiz questions. If this takes too long, please try again.
          </CardDescription>
           <Button onClick={() => router.push('/interview-prep')} className="mt-6">Back to Prep</Button>
        </Card>
      </div>
    );
  }
  
  if (quizSubmitted) {
     let score = 0;
     questions.forEach(q => { if (q.correctAnswer && userAnswers[q.id] === q.correctAnswer) { score++; } });
     const percentage = questions.length > 0 ? (score / questions.length) * 100 : 0;
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
        <Card className="w-full max-w-lg text-center p-8 shadow-lg">
          <CardTitle className="text-2xl font-bold mb-4">Quiz Complete!</CardTitle>
          <CardDescription className="mb-6">
            You scored {score} out of {questions.length} ({percentage.toFixed(0)}%).
          </CardDescription>
          {/* TODO: Add a more detailed results view here */}
          <Button onClick={() => router.push('/interview-prep')} className="w-full">
            Back to Interview Prep
          </Button>
        </Card>
      </div>
    );
  }


  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Error: Question not found.</p>
         <Button onClick={() => router.push('/interview-prep')} className="mt-6">Back to Prep</Button>
      </div>
    );
  }
  
  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F']; // Up to 6 options

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-card shadow-sm p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold text-foreground">Section: {currentQuestion.category}</h1>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground font-mono text-lg tracking-wider">
            <Clock className="h-5 w-5" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-3xl shadow-xl bg-card">
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-medium text-muted-foreground">Question {currentQuestionIndex + 1} of {questions.length}:</CardTitle>
                <Progress value={(currentQuestionIndex + 1) / questions.length * 100} className="w-1/3 h-2 [&>div]:bg-primary" />
            </div>
            <CardDescription className="text-xl font-semibold text-foreground pt-2">{currentQuestion.question}</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={userAnswers[currentQuestion.id] || ''}
              onValueChange={handleAnswerSelect}
              className="space-y-3"
            >
              {currentQuestion.mcqOptions?.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-secondary/50 transition-colors cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                  <RadioGroupItem value={option} id={`${currentQuestion.id}-opt-${index}`} className="border-muted-foreground data-[state=checked]:border-primary data-[state=checked]:text-primary"/>
                  <Label htmlFor={`${currentQuestion.id}-opt-${index}`} className="font-normal text-md cursor-pointer flex-1">
                    <span className="font-semibold mr-2">{optionLetters[index]}.</span>{option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {userAnswers[currentQuestion.id] && currentQuestion.correctAnswer && (
              <div className={cn(
                  "mt-4 p-3 rounded-md text-sm flex items-center gap-2",
                  userAnswers[currentQuestion.id] === currentQuestion.correctAnswer
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
              )}>
                {userAnswers[currentQuestion.id] === currentQuestion.correctAnswer ? <Check className="h-5 w-5"/> : <X className="h-5 w-5"/>}
                {userAnswers[currentQuestion.id] === currentQuestion.correctAnswer ? "Correct!" : `Incorrect. The correct answer is: ${currentQuestion.correctAnswer}`}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-card shadow-top p-4 sticky bottom-0 z-10 border-t">
        <div className="container mx-auto flex flex-wrap justify-between items-center gap-2">
          <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
            <ChevronLeft className="mr-1 h-4 w-4"/> Previous
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={toggleBookmark}><Bookmark className="mr-1 h-4 w-4"/> Bookmark</Button>
            <Button variant="outline" onClick={toggleMarkForReview} className={cn(markedForReview.has(currentQuestion.id) && "bg-yellow-100 border-yellow-400 text-yellow-700 hover:bg-yellow-200")}>
                {markedForReview.has(currentQuestion.id) ? <Check className="mr-1 h-4 w-4"/> : null}Mark for Review
            </Button>
          </div>
          {currentQuestionIndex < questions.length - 1 ? (
            <Button onClick={handleNext} className="bg-primary hover:bg-primary/90">
              Next <ChevronRight className="ml-1 h-4 w-4"/>
            </Button>
          ) : (
            <Button onClick={() => handleSubmitQuiz()} className="bg-green-600 hover:bg-green-700 text-primary-foreground">
              <Send className="mr-1 h-4 w-4"/> Submit Quiz
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}

