
"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Bookmark, Check, ChevronLeft, ChevronRight, Clock, Send, X, PieChart as PieChartIcon, BarChart2 as BarChart2Icon, ListChecks, Maximize, Minimize, Info } from 'lucide-react';
import { sampleInterviewQuestions, sampleCreatedQuizzes, sampleUserProfile } from '@/lib/sample-data';
import type { InterviewQuestion, MockInterviewSession } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend as RechartsLegend, BarChart as RechartsBarChart, XAxis, YAxis, CartesianGrid, Bar } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle as DialogUITitle, DialogDescription as DialogUIDescription, DialogFooter as DialogUIFooter, DialogClose } from '@/components/ui/dialog';

const QUIZ_TIME_SECONDS_PER_QUESTION = 90;
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8442FF', '#FF42A5', '#42FFA5'];


interface QuizResults {
  score: number;
  percentage: number;
  timeTaken: number;
  totalQuizTime: number;
  categoryStats: Record<string, { correct: number; total: number; accuracy: number }>;
  answeredCount: number;
  markedForReviewCount: number;
}

export default function QuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [totalQuizTime, setTotalQuizTime] = useState(0);

  const [quizMetadata, setQuizMetadata] = useState<Pick<MockInterviewSession, 'topic' | 'description' | 'difficulty'> | null>(null);
  const [showStartQuizDialog, setShowStartQuizDialog] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const quizContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const questionIdsParam = searchParams.get('questions');
    const quizIdParam = searchParams.get('quizId');
    let loadedQuestions: InterviewQuestion[] = [];
    let loadedMetadata: Pick<MockInterviewSession, 'topic' | 'description' | 'difficulty'> | null = null;

    if (quizIdParam) {
        const foundQuiz = sampleCreatedQuizzes.find(q => q.id === quizIdParam);
        if (foundQuiz) {
            loadedMetadata = { topic: foundQuiz.topic, description: foundQuiz.description, difficulty: foundQuiz.difficulty };
            if (foundQuiz.questions) {
              loadedQuestions = foundQuiz.questions.map(qRef => {
                  const fullQuestion = sampleInterviewQuestions.find(sq => sq.id === qRef.id);
                  // Ensure isMCQ, mcqOptions are present and not null for a valid quiz question
                  return (fullQuestion && fullQuestion.isMCQ && fullQuestion.mcqOptions) ? fullQuestion : null;
              }).filter(q => q !== null && q.approved !== false) as InterviewQuestion[];
            }
            if (loadedQuestions.length === 0) {
                toast({title: "Invalid Quiz", description: `Quiz "${foundQuiz.topic}" has no usable MCQ questions.`, variant: "destructive", duration: 5000});
                 setTimeout(() => router.push('/interview-prep'), 500); // Redirect after short delay
            }
        } else {
            toast({title: "Quiz Not Found", description: "The specified quiz ID could not be found.", variant: "destructive", duration: 5000});
            setTimeout(() => router.push('/interview-prep'), 500);
        }
    } else if (questionIdsParam) {
      const questionIds = questionIdsParam.split(',');
      loadedQuestions = sampleInterviewQuestions.filter(q => questionIds.includes(q.id) && q.isMCQ && q.mcqOptions && q.mcqOptions.length > 0 && q.approved !== false);
       if (loadedQuestions.length === 0) {
          toast({title: "No Valid Questions", description: "None of the selected questions are valid for a quiz (must be MCQ, approved, with options).", variant: "destructive", duration: 5000});
          setTimeout(() => router.push('/interview-prep'), 500);
       }
       loadedMetadata = { topic: 'Custom Quiz', description: `Quiz with ${loadedQuestions.length} selected questions.` };
    } else {
      // Fallback: If no specific quiz or questions, try to load some default MCQs
      loadedQuestions = sampleInterviewQuestions.filter(q => q.isMCQ && q.mcqOptions && q.mcqOptions.length > 0 && q.approved !== false).slice(0,10);
      if (loadedQuestions.length === 0) {
         toast({title: "No Default Questions", description: "No default MCQ questions available for a quiz.", variant: "destructive", duration: 5000});
         setTimeout(() => router.push('/interview-prep'), 500);
      }
      loadedMetadata = { topic: 'General Knowledge Quiz', description: 'A quick quiz with default questions.' };
    }

    if (loadedQuestions.length === 0) {
      // If after all checks, no questions are loaded, don't proceed. The toasts above should inform the user.
      return;
    }

    setQuestions(loadedQuestions);
    setQuizMetadata(loadedMetadata);
    setShowStartQuizDialog(true);

    const calculatedTotalTime = loadedQuestions.length * QUIZ_TIME_SECONDS_PER_QUESTION;
    setTotalQuizTime(calculatedTotalTime);
  }, [searchParams, router, toast]);

  useEffect(() => {
    if (!quizStarted || quizSubmitted || questions.length === 0 || totalQuizTime === 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleSubmitQuiz(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, quizSubmitted, questions, totalQuizTime]); // Added missing handleSubmitQuiz to dependencies

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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

  const toggleMarkForReview = () => {
    if (!currentQuestion) return;
    const newMarked = new Set(markedForReview);
    if (newMarked.has(currentQuestion.id)) {
        newMarked.delete(currentQuestion.id);
    } else {
        newMarked.add(currentQuestion.id);
    }
    setMarkedForReview(newMarked);
    toast({ title: `Question ${newMarked.has(currentQuestion.id) ? 'Marked for Review' : 'Unmarked'}`, duration: 2000 });
  };


  const handleSubmitQuiz = (autoSubmitted = false) => {
    if (quizSubmitted) return;
    setQuizSubmitted(true);
    if (isFullScreen && document.fullscreenElement && quizContainerRef.current === document.fullscreenElement) {
      document.exitFullscreen();
    }

    let score = 0;
    const categoryStats: Record<string, { correct: number; total: number }> = {};

    questions.forEach(q => {
      const category = q.category || 'Uncategorized';
      if (!categoryStats[category]) {
        categoryStats[category] = { correct: 0, total: 0 };
      }
      categoryStats[category].total += 1;

      if (q.correctAnswer && userAnswers[q.id] === q.correctAnswer) {
        score++;
        categoryStats[category].correct += 1;
      }
    });

    const percentage = questions.length > 0 ? (score / questions.length) * 100 : 0;
    const timeTaken = totalQuizTime - timeLeft;
    const answeredCount = Object.keys(userAnswers).length;
    const markedForReviewCount = markedForReview.size;

    const finalCategoryStats = Object.entries(categoryStats).reduce((acc, [key, val]) => {
      acc[key] = { ...val, accuracy: val.total > 0 ? (val.correct / val.total) * 100 : 0 };
      return acc;
    }, {} as QuizResults['categoryStats']);

    setQuizResults({
      score,
      percentage,
      timeTaken,
      totalQuizTime,
      categoryStats: finalCategoryStats,
      answeredCount,
      markedForReviewCount
    });

    toast({
      title: autoSubmitted ? "Quiz Auto-Submitted!" : "Quiz Submitted!",
      description: `You scored ${score} out of ${questions.length} (${percentage.toFixed(0)}%). View your detailed report.`,
      duration: 7000,
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startQuiz = async () => {
    setShowStartQuizDialog(false);
    setQuizStarted(true);
    setTimeLeft(totalQuizTime);
    if (quizContainerRef.current && !document.fullscreenElement) {
      try {
        await quizContainerRef.current.requestFullscreen();
      } catch (err) {
        console.warn("Auto-fullscreen for quiz failed:", err);
        toast({ title: "Fullscreen Note", description: "Automatic fullscreen entry failed. You can try enabling it manually.", variant: "default", duration: 4000});
      }
    }
  };

  const toggleFullScreen = async () => {
    if (!quizContainerRef.current) return;
    if (!document.fullscreenElement) {
      try {
        await quizContainerRef.current.requestFullscreen();
      } catch (err) {
        toast({ title: "Fullscreen Error", description: `Could not enter fullscreen: ${(err as Error).message}`, variant: "destructive" });
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
  };


  if (questions.length === 0 && !quizSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4">
        <Card className="w-full max-w-lg text-center p-8 shadow-lg">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle className="text-2xl font-bold">Loading Quiz...</CardTitle>
          <CardDescription className="mt-2">
            Preparing your quiz questions. If this takes too long, please check your selection or try again.
          </CardDescription>
           <Button onClick={() => router.push('/interview-prep')} className="mt-6">Back to Prep</Button>
        </Card>
      </div>
    );
  }

  if (!quizStarted && quizMetadata) {
    return (
      <Dialog open={showStartQuizDialog} onOpenChange={(open) => { if(!open && !quizStarted) router.push('/interview-prep')}}>
        <DialogContent>
          <DialogHeader>
            <DialogUITitle className="text-2xl">{quizMetadata.topic}</DialogUITitle>
            <DialogUIDescription className="text-sm text-muted-foreground">
              {quizMetadata.description || `Ready to start this quiz?`}
            </DialogUIDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <p className="flex items-center gap-2"><ListChecks className="h-5 w-5 text-primary"/> {questions.length} questions</p>
            <p className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary"/> Time limit: {formatTime(totalQuizTime)}</p>
            {quizMetadata.difficulty && <p className="flex items-center gap-2"><Info className="h-5 w-5 text-primary"/> Difficulty: {quizMetadata.difficulty}</p>}
          </div>
          <DialogUIFooter>
            <Button variant="outline" onClick={() => router.push('/interview-prep')}>Cancel</Button>
            <Button onClick={startQuiz} className="bg-primary hover:bg-primary/90">Start Quiz</Button>
          </DialogUIFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (quizSubmitted && quizResults) {
    const categoryChartData = Object.entries(quizResults.categoryStats).map(([name, data]) => ({
        name,
        Correct: data.correct,
        Incorrect: data.total - data.correct,
        Total: data.total,
        Accuracy: data.accuracy,
    }));

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-6 bg-secondary/50 dark:bg-background">
        <Card className="w-full max-w-2xl text-center p-6 shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold mb-2 text-primary">Quiz Complete!</CardTitle>
            <CardDescription className="text-lg">
              You scored {quizResults.score} out of {questions.length} ({quizResults.percentage.toFixed(0)}%).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-background rounded-md border">
                    <p className="font-medium text-muted-foreground">Time Taken</p>
                    <p className="text-xl font-semibold text-foreground">{formatTime(quizResults.timeTaken)} / {formatTime(quizResults.totalQuizTime)}</p>
                </div>
                 <div className="p-3 bg-background rounded-md border">
                    <p className="font-medium text-muted-foreground">Answered / Marked</p>
                    <p className="text-xl font-semibold text-foreground">{quizResults.answeredCount}/{questions.length} Answered, {quizResults.markedForReviewCount} Marked</p>
                </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full max-w-2xl p-6 shadow-xl">
            <CardHeader className="p-0 pb-4">
                <CardTitle className="text-xl font-semibold flex items-center gap-2"><BarChart2Icon className="h-5 w-5 text-primary"/>Sectional Performance</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {categoryChartData.length > 0 ? (
                    <>
                        <div className="h-[250px] mb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsBarChart data={categoryChartData} layout="vertical" margin={{ top: 5, right: 20, left: 50, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" allowDecimals={false} />
                                    <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12}}/>
                                    <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} formatter={(value, name) => [`${value}${name === 'Accuracy' ? '%' : ''}`, name as string]}/>
                                    <RechartsLegend wrapperStyle={{fontSize: "12px"}}/>
                                    <Bar dataKey="Correct" stackId="a" fill={COLORS[0]} radius={[0, 4, 4, 0]}/>
                                    <Bar dataKey="Incorrect" stackId="a" fill={COLORS[3]} radius={[0, 4, 4, 0]}/>
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </div>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-center">Correct</TableHead>
                                    <TableHead className="text-center">Total</TableHead>
                                    <TableHead className="text-right">Accuracy</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categoryChartData.map(cat => (
                                    <TableRow key={cat.name}>
                                        <TableCell className="font-medium">{cat.name}</TableCell>
                                        <TableCell className="text-center">{cat.Correct}</TableCell>
                                        <TableCell className="text-center">{cat.Total}</TableCell>
                                        <TableCell className="text-right font-semibold text-primary">{cat.Accuracy.toFixed(0)}%</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </>
                ) : (
                    <p className="text-muted-foreground text-center py-4">No category data to display.</p>
                )}
            </CardContent>
        </Card>

        <div className="w-full max-w-2xl">
            <Button onClick={() => router.push('/interview-prep')} className="w-full bg-primary hover:bg-primary/90">
                Back to Interview Prep
            </Button>
        </div>
      </div>
    );
  }


  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-lg text-center p-8 shadow-lg">
         <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
         <CardTitle className="text-2xl font-bold">Error: Question Not Found</CardTitle>
         <CardDescription className="mt-2">Could not load the current question. Please try returning to the prep hub.</CardDescription>
         <Button onClick={() => router.push('/interview-prep')} className="mt-6">Back to Prep Hub</Button>
        </Card>
      </div>
    );
  }

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div ref={quizContainerRef} className={cn("flex flex-col min-h-screen", isFullScreen ? "bg-background" : "bg-slate-50 dark:bg-slate-900")}>
      <header className="bg-card shadow-sm p-3 sticky top-0 z-10 border-b">
        <div className="container mx-auto flex flex-wrap justify-between items-center gap-2">
          <h1 className="text-lg font-semibold text-foreground truncate max-w-[calc(100%-180px)]" title={quizMetadata?.topic || 'Quiz'}>
            {quizMetadata?.topic || 'Quiz'}: {currentQuestion.category}
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleFullScreen} title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
              {isFullScreen ? <Minimize className="h-4 w-4"/> : <Maximize className="h-4 w-4"/>}
            </Button>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-destructive text-destructive-foreground font-mono text-md tracking-wider">
              <Clock className="h-4 w-4" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-6 flex items-center justify-center">
        <Card className="w-full max-w-3xl shadow-xl bg-card">
          <CardHeader>
            <div className="flex justify-between items-center mb-1">
                <CardTitle className="text-base font-medium text-muted-foreground">Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
            </div>
            <Progress value={(currentQuestionIndex + 1) / questions.length * 100} className="w-full h-1.5 [&>div]:bg-primary" />
            <CardDescription className="text-lg font-semibold text-foreground pt-3">{currentQuestion.questionText}</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={userAnswers[currentQuestion.id] || ''}
              onValueChange={handleAnswerSelect}
              className="space-y-2.5"
            >
              {currentQuestion.mcqOptions?.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-2.5 border rounded-md hover:bg-secondary/50 transition-colors cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                  <RadioGroupItem value={option} id={`${currentQuestion.id}-opt-${index}`} className="border-muted-foreground data-[state=checked]:border-primary data-[state=checked]:text-primary"/>
                  <Label htmlFor={`${currentQuestion.id}-opt-${index}`} className="font-normal text-md cursor-pointer flex-1">
                    <span className="font-semibold mr-1.5">{optionLetters[index]}.</span>{option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      </main>

      <footer className="bg-card shadow-top p-3 sticky bottom-0 z-10 border-t">
        <div className="container mx-auto flex flex-wrap justify-between items-center gap-2">
          <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
            <ChevronLeft className="mr-1 h-4 w-4"/> Previous
          </Button>
          <div className="flex gap-2">
            <Button
                variant={markedForReview.has(currentQuestion.id) ? "default" : "outline"}
                onClick={toggleMarkForReview}
                className={cn(markedForReview.has(currentQuestion.id) && "bg-yellow-400 hover:bg-yellow-500 border-yellow-500 text-black")}
            >
                <Bookmark className="mr-1 h-4 w-4"/> Mark for Review
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
