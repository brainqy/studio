
"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Brain, Mic, MessageSquare, Users, Zap, Tag, Lightbulb, CheckSquare as CheckSquareIcon, Code, Puzzle, BookCopy, ListFilter, Info, Share2, RefreshCw, History, Check, X, Star as StarIcon, UserCircle, CalendarDays, ThumbsUp, ShieldCheck, Edit3 as EditIcon, ShieldAlert, PlusCircle, Textarea as TextareaIcon, ChevronLeft, ChevronRight, ListChecks as ListChecksIcon, ChevronDown, MessageCircle as CommentIcon, ThumbsDown, Send } from "lucide-react"; // Added icons
import { sampleInterviewQuestions, sampleUserProfile, sampleMockInterviewSessions, sampleCreatedQuizzes } from "@/lib/sample-data";
import type { InterviewQuestion, InterviewQuestionCategory, MockInterviewSession, CommunityPost, InterviewQuestionDifficulty, InterviewQuestionUserComment } from "@/types";
import { ALL_CATEGORIES, ALL_DIFFICULTIES } from "@/types";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import ScoreCircle from '@/components/ui/score-circle';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from 'next/navigation'; 
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"; // Added Avatar
import { Trash2 } from 'lucide-react';

const questionFormSchema = z.object({
  question: z.string().min(10, "Question text must be at least 10 characters."),
  category: z.enum(ALL_CATEGORIES as [InterviewQuestionCategory, ...InterviewQuestionCategory[]]),
  difficulty: z.enum(ALL_DIFFICULTIES as [InterviewQuestionDifficulty, ...InterviewQuestionDifficulty[]]),
  isMCQ: z.boolean().default(false),
  mcqOptions: z.array(z.string().min(1, "Option cannot be empty.")).optional(),
  correctAnswer: z.string().optional(),
  answerOrTip: z.string().min(10, "Answer/Tip must be at least 10 characters."),
  tags: z.string().optional(),
}).refine(data => {
  if (data.isMCQ) {
    return data.mcqOptions && data.mcqOptions.length >= 2 && data.correctAnswer && data.mcqOptions.includes(data.correctAnswer);
  }
  return true;
}, {
  message: "For MCQ, provide at least 2 options and ensure the correct answer is one of the options.",
  path: ["mcqOptions"],
});

type QuestionFormData = z.infer<typeof questionFormSchema>;

const commentFormSchema = z.object({
  commentText: z.string().min(1, "Comment cannot be empty").max(280, "Comment is too long."),
});
type CommentFormData = z.infer<typeof commentFormSchema>;

const ITEMS_PER_PAGE = 10; 
const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];


