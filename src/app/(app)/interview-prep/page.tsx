
"use client";

import type React from 'react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle as DialogUITitle, DialogDescription as DialogUIDescription, DialogFooter as DialogUIFooter, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Calendar, Users, ShieldAlert, Type, Languages, MessageSquare, CheckCircle, XCircle, Mic, ListChecks, Search, ChevronLeft, ChevronRight, Tag, Settings2, Puzzle, Lightbulb, Code, Eye, Edit3, Play, PlusCircle, Star as StarIcon, Send, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sampleUserProfile, samplePracticeSessions, sampleInterviewQuestions, sampleCreatedQuizzes } from "@/lib/sample-data";
import type { PracticeSession, InterviewQuestion, InterviewQuestionCategory, MockInterviewSession, PracticeFlowStage, PracticeSessionConfig } from "@/types"; // Added PracticeFlowStage, PracticeSessionConfig
import { ALL_CATEGORIES, PREDEFINED_INTERVIEW_TOPICS } from '@/types'; // Added PREDEFINED_INTERVIEW_TOPICS
import { format, parseISO, isFuture as dateIsFuture } from "date-fns"; 
import { cn } from "@/lib/utils";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from '@/components/ui/badge';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import PracticeTopicSelection from '@/components/features/interview-prep/PracticeTopicSelection';
import PracticeDateTimeSelector from '@/components/features/interview-prep/PracticeDateTimeSelector';


type InterviewType = "friends" | "experts" | "ai";

const questionFormSchema = z.object({
  question: z.string().min(10, "Question text is too short.").max(500, "Question text is too long."),
  category: z.enum(ALL_CATEGORIES),
  isMCQ: z.boolean().default(false),
  mcqOptions: z.array(z.string()).optional(),
  correctAnswer: z.string().optional(),
  answerOrTip: z.string().min(10, "Answer/Tip is too short.").max(1000, "Answer/Tip is too long."),
  tags: z.string().optional(), 
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
});
type QuestionFormData = z.infer<typeof questionFormSchema>;

const commentFormSchema = z.object({
    commentText: z.string().min(1, "Comment cannot be empty.").max(500, "Comment too long."),
});
type CommentFormData = z.infer<typeof commentFormSchema>;

const friendEmailSchema = z.string().email("Please enter a valid email address.");


