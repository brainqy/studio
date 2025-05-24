
"use client";

import type React from 'react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle as DialogUITitle, DialogDescription as DialogUIDescription, DialogFooter as DialogUIFooter, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Calendar, Users, ShieldAlert, Type, Languages, MessageSquare, CheckCircle, XCircle, Mic, ListChecks, Search, ChevronLeft, ChevronRight, Tag, Settings2, Puzzle, Lightbulb, Code, Eye, Edit3, Play, PlusCircle, Star as StarIcon, Send, Mail, ChevronDown, ListFilter, Bookmark as BookmarkIcon, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sampleUserProfile, samplePracticeSessions, sampleInterviewQuestions, sampleCreatedQuizzes, sampleLiveInterviewSessions } from "@/lib/sample-data";
import type { PracticeSession, InterviewQuestion, InterviewQuestionCategory, MockInterviewSession, DialogStep, PracticeSessionConfig, InterviewQuestionUserComment, InterviewQuestionDifficulty, PracticeFocusArea, BankQuestionSortOrder, BankQuestionFilterView, GenerateMockInterviewQuestionsInput, PracticeSessionStatus, LiveInterviewSession, LiveInterviewParticipant } from '@/types';
import { ALL_CATEGORIES, PREDEFINED_INTERVIEW_TOPICS, PRACTICE_FOCUS_AREAS, MOCK_INTERVIEW_STEPS, RESUME_BUILDER_STEPS } from '@/types';
import { format, parseISO, isFuture as dateIsFuture, isPast, addMinutes, compareAsc, differenceInMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from '@/components/ui/badge';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import PracticeTopicSelection from '@/components/features/interview-prep/PracticeTopicSelection';
import PracticeDateTimeSelector from '@/components/features/interview-prep/PracticeDateTimeSelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


type InterviewType = "friends" | "experts" | "ai";

const questionFormSchema = z.object({
  questionText: z.string().min(10, "Question text is too short.").max(500, "Question text is too long."),
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
const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];


export default function InterviewPracticeHubPage() {
  const [isSetupDialogOpen, setIsSetupDialogOpen] = useState(false);
  const [dialogStep, setDialogStep] = useState<DialogStep>('selectType');

  const [practiceSessionConfig, setPracticeSessionConfig] = useState<PracticeSessionConfig>({
    type: null,
    topics: [],
    dateTime: null,
    friendEmail: '',
    aiTopicOrRole: '',
    aiJobDescription: '',
    aiNumQuestions: 5,
    aiDifficulty: 'medium',
    aiTimerPerQuestion: 0,
    aiQuestionCategories: [],
  });
  const [friendEmailError, setFriendEmailError] = useState<string | null>(null);


  const [practiceSessions, setPracticeSessions] = useState<PracticeSession[]>(samplePracticeSessions.filter(s => s.userId === sampleUserProfile.id));
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
    defaultValues: { commentText: '' }
  });

  const [ratingQuestionId, setRatingQuestionId] = useState<string | null>(null);
  const [currentRating, setCurrentRating] = useState(0);

  const [bankSortOrder, setBankSortOrder] = useState<BankQuestionSortOrder>('default');
  const [bankFilterView, setBankFilterView] = useState<BankQuestionFilterView>('all');


  const {
    control: questionFormControl,
    handleSubmit: handleQuestionFormSubmit,
    reset: resetQuestionForm,
    setValue: setQuestionFormValue,
    watch: watchQuestionForm,
    formState: { errors: questionFormErrors }
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: { isMCQ: false, mcqOptions: ["", "", "", ""], category: 'Common', difficulty: 'Medium' }
  });
  const isMCQSelected = watchQuestionForm("isMCQ");


  const upcomingSessions = practiceSessions.filter(s => s.status === 'SCHEDULED' && dateIsFuture(parseISO(s.date)));
  const allUserSessions = practiceSessions; // In real app, filter by user
  const cancelledSessions = practiceSessions.filter(s => s.status === 'CANCELLED');

  const handleStartPracticeSetup = () => {
    setPracticeSessionConfig({
      type: null, topics: [], dateTime: null, friendEmail: '',
      aiTopicOrRole: '', aiJobDescription: '', aiNumQuestions: 5, aiDifficulty: 'medium', aiTimerPerQuestion: 0, aiQuestionCategories: []
    });
    setDialogStep('selectType');
    setFriendEmailError(null);
    setIsSetupDialogOpen(true);
  };

  const handleDialogNextStep = () => {
    if (dialogStep === 'selectType') {
      if (!practiceSessionConfig.type) {
        toast({ title: "Error", description: "Please select an interview type.", variant: "destructive" });
        return;
      }
      if (practiceSessionConfig.type === 'ai') {
        setDialogStep('aiSetupBasic');
        return;
      }
      if (practiceSessionConfig.type === 'friends') {
        if (!practiceSessionConfig.friendEmail?.trim()) {
          setFriendEmailError("Please enter a friend's email.");
          return;
        }
        const emailValidation = friendEmailSchema.safeParse(practiceSessionConfig.friendEmail);
        if (!emailValidation.success) {
          setFriendEmailError(emailValidation.error.errors[0].message);
          return;
        }
        setFriendEmailError(null);
        toast({ title: "Invitation Sent (Mock)", description: `Invitation sent to ${practiceSessionConfig.friendEmail}.` });
        setIsSetupDialogOpen(false);
        return;
      }
      setDialogStep('selectTopics');
    } else if (dialogStep === 'selectTopics') {
      if (practiceSessionConfig.topics.length === 0) {
        toast({ title: "Error", description: "Please select at least one topic.", variant: "destructive" });
        return;
      }
      if (practiceSessionConfig.type === 'ai') {
        setPracticeSessionConfig(prev => ({...prev, aiTopicOrRole: prev.topics.join(', ')}));
        setDialogStep('aiSetupBasic');
      } else {
        setDialogStep('selectTimeSlot');
      }
    } else if (dialogStep === 'aiSetupBasic') {
      if (!practiceSessionConfig.aiTopicOrRole?.trim()) {
          toast({ title: "Error", description: "Please specify the AI interview topic/role.", variant: "destructive" });
          return;
      }
      setDialogStep('aiSetupAdvanced');
    } else if (dialogStep === 'aiSetupAdvanced') {
      setDialogStep('aiSetupCategories');
    }
  };


  const handleDialogPreviousStep = () => {
    if (dialogStep === 'selectTimeSlot') setDialogStep('selectTopics');
    else if (dialogStep === 'selectTopics') setDialogStep('selectType');
    else if (dialogStep === 'aiSetupCategories') setDialogStep('aiSetupAdvanced');
    else if (dialogStep === 'aiSetupAdvanced') setDialogStep('aiSetupBasic');
    else if (dialogStep === 'aiSetupBasic') {
      if (practiceSessionConfig.type === 'ai' && practiceSessionConfig.topics.length > 0 && practiceSessionConfig.aiTopicOrRole === practiceSessionConfig.topics.join(', ')) {
        setDialogStep('selectTopics');
      } else {
        setDialogStep('selectType');
      }
    }
  };

  const handleFinalBookSession = () => {
    if (!practiceSessionConfig.type) {
        toast({ title: "Booking Error", description: "Interview type not selected.", variant: "destructive"});
        return;
    }

    if (practiceSessionConfig.type === 'experts') {
        if (practiceSessionConfig.topics.length === 0 || !practiceSessionConfig.dateTime) {
            toast({ title: "Booking Error", description: "Missing expert session details (topics or date/time).", variant: "destructive"});
            return;
        }
        const newSessionId = `ps-expert-${Date.now()}`;
        const newSession: PracticeSession = {
            id: newSessionId,
            userId: currentUser.id,
            date: practiceSessionConfig.dateTime.toISOString(),
            category: "Practice with Experts",
            type: practiceSessionConfig.topics.join(', ') || "General",
            language: "English", // Assuming English for now
            status: "SCHEDULED" as PracticeSessionStatus,
            notes: `Scheduled expert session for topics: ${practiceSessionConfig.topics.join(', ')}.`,
        };
        
        const updatedPracticeSessions = [newSession, ...practiceSessions];
        setPracticeSessions(updatedPracticeSessions);
        // Update global sample data if this is how your app manages it globally
        const globalPracticeIndex = samplePracticeSessions.findIndex(s => s.id === newSession.id);
        if (globalPracticeIndex === -1) {
            samplePracticeSessions.unshift(newSession);
        } else {
            samplePracticeSessions[globalPracticeIndex] = newSession;
        }


        // Also create a corresponding LiveInterviewSession
        const newLiveSession: LiveInterviewSession = {
            id: newSessionId, // Use the same ID
            tenantId: currentUser.tenantId,
            title: `Expert Mock Interview: ${newSession.type}`,
            participants: [
                { userId: currentUser.id, name: currentUser.name, role: 'candidate', profilePictureUrl: currentUser.profilePictureUrl },
                { userId: `expert-${Date.now()}`, name: 'Expert Interviewer', role: 'interviewer', profilePictureUrl: 'https://avatar.vercel.sh/expert.png' } // Placeholder expert
            ],
            scheduledTime: newSession.date,
            status: 'Scheduled',
            // Pre-select some questions based on topics
            preSelectedQuestions: sampleInterviewQuestions
                .filter(q => practiceSessionConfig.topics.some(topic => q.category === topic || q.tags?.includes(topic.toLowerCase())))
                .slice(0,5) // Select first 5 matching
                .map(q => ({id: q.id, questionText: q.questionText, category: q.category, difficulty: q.difficulty })),
        };
        
        // Add to global sampleLiveInterviewSessions
        const globalLiveIndex = sampleLiveInterviewSessions.findIndex(s => s.id === newLiveSession.id);
        if (globalLiveIndex === -1) {
            sampleLiveInterviewSessions.unshift(newLiveSession);
        } else {
            sampleLiveInterviewSessions[globalLiveIndex] = newLiveSession;
        }


        toast({ title: "Expert Session Booked (Mock)", description: `Session for ${newSession.type} on ${format(practiceSessionConfig.dateTime, 'PPp')} scheduled.` });

    } else if (practiceSessionConfig.type === 'ai') {
        if (!practiceSessionConfig.aiTopicOrRole?.trim()) {
            toast({ title: "Booking Error", description: "Missing AI interview topic/role.", variant: "destructive"});
            return;
        }
        const aiConfigPayload: GenerateMockInterviewQuestionsInput = {
            topic: practiceSessionConfig.aiTopicOrRole,
            jobDescription: practiceSessionConfig.aiJobDescription,
            numQuestions: practiceSessionConfig.aiNumQuestions,
            difficulty: practiceSessionConfig.aiDifficulty,
            timerPerQuestion: practiceSessionConfig.aiTimerPerQuestion === 0 ? undefined : practiceSessionConfig.aiTimerPerQuestion,
            questionCategories: practiceSessionConfig.aiQuestionCategories,
        };

        const queryParams = new URLSearchParams();
        queryParams.append('topic', aiConfigPayload.topic);
        if(aiConfigPayload.jobDescription) queryParams.append('jobDescription', aiConfigPayload.jobDescription);
        if(aiConfigPayload.numQuestions) queryParams.append('numQuestions', String(aiConfigPayload.numQuestions));
        if(aiConfigPayload.difficulty) queryParams.append('difficulty', aiConfigPayload.difficulty);
        if(aiConfigPayload.timerPerQuestion) queryParams.append('timerPerQuestion', String(aiConfigPayload.timerPerQuestion));
        if(aiConfigPayload.questionCategories && aiConfigPayload.questionCategories.length > 0) queryParams.append('categories', aiConfigPayload.questionCategories.join(','));
        queryParams.append('autoFullScreen', 'true');

        router.push(`/ai-mock-interview?${queryParams.toString()}`);
    }
    setIsSetupDialogOpen(false);
  };


  const handleCancelPracticeSession = (sessionId: string) => {
    const updater = (session: PracticeSession) => session.id === sessionId ? { ...session, status: 'CANCELLED' as PracticeSession['status'] } : session;
    setPracticeSessions(prev => prev.map(updater));
    const globalIndex = samplePracticeSessions.findIndex(s => s.id === sessionId);
    if (globalIndex !== -1) {
        (samplePracticeSessions[globalIndex] as any).status = 'CANCELLED';
    }
    toast({ title: "Session Cancelled", description: "The practice session has been cancelled.", variant: "destructive" });
  };

  const handleRescheduleSession = (sessionId: string) => {
     toast({ title: "Reschedule Mocked", description: "Rescheduling functionality for this session is not yet implemented." });
  };

  const filteredBankQuestions = useMemo(() => {
    let questionsToFilter = [...allBankQuestions];

    if (bankFilterView === 'myBookmarks') {
      questionsToFilter = questionsToFilter.filter(q => q.bookmarkedBy?.includes(currentUser.id));
    } else if (bankFilterView === 'needsApproval' && currentUser.role === 'admin') {
      questionsToFilter = questionsToFilter.filter(q => q.approved === false);
    } else {
      // Non-admins should not see unapproved questions unless it's their own pending question
      questionsToFilter = questionsToFilter.filter(q => q.approved !== false || q.createdBy === currentUser.id || currentUser.role === 'admin');
    }

    questionsToFilter = questionsToFilter.filter(q => q.isMCQ && q.mcqOptions && q.correctAnswer);


    if (selectedBankCategories.length > 0) {
      questionsToFilter = questionsToFilter.filter(q => selectedBankCategories.includes(q.category));
    }

    if (bankSearchTerm.trim() !== '') {
      const searchTermLower = bankSearchTerm.toLowerCase();
      questionsToFilter = questionsToFilter.filter(q =>
        q.questionText.toLowerCase().includes(searchTermLower) ||
        (q.tags && q.tags.some(tag => tag.toLowerCase().includes(searchTermLower)))
      );
    }

    if (bankSortOrder === 'highestRated') {
      questionsToFilter.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (bankSortOrder === 'mostRecent') {
      questionsToFilter.sort((a, b) => {
        // Fallback to ID-based sorting if createdAt is missing (for older sample data)
        const dateA = a.createdAt ? parseISO(a.createdAt).getTime() : (parseInt(a.id.replace(/\D/g,'')) || 0);
        const dateB = b.createdAt ? parseISO(b.createdAt).getTime() : (parseInt(b.id.replace(/\D/g,'')) || 0);
        return dateB - dateA;
      });
    }


    return questionsToFilter;
  }, [allBankQuestions, selectedBankCategories, bankSearchTerm, currentUser.role, bankSortOrder, bankFilterView, currentUser.id]);

  const paginatedBankQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * questionsPerPage;
    return filteredBankQuestions.slice(startIndex, startIndex + questionsPerPage);
  }, [filteredBankQuestions, currentPage, questionsPerPage]);

  const totalPages = Math.ceil(filteredBankQuestions.length / questionsPerPage);

  const onQuestionFormSubmit = (data: QuestionFormData) => {
    const questionPayload = {
        ...data,
        tags: data.tags?.split(',').map(t => t.trim()).filter(t => t) || [],
        mcqOptions: data.isMCQ ? data.mcqOptions?.filter(opt => opt && opt.trim() !== "") : undefined,
        correctAnswer: data.isMCQ ? data.correctAnswer : undefined,
        approved: currentUser.role === 'admin', // Auto-approve if admin creates
        createdBy: currentUser.id,
        createdAt: new Date().toISOString(),
        bookmarkedBy: [],
        userComments: [],
        rating: 0,
        ratingsCount: 0,
    };

    if (editingQuestion) {
      setAllBankQuestions(prev => prev.map(q => q.id === editingQuestion.id ? { ...editingQuestion, ...questionPayload, difficulty: data.difficulty || 'Medium' } : q));
      // Update global sample data
      const globalQIndex = sampleInterviewQuestions.findIndex(q => q.id === editingQuestion.id);
      if (globalQIndex !== -1) Object.assign(sampleInterviewQuestions[globalQIndex], { ...editingQuestion, ...questionPayload, difficulty: data.difficulty || 'Medium' });
      toast({ title: "Question Updated", description: "The interview question has been updated." });
    } else {
      const newQuestion: InterviewQuestion = {
        ...questionPayload,
        id: `iq-${Date.now()}`, // Simple unique ID for sample data
        difficulty: data.difficulty || 'Medium',
      };
      setAllBankQuestions(prev => [newQuestion, ...prev]);
      sampleInterviewQuestions.unshift(newQuestion); // Add to global for persistence in demo
      toast({ title: "Question Added", description: `New question added${currentUser.role !== 'admin' ? ' and awaiting approval' : ''}.` });
    }
    setIsQuestionFormOpen(false);
    resetQuestionForm({ questionText: '', category: 'Common', isMCQ: false, mcqOptions: ["", "", "", ""], correctAnswer: '', answerOrTip: '', tags: '', difficulty: 'Medium' });
    setEditingQuestion(null);
  };

  const openNewQuestionDialog = () => {
    setEditingQuestion(null);
    resetQuestionForm({ questionText: '', category: 'Common', isMCQ: false, mcqOptions: ["", "", "", ""], correctAnswer: '', answerOrTip: '', tags: '', difficulty: 'Medium' });
    setIsQuestionFormOpen(true);
  };

  const openEditQuestionDialog = (question: InterviewQuestion) => {
    // Allow editing only if user is admin or the creator of the question
    if (currentUser.role !== 'admin' && question.createdBy !== currentUser.id) {
        toast({title: "Permission Denied", description: "You can only edit questions you created.", variant: "destructive"});
        return;
    }
    setEditingQuestion(question);
    setQuestionFormValue('questionText', question.questionText);
    setQuestionFormValue('category', question.category);
    setQuestionFormValue('isMCQ', question.isMCQ || false);
    // Ensure mcqOptions has at least 4 empty strings if it's undefined or shorter
    const options = question.mcqOptions || [];
    const paddedOptions = [...options, ...Array(Math.max(0, 4 - options.length)).fill("")];
    setQuestionFormValue('mcqOptions', paddedOptions.slice(0,4));
    setQuestionFormValue('correctAnswer', question.correctAnswer || "");
    setQuestionFormValue('answerOrTip', question.answerOrTip);
    setQuestionFormValue('tags', question.tags?.join(', ') || "");
    setQuestionFormValue('difficulty', question.difficulty || 'Medium');
    setIsQuestionFormOpen(true);
  };

  const handleDeleteQuestion = (questionId: string) => {
     const questionToDelete = allBankQuestions.find(q => q.id === questionId);
     if (currentUser.role !== 'admin' && questionToDelete?.createdBy !== currentUser.id) {
        toast({title: "Permission Denied", description: "You can only delete questions you created.", variant: "destructive"});
        return;
    }
    setAllBankQuestions(prev => prev.filter(q => q.id !== questionId));
    const globalQIndex = sampleInterviewQuestions.findIndex(q => q.id === questionId);
    if (globalQIndex !== -1) sampleInterviewQuestions.splice(globalQIndex, 1);
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
    const newComment: InterviewQuestionUserComment = {
        id: `uc-${questionId}-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        comment: data.commentText,
        timestamp: new Date().toISOString(),
    };
    setAllBankQuestions(prevQs => prevQs.map(q =>
        q.id === questionId ? { ...q, userComments: [...(q.userComments || []), newComment] } : q
    ));
    const globalQIndex = sampleInterviewQuestions.findIndex(q => q.id === questionId);
    if (globalQIndex !== -1) {
      const currentComments = sampleInterviewQuestions[globalQIndex].userComments || [];
      sampleInterviewQuestions[globalQIndex].userComments = [...currentComments, newComment];
    }
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

    // Update global sample data
    const globalQIndex = sampleInterviewQuestions.findIndex(q => q.id === questionId);
    if (globalQIndex !== -1) {
      const existingRatingIndex = sampleInterviewQuestions[globalQIndex].userRatings?.findIndex(r => r.userId === currentUser.id);
      let newUserRatings = [...(sampleInterviewQuestions[globalQIndex].userRatings || [])];
       if (existingRatingIndex !== undefined && existingRatingIndex !== -1) {
          newUserRatings[existingRatingIndex] = { userId: currentUser.id, rating };
      } else {
          newUserRatings.push({ userId: currentUser.id, rating });
      }
      const totalRatingSum = newUserRatings.reduce((sum, r) => sum + r.rating, 0);
      sampleInterviewQuestions[globalQIndex].userRatings = newUserRatings;
      sampleInterviewQuestions[globalQIndex].rating = newUserRatings.length > 0 ? parseFloat((totalRatingSum / newUserRatings.length).toFixed(1)) : 0;
      sampleInterviewQuestions[globalQIndex].ratingsCount = newUserRatings.length;
    }

    setRatingQuestionId(null);
    setCurrentRating(0);
    toast({ title: "Rating Submitted", description: `You rated this question ${rating} stars.` });
  };

  const handleToggleBookmarkQuestion = (questionId: string) => {
    setAllBankQuestions(prevQs => prevQs.map(q => {
        if (q.id === questionId) {
            const currentBookmarks = q.bookmarkedBy || [];
            const userHasBookmarked = currentBookmarks.includes(currentUser.id);
            const newBookmarks = userHasBookmarked
                ? currentBookmarks.filter(id => id !== currentUser.id)
                : [...currentBookmarks, currentUser.id];
            return { ...q, bookmarkedBy: newBookmarks };
        }
        return q;
    }));
    // Update global sample data
    const globalQIndex = sampleInterviewQuestions.findIndex(q => q.id === questionId);
    let isNowBookmarked = false;
    if (globalQIndex !== -1) {
      const currentBookmarks = sampleInterviewQuestions[globalQIndex].bookmarkedBy || [];
      const userHasBookmarked = currentBookmarks.includes(currentUser.id);
      isNowBookmarked = !userHasBookmarked;
      sampleInterviewQuestions[globalQIndex].bookmarkedBy = isNowBookmarked
          ? [...currentBookmarks, currentUser.id]
          : currentBookmarks.filter(id => id !== currentUser.id);
    }
    toast({ title: isNowBookmarked ? "Question Bookmarked" : "Bookmark Removed" });
  };


  const renderSessionCard = (session: PracticeSession) => {
    const sessionDate = parseISO(session.date);
    const now = new Date();
    // Allow joining if session is in the future, OR if it started in the last 60 minutes
    const canJoin = session.status === 'SCHEDULED' && 
                    (dateIsFuture(sessionDate) || (isPast(sessionDate) && differenceInMinutes(now, sessionDate) <= 60));
    
    return (
    <Card key={session.id} className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{format(sessionDate, "MMM dd, yyyy - p")}</CardTitle>
          <span className={cn(
            "px-2 py-1 text-xs font-semibold rounded-full",
            session.status === 'SCHEDULED' ? "bg-green-100 text-green-700" :
            session.status === 'COMPLETED' ? "bg-blue-100 text-blue-700" :
            "bg-red-100 text-red-700"
          )}>
            {session.status}
          </span>
        </div>
        <CardDescription className="text-sm">{session.category}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1 text-xs text-muted-foreground">
        <p className="flex items-center gap-1"><Type className="h-3.5 w-3.5"/>Focus: {session.type}</p>
        <p className="flex items-center gap-1"><Languages className="h-3.5 w-3.5"/>Language: {session.language}</p>
        {session.notes && <p className="text-xs text-muted-foreground pt-1 italic">Notes: {session.notes}</p>}
      </CardContent>
      <CardFooter className="flex gap-2">
        {canJoin && (
          <Button variant="default" size="sm" asChild className="bg-green-600 hover:bg-green-700 text-white">
            <Link href={`/live-interview/${session.id}`}>
              <Video className="mr-1 h-4 w-4"/>Join Interview
            </Link>
          </Button>
        )}
        {session.status === 'SCHEDULED' && !canJoin && !dateIsFuture(sessionDate) && (
            <Badge variant="outline">Session time passed</Badge>
        )}
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
        {session.status === 'COMPLETED' && (
           <Button variant="outline" size="sm" onClick={() => toast({title: "View Report (Mock)"})}><Eye className="mr-1 h-4 w-4"/>View Report</Button>
        )}
        {session.status === 'CANCELLED' && (
           <p className="text-xs text-red-500">This session was cancelled.</p>
        )}
      </CardFooter>
    </Card>
  );
}


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
                <Button size="lg" onClick={handleStartPracticeSetup} className="bg-primary hover:bg-primary/90 text-primary-foreground">
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
                <CardTitle className="text-xl font-semibold flex items-center gap-2"><ListFilter className="h-5 w-5 text-primary"/>Question Bank ({filteredBankQuestions.length})</CardTitle>
                <CardDescription>Browse, filter, and select questions for your practice quizzes.</CardDescription>
            </div>
            {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
                 <Button onClick={openNewQuestionDialog}><PlusCircle className="mr-2 h-4 w-4" /> Add New Question</Button>
            )}
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                    placeholder="Search questions or tags..."
                    value={bankSearchTerm}
                    onChange={e => setBankSearchTerm(e.target.value)}
                    className="md:col-span-2"
                />
                <Select value={bankSortOrder} onValueChange={(value: BankQuestionSortOrder) => setBankSortOrder(value)}>
                    <SelectTrigger><SelectValue placeholder="Sort by..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="highestRated">Highest Rated</SelectItem>
                        <SelectItem value="mostRecent">Most Recent</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                 <Label className="font-medium mb-2 block text-sm">Filter by:</Label>
                 <div className="flex flex-col sm:flex-row gap-2">
                    <ToggleGroup
                        type="single"
                        variant="outline"
                        value={bankFilterView}
                        onValueChange={(value: BankQuestionFilterView) => { if(value) setBankFilterView(value);}}
                        className="flex flex-wrap gap-1 justify-start"
                    >
                        <ToggleGroupItem value="all" aria-label="All Questions" className="text-xs px-2 py-1 h-auto data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">All Questions</ToggleGroupItem>
                        <ToggleGroupItem value="myBookmarks" aria-label="My Bookmarks" className="text-xs px-2 py-1 h-auto data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">My Bookmarks</ToggleGroupItem>
                        {currentUser.role === 'admin' && <ToggleGroupItem value="needsApproval" aria-label="Needs Approval" className="text-xs px-2 py-1 h-auto data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Needs Approval</ToggleGroupItem>}
                    </ToggleGroup>
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
            </div>

            <ScrollArea className="h-[500px] pr-2 -mr-2">
                {paginatedBankQuestions.length > 0 ? (
                    paginatedBankQuestions.map(q => (
                    <Accordion key={q.id} type="single" collapsible className="border rounded-md mb-2 bg-card shadow-sm hover:shadow-md transition-shadow">
                        <AccordionItem value={`item-${q.id}`} className="border-b-0">
                          <AccordionTrigger
                            asChild={true}
                            className="px-4 py-3 text-left text-sm font-medium group hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=open]:bg-secondary/50 data-[state=open]:rounded-b-none rounded-t-md"
                          >
                            <div className="flex items-start flex-1 gap-3 w-full">
                                <div className="flex items-center pt-0.5">
                                    <Checkbox
                                        id={`select-q-${q.id}`}
                                        checked={selectedQuestionsForQuiz.has(q.id)}
                                        onCheckedChange={() => handleToggleQuestionForQuiz(q.id)}
                                        aria-label={`Select question: ${q.questionText}`}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                              <div className="flex-1 text-left">
                                <div className="flex items-center gap-2 mb-0.5">
                                  {getCategoryIcon(q.category)}
                                  <span className="font-medium text-foreground">{q.questionText}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
                                  <span>ID: {q.id.substring(0,8)}...</span>
                                  <span className="mx-1">|</span>
                                  {q.difficulty && <Badge variant="outline" className="text-[10px] px-1 py-0">{q.difficulty}</Badge>}
                                  {q.tags && q.tags.length > 0 && (<span className="mx-1 hidden sm:inline">|</span>)}
                                  {q.tags?.slice(0,2).map(tag => <Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0 hidden sm:inline-flex">{tag}</Badge>)}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleToggleBookmarkQuestion(q.id); }}>
                                  <BookmarkIcon className={cn("h-4 w-4", q.bookmarkedBy?.includes(currentUser.id) && "fill-yellow-400 text-yellow-500")}/>
                                </Button>
                                {(q.createdBy === currentUser.id || currentUser.role === 'admin') && (
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openEditQuestionDialog(q); }}>
                                    <Edit3 className="h-4 w-4"/>
                                  </Button>
                                )}
                                {currentUser.role === 'admin' && (
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(q.id);}}>
                                     <XCircle className="h-4 w-4"/>
                                  </Button>
                                )}
                                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                              </div>
                            </div>
                          </AccordionTrigger>
                        <AccordionContent className="px-4 pb-3 pt-1 space-y-3">
                            <div className="bg-primary/5 p-3 rounded-md">
                                <p className="text-xs font-semibold text-primary mb-1">Suggested Answer/Tip:</p>
                                <p className="text-xs text-foreground whitespace-pre-line">{q.answerOrTip}</p>
                            </div>
                            {q.isMCQ && q.mcqOptions && q.mcqOptions.length > 0 && (
                                <div className="space-y-1">
                                <p className="text-xs font-semibold text-muted-foreground">MCQ Options:</p>
                                {q.mcqOptions.filter(opt => opt && opt.trim() !== "").map((opt, i) => (
                                    <p key={i} className={cn("text-xs pl-2", q.correctAnswer === opt && "font-bold text-green-600 flex items-center gap-1")}>
                                    {q.correctAnswer === opt && <CheckCircle className="h-3 w-3"/>} {optionLetters[i]}. {opt}
                                    </p>
                                ))}
                                </div>
                            )}
                             <div className="flex items-center justify-between pt-2 border-t mt-2">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <StarIcon className={cn("h-4 w-4", (q.rating || 0) > 0 ? "text-yellow-400 fill-yellow-400" : "text-gray-300")} />
                                    <span>{q.rating?.toFixed(1) || 'N/A'} ({q.ratingsCount || 0} ratings)</span>
                                    <Button variant="link" size="sm" className="text-xs p-0 h-auto ml-1" onClick={() => { setRatingQuestionId(q.id); setCurrentRating(q.userRatings?.find(r => r.userId === currentUser.id)?.rating || 0); }}>Rate</Button>
                                </div>
                                <Button variant="link" size="sm" className="text-xs p-0 h-auto" onClick={() => setCommentingQuestionId(q.id === commentingQuestionId ? null : q.id)}>
                                   Comments ({q.userComments?.length || 0})
                                </Button>
                            </div>
                            {currentUser.role === 'admin' && !q.approved && q.createdBy !== currentUser.id && ( // Show approve button if admin and not creator and not approved
                                 <Button variant="outline" size="xs" className="mt-2 text-green-600 border-green-500 hover:bg-green-50" onClick={() => {
                                     setAllBankQuestions(prev => prev.map(qn => qn.id === q.id ? {...qn, approved: true} : qn));
                                     const gIdx = sampleInterviewQuestions.findIndex(sq => sq.id === q.id);
                                     if (gIdx !== -1) sampleInterviewQuestions[gIdx].approved = true;
                                     toast({title: "Question Approved"});
                                 }}>
                                     <CheckCircle className="mr-1 h-3.5 w-3.5"/> Approve
                                 </Button>
                            )}
                             {q.approved === false && q.createdBy === currentUser.id && (
                                <Badge variant="warning" className="mt-1">Awaiting Approval</Badge>
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
                                         <Button type="submit" size="sm" variant="outline" disabled={!!commentFormErrors.commentText || !commentFormControl.getValues('commentText')?.trim() }><Send className="h-3.5 w-3.5"/></Button>
                                      </form>
                                       {commentFormErrors.commentText && <p className="text-xs text-destructive mt-1">{commentFormErrors.commentText.message}</p>}
                                    {q.userComments && q.userComments.length > 0 && (
                                    <ScrollArea className="h-24 pr-2 text-xs space-y-1.5">
                                        {q.userComments.map(comment => (
                                        <div key={comment.id} className="p-1.5 bg-secondary rounded">
                                            <p className="font-semibold">{comment.userName} <span className="text-muted-foreground/70 text-[10px]">{format(parseISO(comment.timestamp), 'PPp')}</span></p>
                                            <p>{comment.text}</p>
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
              <Controller name="questionText" control={questionFormControl} render={({ field }) => <Textarea id="question-text" {...field} rows={3} />} />
              {questionFormErrors.questionText && <p className="text-sm text-destructive mt-1">{questionFormErrors.questionText.message}</p>}
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
                 {questionFormErrors.category && <p className="text-sm text-destructive mt-1">{questionFormErrors.category.message}</p>}
              </div>
              <div>
                <Label htmlFor="question-difficulty">Difficulty</Label>
                <Controller name="difficulty" control={questionFormControl} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || 'Medium'}>
                        <SelectTrigger id="question-difficulty"><SelectValue placeholder="Select difficulty"/></SelectTrigger>
                        <SelectContent>{(['Easy', 'Medium', 'Hard'] as InterviewQuestionDifficulty[]).map(diff => <SelectItem key={diff} value={diff}>{diff}</SelectItem>)}</SelectContent>
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
                    {(watchQuestionForm("mcqOptions") || ["","","",""]).map((_,index) => ( // Ensure at least 4 fields render initially
                        <Controller key={index} name={`mcqOptions.${index}` as any} control={questionFormControl} render={({ field }) => (
                            <Input {...field} placeholder={`Option ${optionLetters[index] || index + 1}`} className="text-sm"/>
                        )} />
                    ))}
                     <div>
                        <Label htmlFor="correctAnswer">Correct Answer (exact text of one option)</Label>
                        <Controller name="correctAnswer" control={questionFormControl} render={({ field }) => (
                            <Input id="correctAnswer" {...field} placeholder="Paste the correct option text here"/>
                        )} />
                    </div>
                     {questionFormErrors.mcqOptions && <p className="text-sm text-destructive mt-1">Please provide at least two valid options for MCQ.</p>}
                     {questionFormErrors.correctAnswer && <p className="text-sm text-destructive mt-1">{questionFormErrors.correctAnswer.message}</p>}
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

      <Dialog open={isSetupDialogOpen} onOpenChange={setIsSetupDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogUITitle className="text-xl text-center font-semibold">
              {dialogStep === 'selectType' && "Select Interview Type"}
              {dialogStep === 'selectTopics' && `Select Practice Topics for ${practiceSessionConfig.type === 'ai' ? 'AI Interview' : 'Expert Session'}`}
              {dialogStep === 'selectTimeSlot' && "Choose Date & Time"}
              {dialogStep === 'aiSetupBasic' && "AI Interview: Basic Setup"}
              {dialogStep === 'aiSetupAdvanced' && "AI Interview: Advanced Options"}
              {dialogStep === 'aiSetupCategories' && "AI Interview: Question Categories"}
            </DialogUITitle>
            <DialogUIDescription className="text-center text-muted-foreground">
              {dialogStep === 'selectType' && "How would you like to practice?"}
              {dialogStep === 'selectTopics' && `For your ${practiceSessionConfig.type} interview.`}
              {dialogStep === 'selectTimeSlot' && `For your ${practiceSessionConfig.type} interview on ${practiceSessionConfig.topics.join(', ')}.`}
              {dialogStep === 'aiSetupBasic' && "Tell us about the role or topic for your AI mock interview."}
              {dialogStep === 'aiSetupAdvanced' && "Configure the number of questions, difficulty, and timer."}
              {dialogStep === 'aiSetupCategories' && "Optionally, select specific question categories for your AI interview."}
            </DialogUIDescription>
          </DialogHeader>

          <div className="py-4 space-y-4 min-h-[200px]">
            {dialogStep === 'selectType' && (
              <>
                <ToggleGroup
                  type="single"
                  value={practiceSessionConfig.type || ""}
                  onValueChange={(value: PracticeSessionConfig['type']) => setPracticeSessionConfig(p => ({...p, type: value, friendEmail: '', topics: []}))}
                  className="grid grid-cols-3 gap-2"
                >
                  {(['friends', 'experts', 'ai'] as InterviewType[]).map(type => (
                    <ToggleGroupItem
                      key={type} value={type} aria-label={`Practice with ${type}`}
                      className="h-20 text-sm flex flex-col items-center justify-center data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md"
                    >
                      {type === 'friends' && <Users className="mb-1 h-5 w-5"/>}
                      {type === 'experts' && <Brain className="mb-1 h-5 w-5"/>}
                      {type === 'ai' && <Mic className="mb-1 h-5 w-5"/>}
                      Practice with {type.charAt(0).toUpperCase() + type.slice(1)}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                {practiceSessionConfig.type === 'friends' && (
                  <div className="pt-4 space-y-1">
                    <Label htmlFor="friendEmailDialog" className="font-medium text-sm">Friend's Email</Label>
                     <Input
                        id="friendEmailDialog" type="email" placeholder="Enter friend's email"
                        value={practiceSessionConfig.friendEmail || ''}
                        onChange={(e) => {
                           setPracticeSessionConfig(p => ({...p, friendEmail: e.target.value}));
                           if (friendEmailError) setFriendEmailError(null);
                        }}
                        className={cn(friendEmailError && "border-destructive focus-visible:ring-destructive")}
                     />
                    {friendEmailError && <p className="text-xs text-destructive mt-1">{friendEmailError}</p>}
                  </div>
                )}
              </>
            )}

            {dialogStep === 'selectTopics' && (practiceSessionConfig.type === 'experts' || practiceSessionConfig.type === 'ai') && (
              <PracticeTopicSelection
                availableTopics={PREDEFINED_INTERVIEW_TOPICS}
                initialSelectedTopics={practiceSessionConfig.topics}
                onSelectionChange={(selected) => setPracticeSessionConfig(p => ({...p, topics: selected}))}
              />
            )}

            {dialogStep === 'aiSetupBasic' && practiceSessionConfig.type === 'ai' && (
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="aiTopicOrRole">Interview Topic / Role *</Label>
                        <Input id="aiTopicOrRole" placeholder="e.g., Frontend Developer" value={practiceSessionConfig.aiTopicOrRole} onChange={e => setPracticeSessionConfig(p => ({...p, aiTopicOrRole: e.target.value}))} />
                    </div>
                    <div>
                        <Label htmlFor="aiJobDescription">Job Description (Optional)</Label>
                        <Textarea id="aiJobDescription" placeholder="Paste job description for tailored questions..." value={practiceSessionConfig.aiJobDescription} onChange={e => setPracticeSessionConfig(p => ({...p, aiJobDescription: e.target.value}))} rows={4}/>
                    </div>
                </div>
            )}
            {dialogStep === 'aiSetupAdvanced' && practiceSessionConfig.type === 'ai' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="aiNumQuestions">Number of Questions (1-50)</Label>
                        <Input id="aiNumQuestions" type="number" min="1" max="50" value={practiceSessionConfig.aiNumQuestions} onChange={e => setPracticeSessionConfig(p => ({...p, aiNumQuestions: parseInt(e.target.value,10) || 5}))} />
                    </div>
                    <div>
                        <Label htmlFor="aiDifficulty">Difficulty</Label>
                        <Select value={practiceSessionConfig.aiDifficulty} onValueChange={(value: 'easy'|'medium'|'hard') => setPracticeSessionConfig(p => ({...p, aiDifficulty: value}))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="easy">Easy</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="md:col-span-2">
                        <Label htmlFor="aiTimerPerQuestion">Time per Question (seconds)</Label>
                         <Select value={String(practiceSessionConfig.aiTimerPerQuestion || 0)} onValueChange={(value) => setPracticeSessionConfig(p => ({...p, aiTimerPerQuestion: Number(value)}))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">No Timer</SelectItem>
                                {[30,60,90,120,180,300].map(t => <SelectItem key={t} value={String(t)}>{t/60} min{t/60 > 1 ? 's' : ''} ({t}s)</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                 </div>
            )}
             {dialogStep === 'aiSetupCategories' && practiceSessionConfig.type === 'ai' && (
                <PracticeTopicSelection
                    availableTopics={ALL_CATEGORIES as any}
                    initialSelectedTopics={practiceSessionConfig.aiQuestionCategories || []}
                    onSelectionChange={(selected) => setPracticeSessionConfig(p => ({...p, aiQuestionCategories: selected as InterviewQuestionCategory[]}))}
                />
            )}


            {dialogStep === 'selectTimeSlot' && practiceSessionConfig.type === 'experts' && (
               <PracticeDateTimeSelector
                initialSelectedDate={practiceSessionConfig.dateTime || undefined}
                initialSelectedTime={practiceSessionConfig.dateTime ? format(practiceSessionConfig.dateTime, 'HH:mm') : undefined}
                onDateTimeChange={(date, time) => {
                    if (date && time) {
                        const [hoursStr, minutesStr] = time.split(':');
                        const hours = parseInt(hoursStr, 10);
                        const minutes = parseInt(minutesStr, 10);
                        const finalDateTime = new Date(date);
                        finalDateTime.setHours(hours, minutes, 0, 0);
                        setPracticeSessionConfig(p => ({ ...p, dateTime: finalDateTime }));
                    } else {
                         setPracticeSessionConfig(p => ({ ...p, dateTime: null }));
                    }
                }}
              />
            )}
          </div>

          <DialogUIFooter className="mt-2">
            {dialogStep !== 'selectType' && (
              <Button variant="outline" onClick={handleDialogPreviousStep}>Back</Button>
            )}

            {dialogStep === 'selectType' && (
              <Button onClick={handleDialogNextStep} disabled={!practiceSessionConfig.type || (practiceSessionConfig.type === 'friends' && (!practiceSessionConfig.friendEmail || !!friendEmailError))}>
                {practiceSessionConfig.type === 'friends' ? "Send Invitation" : "Next"}
              </Button>
            )}
            {dialogStep === 'selectTopics' && (practiceSessionConfig.type === 'experts' || practiceSessionConfig.type === 'ai') && (
                 <Button onClick={handleDialogNextStep} disabled={practiceSessionConfig.topics.length === 0}>Next</Button>
            )}
            {dialogStep === 'aiSetupBasic' && practiceSessionConfig.type === 'ai' && (
                 <Button onClick={handleDialogNextStep} disabled={!practiceSessionConfig.aiTopicOrRole?.trim()}>Next</Button>
            )}
             {dialogStep === 'aiSetupAdvanced' && practiceSessionConfig.type === 'ai' && (
                 <Button onClick={handleDialogNextStep}>Next</Button>
            )}

            {dialogStep === 'selectTimeSlot' && practiceSessionConfig.type === 'experts' && (
              <Button onClick={handleFinalBookSession} disabled={!practiceSessionConfig.dateTime} className="bg-green-600 hover:bg-green-700 text-white">Book Expert Session</Button>
            )}
             {dialogStep === 'aiSetupCategories' && practiceSessionConfig.type === 'ai' && (
                 <Button onClick={handleFinalBookSession} className="bg-green-600 hover:bg-green-700 text-white">Start AI Interview</Button>
            )}

            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
          </DialogUIFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
    

    