export default function InterviewPreparationPage() {
  const [allQuestions, setAllQuestions] = useState<InterviewQuestion[]>(sampleInterviewQuestions);
  const [selectedCategories, setSelectedCategories] = useState<InterviewQuestionCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMcqAnswers, setSelectedMcqAnswers] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const [viewingSession, setViewingSession] = useState<MockInterviewSession | null>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const currentUser = sampleUserProfile;
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const [isCreateQuestionDialogOpen, setIsCreateQuestionDialogOpen] = useState(false);
  const [mcqOptionInputs, setMcqOptionInputs] = useState<string[]>(['', '']);
  
  const [commentingOnQuestionId, setCommentingOnQuestionId] = useState<string | null>(null);
  const { control: commentFormControl, handleSubmit: handleCommentSubmit, reset: resetCommentForm, formState: {errors: commentFormErrors} } = useForm<CommentFormData>({
    resolver: zodResolver(commentFormSchema),
  });

  const { control: questionFormControl, handleSubmit: handleQuestionFormSubmit, reset: resetQuestionForm, watch: watchQuestionForm, setValue: setQuestionFormValue, formState: { errors: questionFormErrors } } = useForm<QuestionFormData>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      isMCQ: false,
      mcqOptions: ['', ''],
      difficulty: 'Medium',
      category: 'Common',
    }
  });

  const isMCQSelected = watchQuestionForm("isMCQ");

  useEffect(() => {
    if (isMCQSelected) {
      if (mcqOptionInputs.length < 2) {
        setMcqOptionInputs(['', '']);
        setQuestionFormValue('mcqOptions', ['', '']);
      }
    }
  }, [isMCQSelected, mcqOptionInputs.length, setQuestionFormValue]);

  const userInterviewHistory = useMemo(() => {
    return sampleMockInterviewSessions.filter(session => session.userId === currentUser.id);
  }, [currentUser.id]);
  
  const createdQuizzes = useMemo(() => {
    return sampleCreatedQuizzes;
  }, []);

  const filteredQuestionsFromBank = useMemo(() => {
    return allQuestions.filter(q => {
      if (!q.isMCQ || !q.mcqOptions || !q.correctAnswer) return false;
      if (q.approved === false && currentUser.role !== 'admin') return false;

      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(q.category);
      const matchesSearch = searchTerm === '' ||
                            q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (q.answerOrTip && q.answerOrTip.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (q.tags && q.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) ||
                            (q.mcqOptions && q.mcqOptions.some(opt => opt.toLowerCase().includes(searchTerm.toLowerCase())));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategories, searchTerm, currentUser.role, allQuestions]);

  const totalPages = Math.ceil(filteredQuestionsFromBank.length / ITEMS_PER_PAGE);
  const paginatedQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredQuestionsFromBank.slice(startIndex, endIndex);
  }, [filteredQuestionsFromBank, currentPage]);

  const handleMcqSelection = (questionId: string, selectedOption: string) => {
    setSelectedMcqAnswers(prev => ({...prev, [questionId]: selectedOption}));
  };

  const getCategoryIcon = (category: InterviewQuestionCategory) => {
    switch(category) {
      case 'Behavioral': return <Users className="h-5 w-5 text-purple-500 flex-shrink-0" title="Behavioral"/>;
      case 'Technical': return <Zap className="h-5 w-5 text-orange-500 flex-shrink-0" title="Technical"/>;
      case 'Coding': return <Code className="h-5 w-5 text-sky-500 flex-shrink-0" title="Coding"/>;
      case 'Role-Specific': return <Brain className="h-5 w-5 text-indigo-500 flex-shrink-0" title="Role-Specific"/>;
      case 'Analytical': return <Puzzle className="h-5 w-5 text-teal-500 flex-shrink-0" title="Analytical"/>;
      case 'HR': return <Lightbulb className="h-5 w-5 text-pink-500 flex-shrink-0" title="HR"/>;
      case 'Common': return <MessageSquare className="h-5 w-5 text-gray-500 flex-shrink-0" title="Common"/>;
      default: return <Puzzle className="h-5 w-5 text-gray-400 flex-shrink-0" />;
    }
  };

  const getDifficultyBadgeVariant = (difficulty?: InterviewQuestionDifficulty): "default" | "secondary" | "destructive" | "outline" => {
    switch (difficulty) {
      case 'Easy': return 'default';
      case 'Medium': return 'secondary';
      case 'Hard': return 'destructive';
      default: return 'outline';
    }
  };

  const handleCreateQuizFromSelection = () => {
    const questionIdsToPass = Array.from(selectedQuestionIds);
    if (questionIdsToPass.length === 0) {
        toast({title: "No Questions Selected", description: "Please select questions to include in the quiz.", variant: "destructive"});
        return;
    }
    // For a real implementation, might open a dialog here to name the quiz & add description
    const newQuizTopic = `Custom Quiz (${new Date().toLocaleDateString()})`;
    const newQuizDescription = `A custom quiz created with ${questionIdsToPass.length} selected questions.`;
    
    // Add to sampleCreatedQuizzes (mock)
    const newQuizId = `quiz-custom-${Date.now()}`;
    sampleCreatedQuizzes.push({
        id: newQuizId,
        userId: currentUser.id,
        topic: newQuizTopic,
        description: newQuizDescription,
        questions: questionIdsToPass.map(id => ({id, questionText: allQuestions.find(q => q.id === id)?.question || 'N/A'})),
        answers: [],
        status: 'pending',
        createdAt: new Date().toISOString(),
    });
    toast({title: "Quiz Created (Mock)", description: `"${newQuizTopic}" has been created. Starting quiz...`});
    router.push(`/interview-prep/quiz?quizId=${newQuizId}`);
  };
  
  const handleEditQuiz = (quizId: string) => {
    toast({ title: "Edit Quiz (Mock)", description: `Editing functionality for quiz ID ${quizId} is not yet fully implemented.` });
    // Placeholder: Could navigate to a quiz editing page or open a dialog
    // router.push(`/interview-prep/quiz/edit/${quizId}`); 
  };

  const handleStartPredefinedQuiz = (quizId: string) => {
     router.push(`/interview-prep/quiz?quizId=${quizId}`);
  };

  const handleViewReport = (session: MockInterviewSession) => {
    setViewingSession(session);
    setIsReportDialogOpen(true);
  };

  const handleShareToFeed = (session: MockInterviewSession | null) => {
    if (!session || !session.overallFeedback || session.overallScore === undefined) {
      toast({ title: "Error", description: "Interview data is not complete for sharing.", variant: "destructive" });
      return;
    }

    let postContent = `Just finished reviewing my AI Mock Interview for "${session.topic}"`;
    if (session.overallScore !== undefined) {
      postContent += ` with a score of ${session.overallScore}%! 📈`;
    } else {
      postContent += `! 📈`;
    }

    if (session.overallFeedback.keyStrengths && session.overallFeedback.keyStrengths.length > 0) {
        postContent += `\n\nKey Strength: "${session.overallFeedback.keyStrengths[0]}"`;
    } else if (session.overallFeedback.overallSummary) {
        postContent += `\n\nLearned a lot: "${session.overallFeedback.overallSummary.substring(0, 100)}${session.overallFeedback.overallSummary.length > 100 ? '...' : ''}"`;
    }
    postContent += `\n\n#AIMockInterview #InterviewPrep #${session.topic.toLowerCase().replace(/\s+/g, '')}`;

    const newPost: CommunityPost = {
      id: `post-hist-interview-${Date.now()}`,
      tenantId: currentUser.tenantId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.profilePictureUrl,
      timestamp: new Date().toISOString(),
      content: postContent,
      type: 'text',
      tags: ['AIMockInterview', 'InterviewPrep', session.topic.toLowerCase().replace(/\s+/g, '')],
      moderationStatus: 'visible',
      flagCount: 0,
      comments: [],
    };
    sampleCommunityPosts.unshift(newPost);
    toast({ title: "Shared to Feed!", description: "Your mock interview reflection has been posted."});
  };

  const onQuestionSubmit = (data: QuestionFormData) => {
    const newQuestion: InterviewQuestion = {
      id: `iq-${Date.now()}`,
      question: data.question,
      category: data.category,
      difficulty: data.difficulty,
      isMCQ: data.isMCQ,
      mcqOptions: data.isMCQ ? data.mcqOptions : undefined,
      correctAnswer: data.isMCQ ? data.correctAnswer : undefined,
      answerOrTip: data.answerOrTip,
      tags: data.tags?.split(',').map(tag => tag.trim()).filter(tag => tag),
      createdBy: currentUser.id,
      approved: false,
      rating: 0, // Initialize rating
      ratingsCount: 0,
      userComments: [], // Initialize comments
      comments: 'Awaiting admin review.'
    };
    setAllQuestions(prev => [newQuestion, ...prev]);
    sampleInterviewQuestions.unshift(newQuestion);
    toast({ title: "Question Created", description: "Your question has been submitted for review." });
    setIsCreateQuestionDialogOpen(false);
    resetQuestionForm({ isMCQ: false, mcqOptions: ['', ''], difficulty: 'Medium', category: 'Common' });
    setMcqOptionInputs(['', '']);
  };

  const addMcqOptionInput = () => {
    setMcqOptionInputs(prev => [...prev, '']);
    const currentMcqOptions = watchQuestionForm('mcqOptions') || [];
    setQuestionFormValue('mcqOptions', [...currentMcqOptions, '']);
  };

  const removeMcqOptionInput = (index: number) => {
    if (mcqOptionInputs.length <= 2) {
      toast({ title: "Minimum Options", description: "MCQ must have at least two options.", variant: "destructive" });
      return;
    }
    setMcqOptionInputs(prev => prev.filter((_, i) => i !== index));
    const currentMcqOptions = watchQuestionForm('mcqOptions') || [];
    setQuestionFormValue('mcqOptions', currentMcqOptions.filter((_, i) => i !== index));
  };

  const handleMcqOptionChange = (index: number, value: string) => {
    const updatedInputs = [...mcqOptionInputs];
    updatedInputs[index] = value;
    setMcqOptionInputs(updatedInputs);
    setQuestionFormValue('mcqOptions', updatedInputs);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  const onCommentSubmit = (data: CommentFormData, questionId: string) => {
    const newComment: InterviewQuestionUserComment = {
      id: `qcomment-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      comment: data.commentText,
      timestamp: new Date().toISOString(),
    };

    setAllQuestions(prevQs => prevQs.map(q => 
      q.id === questionId ? { ...q, userComments: [...(q.userComments || []), newComment] } : q
    ));
    // Update sampleInterviewQuestions if you want this to persist across refreshes (mock persistence)
    const questionIndex = sampleInterviewQuestions.findIndex(q => q.id === questionId);
    if (questionIndex !== -1) {
      sampleInterviewQuestions[questionIndex].userComments = [
        ...(sampleInterviewQuestions[questionIndex].userComments || []),
        newComment,
      ];
    }

    toast({ title: "Comment Added", description: "Your comment has been posted." });
    resetCommentForm({ commentText: '' });
    setCommentingOnQuestionId(null); // Close comment input after submit
  };
  
  const handleRateQuestion = (questionId: string, rating: number) => {
    setAllQuestions(prevQs => prevQs.map(q => {
      if (q.id === questionId) {
        const existingUserRatingIndex = q.userRatings?.findIndex(r => r.userId === currentUser.id);
        let newUserRatings = [...(q.userRatings || [])];
        if (existingUserRatingIndex !== undefined && existingUserRatingIndex > -1) {
          newUserRatings[existingUserRatingIndex] = { userId: currentUser.id, rating };
        } else {
          newUserRatings.push({ userId: currentUser.id, rating });
        }
        const totalRatingSum = newUserRatings.reduce((sum, r) => sum + r.rating, 0);
        const newAverageRating = newUserRatings.length > 0 ? parseFloat((totalRatingSum / newUserRatings.length).toFixed(1)) : 0;
        
        return { ...q, userRatings: newUserRatings, rating: newAverageRating, ratingsCount: newUserRatings.length };
      }
      return q;
    }));
    // Update sample data for mock persistence
     const questionIndex = sampleInterviewQuestions.findIndex(q => q.id === questionId);
    if (questionIndex !== -1) {
      const qToUpdate = sampleInterviewQuestions[questionIndex];
      const existingUserRatingIndex = qToUpdate.userRatings?.findIndex(r => r.userId === currentUser.id);
      let newUserRatings = [...(qToUpdate.userRatings || [])];
        if (existingUserRatingIndex !== undefined && existingUserRatingIndex > -1) {
          newUserRatings[existingUserRatingIndex] = { userId: currentUser.id, rating };
        } else {
          newUserRatings.push({ userId: currentUser.id, rating });
        }
      qToUpdate.userRatings = newUserRatings;
      qToUpdate.rating = parseFloat((newUserRatings.reduce((sum, r) => sum + r.rating, 0) / newUserRatings.length).toFixed(1));
      qToUpdate.ratingsCount = newUserRatings.length;
    }
    toast({ title: "Rating Submitted", description: `You rated this question ${rating} stars.` });
  };


  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookCopy className="h-8 w-8" /> Interview Question Bank
          </h1>
          <CardDescription>Explore multiple-choice questions and expert tips. Select categories to filter.</CardDescription>
        </div>
         <div className="flex gap-2">
             <Button onClick={() => setIsCreateQuestionDialogOpen(true)} variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Question
            </Button>
            <Button variant="default" size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/ai-mock-interview">
                <Mic className="mr-2 h-5 w-5" /> Start AI Mock Interview
                </Link>
            </Button>
         </div>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><ListFilter className="h-5 w-5"/>Filter Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <Input
                id="search-questions"
                placeholder="Search by keywords, tags, topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
            />
            <div>
                <Label className="font-medium mb-2 block text-sm">Filter by Categories:</Label>
                <ToggleGroup
                    type="multiple"
                    variant="outline"
                    value={selectedCategories}
                    onValueChange={(value) => { setSelectedCategories(value as InterviewQuestionCategory[]); }}
                    className="flex flex-wrap gap-2 justify-start"
                >
                    {ALL_CATEGORIES.map(category => (
                        <ToggleGroupItem key={category} value={category} aria-label={`Toggle ${category}`} className="text-xs px-3 py-1.5 h-auto data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                           {getCategoryIcon(category)} <span className="ml-1.5">{category}</span>
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
            </div>
        </CardContent>
      </Card>

      <Dialog open={isCreateQuestionDialogOpen} onOpenChange={setIsCreateQuestionDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl">Create New Interview Question</DialogTitle>
            <DialogDescription>Contribute to the question bank. Your submission will be reviewed.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-6 pl-1 py-4">
            <form onSubmit={handleQuestionFormSubmit(onQuestionSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="q-text">Question Text *</Label>
                <Controller name="question" control={questionFormControl} render={({ field }) => <Textarea id="q-text" {...field} rows={3} />} />
                {questionFormErrors.question && <p className="text-sm text-destructive mt-1">{questionFormErrors.question.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="q-category">Category *</Label>
                  <Controller name="category" control={questionFormControl} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="q-category"><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>{ALL_CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
                    </Select>
                  )} />
                </div>
                <div>
                  <Label htmlFor="q-difficulty">Difficulty *</Label>
                  <Controller name="difficulty" control={questionFormControl} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="q-difficulty"><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                      <SelectContent>{ALL_DIFFICULTIES.map(diff => <SelectItem key={diff} value={diff}>{diff}</SelectItem>)}</SelectContent>
                    </Select>
                  )} />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Controller name="isMCQ" control={questionFormControl} render={({ field }) => <Checkbox id="q-isMCQ" checked={field.value} onCheckedChange={field.onChange} />} />
                <Label htmlFor="q-isMCQ" className="font-normal">Is this a Multiple Choice Question?</Label>
              </div>
              {isMCQSelected && (
                <div className="space-y-3 pl-2 border-l-2 border-primary/50">
                  <Label>MCQ Options (at least 2 required)</Label>
                  {mcqOptionInputs.map((opt, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={opt}
                        onChange={(e) => handleMcqOptionChange(index, e.target.value)}
                        className="flex-grow"
                      />
                       {mcqOptionInputs.length > 2 && (
                         <Button type="button" variant="ghost" size="icon" onClick={() => removeMcqOptionInput(index)} className="text-destructive hover:bg-destructive/10">
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       )}
                    </div>
                  ))}
                   {questionFormErrors.mcqOptions && <p className="text-sm text-destructive mt-1">{questionFormErrors.mcqOptions.message || questionFormErrors.mcqOptions.root?.message}</p>}
                  <Button type="button" variant="outline" size="sm" onClick={addMcqOptionInput}>Add Option</Button>
                  <div>
                    <Label htmlFor="q-correctAnswer">Correct Answer * (must match one of the options)</Label>
                    <Controller name="correctAnswer" control={questionFormControl} render={({ field }) => <Input id="q-correctAnswer" {...field} placeholder="Type the exact correct option text" />} />
                    {questionFormErrors.correctAnswer && <p className="text-sm text-destructive mt-1">{questionFormErrors.correctAnswer.message}</p>}
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="q-answerOrTip">Answer Explanation / Tip *</Label>
                <Controller name="answerOrTip" control={questionFormControl} render={({ field }) => <Textarea id="q-answerOrTip" {...field} rows={4} placeholder="Provide a concise explanation or tip."/>} />
                {questionFormErrors.answerOrTip && <p className="text-sm text-destructive mt-1">{questionFormErrors.answerOrTip.message}</p>}
              </div>
              <div>
                <Label htmlFor="q-tags">Tags (Optional, comma-separated)</Label>
                <Controller name="tags" control={questionFormControl} render={({ field }) => <Input id="q-tags" {...field} placeholder="e.g., javascript, problem-solving"/>} />
              </div>
               <DialogFooter className="mt-4">
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <Button type="submit">Submit Question</Button>
              </DialogFooter>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2"><MessageSquare className="h-6 w-6 text-primary"/>Questions ({filteredQuestionsFromBank.length} matching)</CardTitle>
            <CardDescription>Browse and practice with our curated list of interview questions. Select questions to create a custom quiz.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {paginatedQuestions.length === 0 ? (
            <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg">
                <Zap className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2"/>
                <p>No questions match your criteria.</p>
                <p className="text-xs">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full space-y-3">
              {paginatedQuestions.map((q) => (
                <AccordionItem value={q.id} key={q.id} className="border rounded-lg bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <AccordionTrigger className="text-md text-left hover:no-underline data-[state=open]:bg-secondary/50 relative group py-3 px-4">
                    <div className="flex flex-1 items-center justify-between group">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Checkbox
                              id={`select-q-${q.id}`}
                              checked={selectedQuestionIds.has(q.id)}
                              onCheckedChange={(checked) => {
                                const newSelectedIds = new Set(selectedQuestionIds);
                                if (checked) newSelectedIds.add(q.id);
                                else newSelectedIds.delete(q.id);
                                setSelectedQuestionIds(newSelectedIds);
                              }}
                              onClick={(e) => e.stopPropagation()} 
                              className="h-5 w-5 border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0"
                              aria-label={`Select question: ${q.question}`}
                            />
                          {getCategoryIcon(q.category)}
                          <span className="truncate group-hover:text-primary flex-1">{q.question}</span>
                        </div>
                        <div className="flex items-center gap-2 ml-3 shrink-0">
                            {q.difficulty && <Badge variant={getDifficultyBadgeVariant(q.difficulty)} className="text-xs">{q.difficulty}</Badge>}
                            <Badge variant="outline" className="text-xs">{q.category}</Badge>
                        </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 p-4 text-sm bg-secondary/20">
                    <div className="mb-3 p-3 border rounded-md bg-background">
                        <p className="font-medium text-foreground mb-2">Options:</p>
                        <RadioGroup
                            onValueChange={(value) => handleMcqSelection(q.id, value)}
                            value={selectedMcqAnswers[q.id]}
                            className="space-y-1.5"
                        >
                          {q.mcqOptions!.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2 p-2 rounded hover:bg-primary/5 cursor-pointer">
                              <RadioGroupItem value={option} id={`${q.id}-opt-${index}`} />
                              <Label htmlFor={`${q.id}-opt-${index}`} className="font-normal cursor-pointer flex-1">
                                <span className="font-semibold mr-1.5">{optionLetters[index]}.</span>{option}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                        {selectedMcqAnswers[q.id] && q.correctAnswer && (
                            <div className={cn("mt-3 text-xs font-semibold p-2.5 rounded-md flex items-center gap-1.5",
                                selectedMcqAnswers[q.id] === q.correctAnswer ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            )}>
                                {selectedMcqAnswers[q.id] === q.correctAnswer ? <Check className="h-4 w-4"/> : <X className="h-4 w-4"/>}
                                Your answer is {selectedMcqAnswers[q.id] === q.correctAnswer ? 'correct!' : `incorrect. The correct answer is: ${q.correctAnswer}`}
                            </div>
                        )}
                    </div>
                    <div className="p-3 border rounded-md bg-background">
                        <p className="font-medium text-primary mb-1.5">Explanation/Tip:</p>
                        <p className="text-muted-foreground whitespace-pre-line">{q.answerOrTip}</p>
                    </div>
                    {q.tags && q.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {q.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs flex items-center gap-1">
                            <Tag className="h-3 w-3"/>{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {/* User Rating and Comments Section */}
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                           <StarIcon className={cn("h-4 w-4", q.rating && q.rating > 0 ? "text-yellow-400 fill-yellow-400" : "text-gray-300")}/> 
                           {q.rating?.toFixed(1) || 'N/A'} ({q.ratingsCount || 0} ratings)
                           <span className="mx-1">|</span>
                           <CommentIcon className="h-4 w-4"/> {q.userComments?.length || 0} Comments
                        </div>
                        {/* Rate Question Buttons */}
                        <div className="flex gap-1">
                            {[1,2,3,4,5].map(star => (
                                <Button key={star} variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={() => handleRateQuestion(q.id, star)}>
                                    <StarIcon className={cn("h-4 w-4", q.userRatings?.find(r=>r.userId === currentUser.id)?.rating === star ? "text-yellow-500 fill-yellow-500" : (q.rating && q.rating >= star ? "text-yellow-400 fill-yellow-400/70" : "text-gray-300 hover:text-yellow-400" ))}/>
                                </Button>
                            ))}
                        </div>
                      </div>

                      {/* Existing Comments */}
                      {q.userComments && q.userComments.length > 0 && (
                        <ScrollArea className="max-h-40 mb-2 pr-2">
                        <div className="space-y-2">
                          {q.userComments.map(comment => (
                            <div key={comment.id} className="flex items-start space-x-2 text-xs p-2 bg-background rounded">
                              <Avatar className="h-6 w-6"><AvatarImage src={`https://avatar.vercel.sh/${comment.userId}.png`} /><AvatarFallback>{comment.userName.substring(0,1)}</AvatarFallback></Avatar>
                              <div>
                                <span className="font-semibold text-foreground">{comment.userName}</span> <span className="text-muted-foreground">({formatDistanceToNow(parseISO(comment.timestamp), {addSuffix: true})})</span>:
                                <p className="text-muted-foreground">{comment.comment}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        </ScrollArea>
                      )}
                      
                      {/* Add Comment Form */}
                      <form onSubmit={commentFormControl.handleSubmit(data => onCommentSubmit(data, q.id))} className="flex items-center gap-2 mt-2">
                         <Controller
                            name="commentText"
                            control={commentFormControl}
                            defaultValue=""
                            render={({ field }) => (
                                <Textarea 
                                    {...field} 
                                    placeholder="Add a comment..." 
                                    rows={1} 
                                    className="flex-grow min-h-[36px] text-xs"
                                    onFocus={() => setCommentingOnQuestionId(q.id)} // For other focus logic if needed
                                />
                            )}
                         />
                         <Button type="submit" size="sm" variant="outline" disabled={!!commentFormErrors.commentText || !commentFormControl.formState.dirtyFields.commentText}><Send className="h-3.5 w-3.5"/></Button>
                      </form>
                       {commentFormErrors.commentText && <p className="text-xs text-destructive mt-1">{commentFormErrors.commentText.message}</p>}
                    </div>


                    <div className="mt-3 text-xs text-muted-foreground space-y-1 border-t pt-3">
                        {q.createdBy && <p><span className="font-medium">Created By:</span> {q.createdBy === 'system' ? 'ResumeMatch AI' : q.createdBy}</p>}
                         {currentUser.role === 'admin' && q.comments && <p className="italic"><span className="font-medium">Admin Notes:</span> {q.comments}</p>}
                         {currentUser.role === 'admin' && (
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant={q.approved ? "default" : "destructive"} className={cn(q.approved ? "bg-green-500" : "")}>
                                    {q.approved ? <ShieldCheck className="h-3.5 w-3.5 mr-1"/> : <ShieldAlert className="h-3.5 w-3.5 mr-1"/>}
                                    {q.approved ? 'Approved' : 'Unapproved'}
                                </Badge>
                                <Button variant="outline" size="sm" className="text-xs h-auto py-1 px-2" onClick={() => toast({title: "Edit Approval (Mock)", description: `Toggling approval for question ID: ${q.id}`})}>
                                    <EditIcon className="h-3 w-3 mr-1"/>Change Status
                                </Button>
                            </div>
                         )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-4 pt-4 border-t">
           <Button onClick={handleCreateQuizFromSelection} disabled={selectedQuestionIds.size === 0} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Quiz from Selected ({selectedQuestionIds.size})
          </Button>
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ListChecksIcon className="h-6 w-6 text-primary"/>Created Quizzes</CardTitle>
          <CardDescription>Practice with quizzes created by you or the community.</CardDescription>
        </CardHeader>
        <CardContent>
          {createdQuizzes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No quizzes created yet. Select questions from the bank to create one!</p>
          ) : (
            <div className="space-y-3">
              {createdQuizzes.map(quiz => (
                <Card key={quiz.id} className="p-4 bg-secondary/30 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{quiz.topic}</h4>
                      <p className="text-xs text-muted-foreground">
                        {quiz.questions.length} Questions
                        {quiz.difficulty && ` • Difficulty: ${quiz.difficulty}`}
                        {quiz.questionCategories && quiz.questionCategories.length > 0 && ` • Categories: ${quiz.questionCategories.join(', ')}`}
                      </p>
                      {quiz.description && <p className="text-sm text-muted-foreground mt-1 italic">{quiz.description}</p>}
                    </div>
                    <div className="flex gap-2 mt-2 sm:mt-0">
                        <Button size="sm" variant="outline" onClick={() => handleEditQuiz(quiz.id)}>
                           <EditIcon className="mr-1 h-3 w-3"/> Edit
                        </Button>
                        <Button size="sm" variant="default" onClick={() => handleStartPredefinedQuiz(quiz.id)}>Start Quiz</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History className="h-6 w-6 text-primary"/>Mock Interview History</CardTitle>
          <CardDescription>Review your past AI mock interview sessions and feedback.</CardDescription>
        </CardHeader>
        <CardContent>
          {userInterviewHistory.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No mock interview sessions recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {userInterviewHistory.map(session => (
                <Card key={session.id} className="p-4 bg-secondary/30 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{session.topic}</h4>
                      <p className="text-xs text-muted-foreground">
                        Taken on: {format(parseISO(session.createdAt), 'PPp')}
                        {session.overallScore !== undefined && ` • Score: ${session.overallScore}%`}
                        {session.difficulty && ` • Difficulty: ${session.difficulty}`}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleViewReport(session)}>View Report</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Interview Report: {viewingSession?.topic}</DialogTitle>
            <DialogDescription>
              Session on {viewingSession && format(parseISO(viewingSession.createdAt), 'PPp')}
              {viewingSession?.difficulty && ` • Difficulty: ${viewingSession.difficulty}`}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            {viewingSession?.overallFeedback ? (
                <div className="space-y-4 py-2">
                    {viewingSession.overallScore !== undefined && (
                        <div className="flex justify-center mb-4">
                            <ScoreCircle score={viewingSession.overallScore} size="lg" label="Overall Score"/>
                        </div>
                    )}
                    <p><strong>Summary:</strong> {viewingSession.overallFeedback.overallSummary}</p>
                    {viewingSession.overallFeedback.keyStrengths?.length > 0 && (
                        <div><strong>Strengths:</strong> <ul className="list-disc list-inside">{viewingSession.overallFeedback.keyStrengths.map((s,i) => <li key={`s-${i}`}>{s}</li>)}</ul></div>
                    )}
                    {viewingSession.overallFeedback.keyAreasForImprovement?.length > 0 && (
                         <div><strong>Areas for Improvement:</strong> <ul className="list-disc list-inside">{viewingSession.overallFeedback.keyAreasForImprovement.map((a,i) => <li key={`a-${i}`}>{a}</li>)}</ul></div>
                    )}
                    {viewingSession.overallFeedback.finalTips?.length > 0 && (
                        <div><strong>Final Tips:</strong> <ul className="list-disc list-inside">{viewingSession.overallFeedback.finalTips.map((t,i) => <li key={`t-${i}`}>{t}</li>)}</ul></div>
                    )}
                </div>
            ) : <p>No detailed feedback available for this session.</p>}
          </ScrollArea>
          <DialogFooter className="mt-4 justify-between">
            <Button variant="outline" onClick={() => handleShareToFeed(viewingSession)}>
                <Share2 className="mr-2 h-4 w-4"/> Share to Feed
            </Button>
            <DialogClose asChild><Button>Close</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

       <Card className="shadow-md bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700">
        <CardHeader>
          <CardTitle className="text-lg text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <Lightbulb className="h-5 w-5"/>Pro Tip: Effective Practice
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
          <p>Regularly test yourself with MCQs from different categories.</p>
          <p>Understand why the correct answer is right and why others are wrong.</p>
          <p>Use the explanations to deepen your knowledge.</p>
        </CardContent>
      </Card>
    </div>
  );
}