export default function InterviewPracticeHubPage() { 
  const [isInterviewTypeDialogOpen, setIsInterviewTypeDialogOpen] = useState(false);
  const [selectedInterviewType, setSelectedInterviewType] = useState<InterviewType | null>(null);
  const [friendEmail, setFriendEmail] = useState('');
  const [friendEmailError, setFriendEmailError] = useState<string | null>(null);
  const [practiceSessions, setPracticeSessions] = useState<PracticeSession[]>(samplePracticeSessions);
  const router = useRouter();
  const { toast } = useToast();
  const currentUser = sampleUserProfile;

  const [allBankQuestions, setAllBankQuestions] = useState<InterviewQuestion[]>(sampleInterviewQuestions);
  const [selectedBankCategories, setSelectedBankCategories] = useState<InterviewQuestionCategory[]>([]);
  const [bankSearchTerm, setBankSearchTerm] = useState('');
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<InterviewQuestion | null>(null);
  const [selectedQuestionsForQuiz, setSelectedQuestionsForQuiz] = useState<Set<string>>(new Set());

  const [createdQuizzes, setCreatedQuizzes] = useState<MockInterviewSession[]>(sampleCreatedQuizzes);

  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10;

  const [commentingQuestionId, setCommentingQuestionId] = useState<string | null>(null);
  const { control: commentFormControl, handleSubmit: handleCommentFormSubmit, reset: resetCommentForm, formState: { errors: commentFormErrors } } = useForm<CommentFormData>({
    resolver: zodResolver(commentFormSchema),
  });
  
  const [ratingQuestionId, setRatingQuestionId] = useState<string | null>(null);
  const [currentRating, setCurrentRating] = useState(0);

  // New state for practice flow
  const [currentPracticeFlowStage, setCurrentPracticeFlowStage] = useState<PracticeFlowStage>('idle');
  const [practiceSessionConfig, setPracticeSessionConfig] = useState<PracticeSessionConfig>({
    type: null,
    topics: [],
    dateTime: null,
  });


  const {
    control: questionFormControl,
    handleSubmit: handleQuestionFormSubmit,
    reset: resetQuestionForm,
    setValue: setQuestionFormValue,
    watch: watchQuestionForm,
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: { isMCQ: false, mcqOptions: ["", "", "", ""], category: 'Common' }
  });
  const questionFormErrors = questionFormControl.formState.errors; // Corrected access to errors
  const isMCQSelected = watchQuestionForm("isMCQ");


  const upcomingSessions = practiceSessions.filter(s => s.status === 'SCHEDULED' && dateIsFuture(parseISO(s.date)));
  const allUserSessions = practiceSessions; 
  const cancelledSessions = practiceSessions.filter(s => s.status === 'CANCELLED');

  const handleStartPracticeFlow = () => {
    setCurrentPracticeFlowStage('selectType');
    setSelectedInterviewType(null); // Reset previous selection
    setFriendEmail('');
    setFriendEmailError(null);
    setPracticeSessionConfig({ type: null, topics: [], dateTime: null }); // Reset config
    setIsInterviewTypeDialogOpen(true);
  };

  const handleInterviewTypeSelect = (type: InterviewType) => {
    setSelectedInterviewType(type);
    setPracticeSessionConfig(prev => ({ ...prev, type: type as PracticeSessionConfig['type'] }));
    setFriendEmail(''); // Reset email if type changes
    setFriendEmailError(null);
  };
  
  const handleProceedWithInterviewType = () => {
    if (!practiceSessionConfig.type) return;

    if (practiceSessionConfig.type === "friends") {
      if (!friendEmail.trim()) {
        setFriendEmailError("Please enter a friend's email to send an invitation.");
        return;
      }
      const emailValidation = friendEmailSchema.safeParse(friendEmail);
      if (!emailValidation.success) {
        setFriendEmailError(emailValidation.error.errors[0].message);
        return;
      }
      setPracticeSessionConfig(prev => ({ ...prev, friendEmail }));
      // Logic for sending invitation (mocked) then potentially moving to a waiting stage or closing
      handleSendInvitation(); // This will show a toast
      // We might close the dialog here and not proceed to topics/time for 'friends' for now
      // Or, we could add a "scheduling with friend" step. For now, it ends here for friends.
      setIsInterviewTypeDialogOpen(false);
      setCurrentPracticeFlowStage('idle'); // Reset flow
      return;
    }

    // For AI or Experts
    setIsInterviewTypeDialogOpen(false);
    setCurrentPracticeFlowStage('selectTopics');
  };


  const handleSendInvitation = () => {
    const emailValidation = friendEmailSchema.safeParse(friendEmail);
    if (!emailValidation.success) {
      setFriendEmailError(emailValidation.error.errors[0].message);
      return;
    }
    setFriendEmailError(null);
    toast({ title: "Invitation Sent (Mock)", description: `Invitation sent to ${friendEmail}. They will receive instructions on how to join.` });
  };

  const handleTopicsSubmit = (topics: InterviewQuestionCategory[]) => {
    setPracticeSessionConfig(prev => ({ ...prev, topics }));
    setCurrentPracticeFlowStage('selectTimeSlot');
  };
  
  const handleDateTimeSubmit = (dateTime: Date) => {
    setPracticeSessionConfig(prev => ({ ...prev, dateTime }));
    // At this point, all config is gathered. Proceed to book or start.
    handleBookPracticeSession({ ...practiceSessionConfig, dateTime }); // Pass the complete config
  };

  const handleBookPracticeSession = (config: PracticeSessionConfig) => {
    if (!config.type || config.topics.length === 0 || !config.dateTime) {
      toast({ title: "Booking Error", description: "Missing practice session details.", variant: "destructive"});
      setCurrentPracticeFlowStage('idle');
      return;
    }

    if (config.type === 'ai') {
      // Redirect to AI Mock Interview page with necessary config
      // For now, we'll just use the topic. AI mock interview page already handles number of questions, difficulty etc.
      router.push(`/ai-mock-interview?topic=${encodeURIComponent(config.topics[0] || 'General')}&dateTime=${config.dateTime.toISOString()}`);
    } else if (config.type === 'experts') {
      // Mock booking with expert
      const newSession: PracticeSession = {
        id: `ps-expert-${Date.now()}`,
        userId: currentUser.id,
        date: config.dateTime.toISOString(),
        category: "Practice with Experts",
        type: config.topics.join(', ') || "General",
        language: "English",
        status: "SCHEDULED",
        notes: `Scheduled expert session for topics: ${config.topics.join(', ')}.`,
      };
      setPracticeSessions(prev => [newSession, ...prev]);
      toast({ title: "Expert Session Booked (Mock)", description: `Session for ${config.topics.join(', ')} on ${format(config.dateTime, 'PPp')} scheduled.` });
    }
    setCurrentPracticeFlowStage('idle'); // Reset flow
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

  const filteredBankQuestions = useMemo(() => {
    return allBankQuestions.filter(q => {
      if (!q.isMCQ || !q.mcqOptions || !q.correctAnswer) return false; // Ensure it's a valid MCQ
      if (q.approved === false && currentUser.role !== 'admin') return false; 
      const matchesCategory = selectedBankCategories.length === 0 || selectedBankCategories.includes(q.category);
      const matchesSearch = bankSearchTerm === '' ||
                            q.question.toLowerCase().includes(bankSearchTerm.toLowerCase()) ||
                            (q.tags && q.tags.some(tag => tag.toLowerCase().includes(bankSearchTerm.toLowerCase())));
      return matchesCategory && matchesSearch;
    });
  }, [allBankQuestions, selectedBankCategories, bankSearchTerm, currentUser.role]);

  const paginatedBankQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * questionsPerPage;
    return filteredBankQuestions.slice(startIndex, startIndex + questionsPerPage);
  }, [filteredBankQuestions, currentPage, questionsPerPage]);
  
  const totalPages = Math.ceil(filteredBankQuestions.length / questionsPerPage);

  const onQuestionFormSubmit = (data: QuestionFormData) => {
    const questionPayload = {
        ...data,
        tags: data.tags?.split(',').map(t => t.trim()).filter(t => t) || [],
        mcqOptions: data.isMCQ ? data.mcqOptions?.filter(opt => opt.trim() !== "") : undefined,
        correctAnswer: data.isMCQ ? data.correctAnswer : undefined,
        approved: currentUser.role === 'admin', 
        createdBy: currentUser.id,
    };

    if (editingQuestion) {
      setAllBankQuestions(prev => prev.map(q => q.id === editingQuestion.id ? { ...editingQuestion, ...questionPayload, difficulty: data.difficulty || 'Medium' } : q));
      toast({ title: "Question Updated", description: "The interview question has been updated." });
    } else {
      const newQuestion: InterviewQuestion = {
        ...questionPayload,
        id: `iq-${Date.now()}`,
        difficulty: data.difficulty || 'Medium',
        rating: 0,
        ratingsCount: 0,
        userComments: [],
      };
      setAllBankQuestions(prev => [newQuestion, ...prev]);
      toast({ title: "Question Added", description: "New question added to the bank." });
    }
    setIsQuestionFormOpen(false);
    resetQuestionForm({ isMCQ: false, mcqOptions: ["", "", "", ""], category: 'Common', difficulty: 'Medium' });
    setEditingQuestion(null);
  };

  const openNewQuestionDialog = () => {
    setEditingQuestion(null);
    resetQuestionForm({ question: '', category: 'Common', isMCQ: false, mcqOptions: ["", "", "", ""], correctAnswer: '', answerOrTip: '', tags: '', difficulty: 'Medium' });
    setIsQuestionFormOpen(true);
  };

  const openEditQuestionDialog = (question: InterviewQuestion) => {
    setEditingQuestion(question);
    setQuestionFormValue('question', question.question);
    setQuestionFormValue('category', question.category);
    setQuestionFormValue('isMCQ', question.isMCQ || false);
    setQuestionFormValue('mcqOptions', question.mcqOptions || ["", "", "", ""]);
    setQuestionFormValue('correctAnswer', question.correctAnswer || "");
    setQuestionFormValue('answerOrTip', question.answerOrTip);
    setQuestionFormValue('tags', question.tags?.join(', ') || "");
    setQuestionFormValue('difficulty', question.difficulty || 'Medium');
    setIsQuestionFormOpen(true);
  };
  
  const handleDeleteQuestion = (questionId: string) => {
    setAllBankQuestions(prev => prev.filter(q => q.id !== questionId));
    toast({ title: "Question Deleted", description: "Question removed from the bank.", variant: "destructive" });
  };

  const handleToggleQuestionForQuiz = (questionId: string) => {
    setSelectedQuestionsForQuiz(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) newSet.delete(questionId);
      else newSet.add(questionId);
      return newSet;
    });
  };

  const handleCreateQuiz = () => {
    if (selectedQuestionsForQuiz.size === 0) {
      toast({ title: "No Questions Selected", description: "Please select questions to include in the quiz.", variant: "destructive" });
      return;
    }
    const questionIds = Array.from(selectedQuestionsForQuiz).join(',');
    // This should eventually point to a new quiz creation page if it's more complex than just passing IDs
    // For now, let's assume /interview-prep/quiz/edit/[quizId] handles `new` as quizId for creation
    router.push(`/interview-prep/quiz/edit/new?questions=${questionIds}`);
  };
  
  const getCategoryIcon = (category: InterviewQuestionCategory) => {
    switch(category) {
      case 'Behavioral': return <Users className="h-4 w-4 text-purple-500 flex-shrink-0"/>;
      case 'Technical': return <Settings2 className="h-4 w-4 text-orange-500 flex-shrink-0"/>;
      case 'Coding': return <Code className="h-4 w-4 text-sky-500 flex-shrink-0"/>;
      case 'Role-Specific': return <Brain className="h-4 w-4 text-indigo-500 flex-shrink-0"/>;
      case 'Analytical': return <Puzzle className="h-4 w-4 text-teal-500 flex-shrink-0"/>;
      case 'HR': return <Lightbulb className="h-4 w-4 text-pink-500 flex-shrink-0"/>;
      case 'Common': return <MessageSquare className="h-4 w-4 text-gray-500 flex-shrink-0"/>;
      default: return <Puzzle className="h-4 w-4 text-gray-400 flex-shrink-0"/>;
    }
  };
  
  const onCommentSubmit = (data: CommentFormData, questionId: string) => {
    const newComment = {
        id: `uc-${questionId}-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        comment: data.commentText,
        timestamp: new Date().toISOString(),
    };
    setAllBankQuestions(prevQs => prevQs.map(q => 
        q.id === questionId ? { ...q, userComments: [...(q.userComments || []), newComment] } : q
    ));
    resetCommentForm();
    setCommentingQuestionId(null);
    toast({ title: "Comment Added", description: "Your comment has been posted." });
  };

  const handleRateQuestion = (questionId: string, rating: number) => {
    setAllBankQuestions(prevQs => prevQs.map(q => {
        if (q.id === questionId) {
            const existingRatingIndex = q.userRatings?.findIndex(r => r.userId === currentUser.id);
            let newUserRatings = [...(q.userRatings || [])];
            if (existingRatingIndex !== undefined && existingRatingIndex !== -1) {
                newUserRatings[existingRatingIndex] = { userId: currentUser.id, rating };
            } else {
                newUserRatings.push({ userId: currentUser.id, rating });
            }
            const totalRatingSum = newUserRatings.reduce((sum, r) => sum + r.rating, 0);
            const newAvgRating = newUserRatings.length > 0 ? parseFloat((totalRatingSum / newUserRatings.length).toFixed(1)) : 0;
            return { ...q, userRatings: newUserRatings, rating: newAvgRating, ratingsCount: newUserRatings.length };
        }
        return q;
    }));
    setRatingQuestionId(null);
    setCurrentRating(0);
    toast({ title: "Rating Submitted", description: `You rated this question ${rating} stars.` });
  };


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


  // Main render logic for the page
  if (currentPracticeFlowStage === 'selectTopics' && practiceSessionConfig.type) {
    return <PracticeTopicSelection
              availableTopics={PREDEFINED_INTERVIEW_TOPICS}
              onTopicsSelected={handleTopicsSubmit}
              onBack={() => {setCurrentPracticeFlowStage('selectType'); setIsInterviewTypeDialogOpen(true);}}
              practiceType={practiceSessionConfig.type}
           />;
  }

  if (currentPracticeFlowStage === 'selectTimeSlot' && practiceSessionConfig.type) {
    return <PracticeDateTimeSelector
              onDateTimeSelected={handleDateTimeSubmit}
              onBack={() => setCurrentPracticeFlowStage('selectTopics')}
              practiceType={practiceSessionConfig.type}
           />;
  }

  // Default view (idle state)
  return (
    <div className="space-y-8">
      <Card className="bg-secondary/30 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Home / Practice Hub</p>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">INTERVIEW PREPARATION HUB</h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <Button size="lg" onClick={handleStartPracticeFlow} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Mic className="mr-2 h-5 w-5" /> Start New Practice Session
                </Button>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-foreground">Credits left: <span className="font-semibold text-primary">{currentUser.interviewCredits || 0} AI interviews</span></p>
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
            <Card className="text-center py-10"><CardContent><Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3"/><p className="text-muted-foreground">No upcoming practice sessions scheduled.</p></CardContent></Card>
          )}
        </TabsContent>
         <TabsContent value="all" className="mt-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">ALL PRACTICE INTERVIEWS</h2>
          {allUserSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allUserSessions.map(renderSessionCard)}
            </div>
          ) : (
             <Card className="text-center py-10"><CardContent><MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3"/><p className="text-muted-foreground">No practice sessions found.</p></CardContent></Card>
          )}
        </TabsContent>
        <TabsContent value="cancelled" className="mt-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">CANCELLED INTERVIEWS</h2>
          {cancelledSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cancelledSessions.map(renderSessionCard)}
            </div>
          ) : (
            <Card className="text-center py-10"><CardContent><ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto mb-3"/><p className="text-muted-foreground">No cancelled interviews found.</p></CardContent></Card>
          )}
        </TabsContent>
      </Tabs>


      <Card className="shadow-lg">
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-xl font-semibold flex items-center gap-2"><ListChecks className="h-5 w-5 text-primary"/>Created Quizzes</CardTitle>
            <CardDescription>Manage your custom quizzes or start one.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {createdQuizzes.filter(q => q.userId === 'system' || q.userId === currentUser.id).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {createdQuizzes.filter(q => q.userId === 'system' || q.userId === currentUser.id).map(quiz => (
                <Card key={quiz.id} className="bg-secondary/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">{quiz.topic}</CardTitle>
                    <CardDescription className="text-xs truncate">{quiz.description || "No description"}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground pb-3">
                    <p>Questions: {quiz.questions.length}</p>
                    <p>Difficulty: {quiz.difficulty || 'N/A'}</p>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button size="sm" variant="default" onClick={() => router.push(`/interview-prep/quiz?quizId=${quiz.id}`)}>
                        <Play className="mr-1 h-4 w-4"/>Start Quiz
                    </Button>
                    {(quiz.userId === currentUser.id || currentUser.role === 'admin') && (
                      <Button size="sm" variant="outline" onClick={() => router.push(`/interview-prep/quiz/edit/${quiz.id}`)}>
                        <Edit3 className="mr-1 h-4 w-4"/>Edit
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No quizzes created yet. Create one from the Question Bank below!</p>
          )}
        </CardContent>
      </Card>


      <Card className="shadow-lg">
        <CardHeader className="flex flex-row justify-between items-center">
            <div>
                <CardTitle className="text-xl font-semibold flex items-center gap-2"><ListChecks className="h-5 w-5 text-primary"/>Question Bank ({filteredBankQuestions.length})</CardTitle>
                <CardDescription>Browse, filter, and select questions for your practice quizzes.</CardDescription>
            </div>
            {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
                 <Button onClick={openNewQuestionDialog}><PlusCircle className="mr-2 h-4 w-4" /> Add New Question</Button>
            )}
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
                <Input
                    placeholder="Search questions or tags..."
                    value={bankSearchTerm}
                    onChange={e => setBankSearchTerm(e.target.value)}
                    className="flex-grow"
                />
            </div>
            <div>
                <Label className="font-medium mb-2 block text-sm">Fast filter for questions (Categories):</Label>
                <ToggleGroup
                    type="multiple"
                    variant="outline"
                    value={selectedBankCategories}
                    onValueChange={(value) => setSelectedBankCategories(value as InterviewQuestionCategory[])}
                    className="flex flex-wrap gap-1 justify-start"
                >
                    {ALL_CATEGORIES.map(category => (
                        <ToggleGroupItem key={category} value={category} aria-label={`Toggle ${category}`} className="text-xs px-2 py-1 h-auto data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                           {getCategoryIcon(category)} <span className="ml-1">{category}</span>
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
            </div>

            <ScrollArea className="h-[500px] pr-2 -mr-2"> 
                {paginatedBankQuestions.length > 0 ? (
                    paginatedBankQuestions.map(q => (
                    <Accordion key={q.id} type="single" collapsible className="border rounded-md mb-2 bg-card shadow-sm hover:shadow-md transition-shadow">
                        <AccordionItem value={`item-${q.id}`} className="border-b-0">
                        <AccordionTrigger className="px-4 py-3 text-sm text-left hover:no-underline data-[state=open]:bg-secondary/50">
                            <div className="flex items-start w-full">
                            <Checkbox
                                id={`select-q-${q.id}`}
                                checked={selectedQuestionsForQuiz.has(q.id)}
                                onCheckedChange={() => handleToggleQuestionForQuiz(q.id)}
                                onClick={(e) => e.stopPropagation()} 
                                className="mr-3 mt-1 flex-shrink-0"
                                aria-label={`Select question: ${q.question}`}
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                    {getCategoryIcon(q.category)}
                                    <span className="font-medium text-foreground">{q.question}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <span>ID: {q.id}</span> | 
                                    {q.difficulty && <Badge variant="outline" className="text-[10px] px-1 py-0">{q.difficulty}</Badge>}
                                    {q.tags && q.tags.map(tag => <Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0">{tag}</Badge>)}
                                </div>
                            </div>
                            {(q.createdBy === currentUser.id || currentUser.role === 'admin') && (
                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEditQuestionDialog(q); }} className="ml-2 h-7 w-7 flex-shrink-0"><Edit3 className="h-4 w-4"/></Button>
                            )}
                            {currentUser.role === 'admin' && (
                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(q.id); }} className="h-7 w-7 flex-shrink-0 text-destructive hover:bg-destructive/10"><XCircle className="h-4 w-4"/></Button>
                            )}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-3 pt-1 space-y-3">
                            <div className="bg-primary/5 p-3 rounded-md">
                                <p className="text-xs font-semibold text-primary mb-1">Suggested Answer/Tip:</p>
                                <p className="text-xs text-foreground whitespace-pre-line">{q.answerOrTip}</p>
                            </div>
                            {q.isMCQ && q.mcqOptions && (
                                <div className="space-y-1">
                                <p className="text-xs font-semibold text-muted-foreground">MCQ Options:</p>
                                {q.mcqOptions.map((opt, i) => (
                                    <p key={i} className={cn("text-xs pl-2", q.correctAnswer === opt && "font-bold text-green-600 flex items-center gap-1")}>
                                    {q.correctAnswer === opt && <CheckCircle className="h-3 w-3"/>} {String.fromCharCode(65 + i)}. {opt}
                                    </p>
                                ))}
                                </div>
                            )}
                             <div className="flex items-center justify-between pt-2 border-t mt-2">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <StarIcon className={cn("h-4 w-4", (q.rating || 0) > 0 ? "text-yellow-400 fill-yellow-400" : "text-gray-300")} /> 
                                    <span>{q.rating?.toFixed(1) || 'N/A'} ({q.ratingsCount || 0} ratings)</span>
                                    <Button variant="link" size="sm" className="text-xs p-0 h-auto ml-1" onClick={() => { setRatingQuestionId(q.id); setCurrentRating(q.userRatings?.find(r => r.userId === currentUser.id)?.rating || 0) }}>Rate</Button>
                                </div>
                                <Button variant="link" size="sm" className="text-xs p-0 h-auto" onClick={() => setCommentingQuestionId(q.id === commentingQuestionId ? null : q.id)}>
                                   Comments ({q.userComments?.length || 0})
                                </Button>
                            </div>
                            {currentUser.role === 'admin' && !q.approved && (
                                <Badge variant="destructive" className="mt-1">Needs Approval</Badge>
                            )}

                            {commentingQuestionId === q.id && (
                                <div className="mt-2 space-y-2">
                                    <Label htmlFor={`comment-${q.id}`} className="text-xs">Your Comment:</Label>
                                    <form onSubmit={handleCommentFormSubmit((data) => onCommentSubmit(data, q.id))} className="flex gap-1">
                                         <Controller
                                            name="commentText"
                                            control={commentFormControl}
                                            render={({ field }) => (
                                                <Input id={`comment-${q.id}`} placeholder="Add a public comment..." {...field} className="text-xs h-8 flex-grow"/>
                                            )}
                                         />
                                         <Button type="submit" size="sm" variant="outline" disabled={!!commentFormErrors.commentText || !commentFormControl.formState.dirtyFields.commentText }><Send className="h-3.5 w-3.5"/></Button>
                                      </form>
                                       {commentFormErrors.commentText && <p className="text-xs text-destructive mt-1">{commentFormErrors.commentText.message}</p>}
                                    {q.userComments && q.userComments.length > 0 && (
                                    <ScrollArea className="h-24 pr-2 text-xs space-y-1.5">
                                        {q.userComments.map(comment => (
                                        <div key={comment.id} className="p-1.5 bg-secondary rounded">
                                            <p className="font-semibold">{comment.userName} <span className="text-muted-foreground/70 text-[10px]">{format(parseISO(comment.timestamp), 'PPp')}</span></p>
                                            <p>{comment.comment}</p>
                                        </div>
                                        ))}
                                    </ScrollArea>
                                    )}
                                </div>
                            )}
                            {ratingQuestionId === q.id && (
                                <div className="mt-2 flex items-center gap-1">
                                    <Label className="text-xs">Rate (1-5):</Label>
                                    {[1,2,3,4,5].map(star => (
                                        <Button key={star} variant="ghost" size="icon" className={cn("h-5 w-5 p-0", currentRating >= star ? "text-yellow-400" : "text-gray-300")} onClick={() => setCurrentRating(star)}>
                                            <StarIcon className="fill-current"/>
                                        </Button>
                                    ))}
                                    <Button size="xs" onClick={() => handleRateQuestion(q.id, currentRating)} disabled={currentRating === 0}>Submit Rating</Button>
                                </div>
                            )}

                        </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                    ))
                ) : (
                    <p className="text-muted-foreground text-center py-6">No questions found matching your criteria.</p>
                )}
            </ScrollArea>

            {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                        <ChevronLeft className="h-4 w-4" /> Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                        Next <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </CardContent>
        <CardFooter className="border-t pt-4">
            <Button onClick={handleCreateQuiz} disabled={selectedQuestionsForQuiz.size === 0} className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white">
                <PlusCircle className="mr-2 h-4 w-4" /> Create Quiz from Selected ({selectedQuestionsForQuiz.size})
            </Button>
        </CardFooter>
      </Card>


      <Dialog open={isQuestionFormOpen} onOpenChange={(isOpen) => { if (!isOpen) { setEditingQuestion(null); resetQuestionForm(); } setIsQuestionFormOpen(isOpen); }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogUITitle className="text-xl">{editingQuestion ? "Edit Question" : "Add New Question"}</DialogUITitle>
          </DialogHeader>
          <form onSubmit={handleQuestionFormSubmit(onQuestionFormSubmit)} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto pr-2">
            <div>
              <Label htmlFor="question-text">Question Text *</Label>
              <Controller name="question" control={questionFormControl} render={({ field }) => <Textarea id="question-text" {...field} rows={3} />} />
              {questionFormErrors.question && <p className="text-sm text-destructive mt-1">{questionFormErrors.question.message}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="question-category">Category *</Label>
                <Controller name="category" control={questionFormControl} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="question-category"><SelectValue placeholder="Select category"/></SelectTrigger>
                        <SelectContent>{ALL_CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
                    </Select>
                )} />
              </div>
              <div>
                <Label htmlFor="question-difficulty">Difficulty</Label>
                <Controller name="difficulty" control={questionFormControl} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || 'Medium'}>
                        <SelectTrigger id="question-difficulty"><SelectValue placeholder="Select difficulty"/></SelectTrigger>
                        <SelectContent>{['Easy', 'Medium', 'Hard'].map(diff => <SelectItem key={diff} value={diff}>{diff}</SelectItem>)}</SelectContent>
                    </Select>
                )} />
              </div>
            </div>
            <div>
              <Label htmlFor="question-tags">Tags (comma-separated)</Label>
              <Controller name="tags" control={questionFormControl} render={({ field }) => <Input id="question-tags" {...field} placeholder="e.g., java, oop, behavioral" />} />
            </div>
             <div className="flex items-center space-x-2">
                <Controller name="isMCQ" control={questionFormControl} render={({ field }) => (
                    <Checkbox id="isMCQ" checked={field.value} onCheckedChange={field.onChange} />
                )} />
                <Label htmlFor="isMCQ" className="font-normal">Is this a Multiple Choice Question?</Label>
            </div>
            {isMCQSelected && (
                <div className="space-y-2 pl-6 border-l-2 border-primary/50 pt-2">
                    <Label>MCQ Options (at least 2 required if MCQ)</Label>
                    {[0,1,2,3].map(index => (
                        <Controller key={index} name={`mcqOptions.${index}` as any} control={questionFormControl} render={({ field }) => (
                            <Input {...field} placeholder={`Option ${index + 1}`} className="text-sm"/>
                        )} />
                    ))}
                     <div>
                        <Label htmlFor="correctAnswer">Correct Answer (exact text of one option)</Label>
                        <Controller name="correctAnswer" control={questionFormControl} render={({ field }) => (
                            <Input id="correctAnswer" {...field} placeholder="Paste the correct option text here"/>
                        )} />
                    </div>
                </div>
            )}
            <div>
              <Label htmlFor="answerOrTip">Suggested Answer / Explanation / Tip *</Label>
              <Controller name="answerOrTip" control={questionFormControl} render={({ field }) => <Textarea id="answerOrTip" {...field} rows={4} />} />
              {questionFormErrors.answerOrTip && <p className="text-sm text-destructive mt-1">{questionFormErrors.answerOrTip.message}</p>}
            </div>
            <DialogUIFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90">{editingQuestion ? "Save Changes" : "Add Question"}</Button>
            </DialogUIFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isInterviewTypeDialogOpen} onOpenChange={setIsInterviewTypeDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogUITitle className="text-xl text-center font-semibold">Interview Type</DialogUITitle>
            <DialogUIDescription className="text-center text-muted-foreground">Select interview type here...</DialogUIDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <ToggleGroup
              type="single"
              value={selectedInterviewType || ""}
              onValueChange={(value: InterviewType) => handleInterviewTypeSelect(value)}
              className="grid grid-cols-3 gap-2"
            >
              {(['friends', 'experts', 'ai'] as InterviewType[]).map(type => (
                <ToggleGroupItem
                  key={type}
                  value={type}
                  aria-label={`Practice with ${type}`}
                  className="h-20 text-sm flex flex-col items-center justify-center data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md"
                >
                  {type === 'friends' && <Users className="mb-1 h-5 w-5"/>}
                  {type === 'experts' && <Brain className="mb-1 h-5 w-5"/>}
                  {type === 'ai' && <Mic className="mb-1 h-5 w-5"/>}
                  Practice with {type.charAt(0).toUpperCase() + type.slice(1)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            {selectedInterviewType === 'friends' && (
              <div className="pt-4 space-y-2">
                <Label htmlFor="friendEmail" className="font-medium">Friend's Email</Label>
                <div className="flex items-center gap-2">
                   <div className="relative flex-grow">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="friendEmail"
                        type="email"
                        placeholder="Enter friend's email address"
                        value={friendEmail}
                        onChange={(e) => {
                        setFriendEmail(e.target.value);
                        if (friendEmailError) setFriendEmailError(null); 
                        }}
                        className={cn("pl-10", friendEmailError && "border-destructive focus-visible:ring-destructive")}
                    />
                   </div>
                    <Button onClick={handleSendInvitation} className="bg-green-600 hover:bg-green-700 text-white">
                        <Send className="mr-2 h-4 w-4"/> Send Invitation
                    </Button>
                </div>
                {friendEmailError && <p className="text-sm text-destructive mt-1">{friendEmailError}</p>}
              </div>
            )}
          </div>
          <DialogUIFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button onClick={handleProceedWithInterviewType} disabled={!selectedInterviewType || (selectedInterviewType === 'friends' && (!friendEmail.trim() || !!friendEmailError)) } className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Next
            </Button>
          </DialogUIFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

