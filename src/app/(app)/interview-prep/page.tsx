
"use client";

import type React from 'react';
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle as DialogUITitle, DialogDescription as DialogUIDescription, DialogFooter as DialogUIFooter, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Calendar, Users, ShieldAlert, Type, Languages, MessageSquare, CheckCircle, XCircle, Mic, ListChecks, Search, ChevronLeft, ChevronRight, Tag, Settings2, Puzzle, Lightbulb, Code, Eye, Edit3, Play, PlusCircle, Star as StarIcon, Send, Bookmark as BookmarkIcon, Video, Trash2, ListFilter, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sampleUserProfile, samplePracticeSessions, sampleInterviewQuestions, sampleCreatedQuizzes, sampleLiveInterviewSessions, PREDEFINED_INTERVIEW_TOPICS } from "@/lib/sample-data";
import type { PracticeSession, InterviewQuestion, InterviewQuestionCategory, MockInterviewSession, DialogStep, PracticeSessionConfig, InterviewQuestionUserComment, InterviewQuestionDifficulty, PracticeFocusArea, BankQuestionSortOrder, BankQuestionFilterView, GenerateMockInterviewQuestionsInput, PracticeSessionStatus, AIMockQuestionType, LiveInterviewSession } from '@/types';
import { ALL_CATEGORIES, PRACTICE_FOCUS_AREAS, MOCK_INTERVIEW_STEPS, RESUME_BUILDER_STEPS, ALL_DIFFICULTIES } from '@/types';
import { format, parseISO, isFuture, addMinutes, compareAsc, differenceInMinutes, formatDistanceToNow, isPast } from "date-fns";
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

const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

const questionFormSchema = z.object({
  questionText: z.string().min(10, "Question text is too short.").max(500, "Question text is too long."),
  category: z.enum(ALL_CATEGORIES),
  isMCQ: z.boolean().default(false),
  mcqOptions: z.array(z.string().min(1, "Option text cannot be empty." ).max(255, "Option too long")).optional(),
  correctAnswer: z.string().optional(),
  answerOrTip: z.string().min(10, "Answer/Tip is too short.").max(1000, "Answer/Tip is too long."),
  tags: z.string().optional(),
  difficulty: z.enum(ALL_DIFFICULTIES).optional(),
});
type QuestionFormData = z.infer<typeof questionFormSchema>;

const commentFormSchema = z.object({
    commentText: z.string().min(1, "Comment cannot be empty.").max(500, "Comment too long."),
});
type CommentFormData = z.infer<typeof commentFormSchema>;

const friendEmailSchema = z.string().email("Please enter a valid email address.");


// Client-side component for displaying session date and time to avoid hydration mismatch
const SessionDateTimeDisplay: React.FC<{ dateString?: string }> = ({ dateString }) => {
  const [formattedDateTime, setFormattedDateTime] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && dateString) {
      try {
        const sessionDate = parseISO(dateString);
        const datePart = format(sessionDate, "MMM dd, yyyy");
        const timePart = format(sessionDate, "p");
        setFormattedDateTime(`${datePart} - ${timePart}`);
      } catch (e) {
        console.error("Error formatting date in SessionDateTimeDisplay:", e);
        setFormattedDateTime('Invalid Date');
      }
    } else if (!dateString && isClient) {
      setFormattedDateTime('Date Not Set');
    }
  }, [dateString, isClient]);

  if (!isClient) {
    if (dateString) {
      try {
        return <span>{format(parseISO(dateString), "MMM dd, yyyy")} (loading time...)</span>;
      } catch {
        return <span>Invalid Date</span>;
      }
    }
    return <span>Date Not Set</span>;
  }
  return <span>{formattedDateTime}</span>;
};


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
    resolver: zodResolver(questionFormSchema.refine(data => {
      if (data.isMCQ) {
        const validOptions = data.mcqOptions?.filter(opt => opt && opt.trim() !== "").length || 0;
        if (validOptions < 2) return false;
        if (!data.correctAnswer || data.correctAnswer.trim() === "") return false;
      }
      return true;
    }, {
      message: "For MCQs, provide at least 2 options and a correct answer.",
      path: ["isMCQ"],
    })),
    defaultValues: { questionText: '', isMCQ: false, mcqOptions: ["", "", "", ""], correctAnswer: "", category: 'Common', difficulty: 'Medium', answerOrTip: '', tags: '' }
  });


  const isMCQSelected = watchQuestionForm("isMCQ");

  const [isEditQuestionsDialogOpen, setIsEditQuestionsDialogOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [currentEditingQuestions, setCurrentEditingQuestions] = useState<AIMockQuestionType[]>([]);
  const [newQuestionIdsInput, setNewQuestionIdsInput] = useState('');

  useEffect(() => {
    if (!isSetupDialogOpen) {
      // This effect handles cleanup when the dialog is closed
      setDialogStep('selectType');
      setPracticeSessionConfig({
        type: null, topics: [], dateTime: null, friendEmail: '',
        aiTopicOrRole: '', aiJobDescription: '', aiNumQuestions: 5,
        aiDifficulty: 'medium', aiTimerPerQuestion: 0, aiQuestionCategories: [],
      });
      setFriendEmailError(null);
    }
  }, [isSetupDialogOpen]);


  const upcomingSessions = useMemo(() => practiceSessions.filter(s => s.status === 'SCHEDULED' && s.date && isFuture(parseISO(s.date))), [practiceSessions]);
  const allUserSessions = useMemo(() => practiceSessions, [practiceSessions]);
  const cancelledSessions = useMemo(() => practiceSessions.filter(s => s.status === 'CANCELLED'), [practiceSessions]);

  const handleStartPracticeSetup = () => {
    setPracticeSessionConfig({
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
         // Reset for next time
        setPracticeSessionConfig({ type: null, topics: [], dateTime: null, friendEmail: '', aiTopicOrRole: '', aiJobDescription: '', aiNumQuestions: 5, aiDifficulty: 'medium', aiTimerPerQuestion: 0, aiQuestionCategories: [] });
        setDialogStep('selectType');
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
      if (practiceSessionConfig.type === 'ai' && practiceSessionConfig.topics.length > 0 &&
          practiceSessionConfig.aiTopicOrRole === practiceSessionConfig.topics.join(', ')) {
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
        const newPracticeSess: PracticeSession = {
            id: newSessionId,
            userId: currentUser.id,
            date: practiceSessionConfig.dateTime.toISOString(),
            category: "Practice with Experts",
            type: practiceSessionConfig.topics.join(', ') || "General",
            language: "English",
            status: "SCHEDULED" as PracticeSessionStatus,
            notes: `Scheduled expert session for topics: ${practiceSessionConfig.topics.join(', ')}.`,
        };
        setPracticeSessions(prev => [newPracticeSess, ...prev]);
        samplePracticeSessions.unshift(newPracticeSess);

        const expertInterviewer = samplePlatformUsers.find(u => u.role === 'admin' || u.role === 'manager') || currentUser;
        const newLiveSess: LiveInterviewSession = {
            id: newSessionId,
            tenantId: currentUser.tenantId,
            title: `Expert Mock Interview: ${newPracticeSess.type}`,
            participants: [
                { userId: expertInterviewer.id, name: expertInterviewer.name, role: 'interviewer', profilePictureUrl: expertInterviewer.profilePictureUrl },
                { userId: currentUser.id, name: currentUser.name, role: 'candidate', profilePictureUrl: currentUser.profilePictureUrl }
            ],
            scheduledTime: newPracticeSess.date,
            status: 'Scheduled',
            preSelectedQuestions: sampleInterviewQuestions
                .filter(q => practiceSessionConfig.topics.some(topic =>
                    (q.category && q.category.toLowerCase() === topic.toLowerCase()) ||
                    (q.tags && q.tags.some(tag => tag.toLowerCase() === topic.toLowerCase())) ||
                    (q.questionText && typeof q.questionText === 'string' && q.questionText.toLowerCase().includes(topic.toLowerCase()))
                ))
                .slice(0,5)
                .map(q => ({id: q.id, questionText: q.questionText, category: q.category, difficulty: q.difficulty, baseScore: q.baseScore || 10 })),
        };
        sampleLiveInterviewSessions.unshift(newLiveSess);
        toast({ title: "Expert Session Booked (Mock)", description: `Session for ${newPracticeSess.type} on ${practiceSessionConfig.dateTime ? format(practiceSessionConfig.dateTime, 'PPp') : 'N/A'} scheduled.` });

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
    setPracticeSessionConfig({ type: null, topics: [], dateTime: null, friendEmail: '', aiTopicOrRole: '', aiJobDescription: '', aiNumQuestions: 5, aiDifficulty: 'medium', aiTimerPerQuestion: 0, aiQuestionCategories: [] });
    setDialogStep('selectType');
  };


  const handleCancelPracticeSession = (sessionId: string) => {
    setPracticeSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'CANCELLED' } : s));
    const globalIndex = samplePracticeSessions.findIndex(s => s.id === sessionId);
    if (globalIndex !== -1) {
        samplePracticeSessions[globalIndex].status = 'CANCELLED';
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
      questionsToFilter = questionsToFilter.filter(q => q.approved === true || q.createdBy === currentUser.id || currentUser.role === 'admin');
    }

    questionsToFilter = questionsToFilter.filter(q => {
        if (q.isMCQ) {
            return q.mcqOptions && q.mcqOptions.length >= 2 && q.correctAnswer && q.mcqOptions.some(opt => opt && opt.trim() !== '');
        }
        return true;
    });

    if (selectedBankCategories.length > 0) {
      questionsToFilter = questionsToFilter.filter(q => q.category && selectedBankCategories.includes(q.category));
    }

    if (bankSearchTerm.trim() !== '') {
      const searchTermLower = bankSearchTerm.toLowerCase();
      questionsToFilter = questionsToFilter.filter(q =>
        (q.questionText && typeof q.questionText === 'string' && q.questionText.toLowerCase().includes(searchTermLower)) ||
        (q.tags && q.tags.some(tag => tag.toLowerCase().includes(searchTermLower)))
      );
    }

    if (bankSortOrder === 'highestRated') {
      questionsToFilter.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (bankSortOrder === 'mostRecent') {
      questionsToFilter.sort((a, b) => {
        const dateA = a.createdAt ? parseISO(a.createdAt).getTime() : (parseInt(String(a.id).replace(/\D/g,'')) || 0);
        const dateB = b.createdAt ? parseISO(b.createdAt).getTime() : (parseInt(String(b.id).replace(/\D/g,'')) || 0);
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
        mcqOptions: data.isMCQ ? data.mcqOptions?.map(opt => opt ? opt.trim() : "").filter(opt => opt) : undefined,
        correctAnswer: data.isMCQ ? data.correctAnswer?.trim() : undefined,
        approved: currentUser.role === 'admin',
        createdBy: currentUser.id,
        createdAt: new Date().toISOString(),
        bookmarkedBy: [],
        userComments: [],
        userRatings: [],
        rating: 0,
        ratingsCount: 0,
    };

    if (editingQuestion) {
      setAllBankQuestions(prev => prev.map(q => q.id === editingQuestion.id ? { ...editingQuestion, ...questionPayload, difficulty: data.difficulty || 'Medium', id: String(editingQuestion.id), questionText: data.questionText  } : q));
      const globalQIndex = sampleInterviewQuestions.findIndex(q => q.id === editingQuestion.id);
      if (globalQIndex !== -1) Object.assign(sampleInterviewQuestions[globalQIndex], { ...editingQuestion, ...questionPayload, difficulty: data.difficulty || 'Medium', id: String(editingQuestion.id), questionText: data.questionText });
      toast({ title: "Question Updated", description: "The interview question has been updated." });
    } else {
      const newQuestion: InterviewQuestion = {
        ...questionPayload,
        id: `iq-${Date.now()}`,
        difficulty: data.difficulty || 'Medium',
        questionText: data.questionText, // Ensure questionText is included
      };
      setAllBankQuestions(prev => [newQuestion, ...prev]);
      sampleInterviewQuestions.unshift(newQuestion);
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
     if (currentUser.role !== 'admin' && question.createdBy !== currentUser.id) {
        toast({title: "Permission Denied", description: "You can only edit questions you created.", variant: "destructive"});
        return;
    }
    setEditingQuestion(question);
    setQuestionFormValue('questionText', question.questionText);
    setQuestionFormValue('category', question.category);
    setQuestionFormValue('isMCQ', question.isMCQ || false);
    const options = question.mcqOptions || [];
    const paddedOptions = [...options, ...Array(Math.max(0, 4 - options.length)).fill("")].map(opt => opt || "");
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

  const getCategoryIcon = (category?: InterviewQuestionCategory) => {
    if (!category) return <Puzzle className="h-4 w-4 text-gray-400 flex-shrink-0"/>;
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

  const openEditQuestionsDialog = (sessionId: string) => {
    const liveSession = sampleLiveInterviewSessions.find(ls => ls.id === sessionId);
    if (liveSession && liveSession.preSelectedQuestions) {
        setEditingSessionId(sessionId);
        setCurrentEditingQuestions([...liveSession.preSelectedQuestions]);
        setNewQuestionIdsInput('');
        setIsEditQuestionsDialogOpen(true);
    } else {
        toast({ title: "Error", description: "Could not find session or questions to edit.", variant: "destructive" });
    }
  };

  const handleRemoveQuestionFromDialog = (questionIdToRemove: string) => {
    setCurrentEditingQuestions(prev => prev.filter(q => q.id !== questionIdToRemove));
  };

  const handleSaveQuestionChanges = () => {
    if (!editingSessionId) return;

    const liveSessionIndex = sampleLiveInterviewSessions.findIndex(ls => ls.id === editingSessionId);
    if (liveSessionIndex === -1) {
        toast({ title: "Error", description: "Session not found for update.", variant: "destructive" });
        return;
    }

    const newIds = newQuestionIdsInput.split(',').map(id => id.trim()).filter(id => id);
    const newQuestionsFromBank = newIds
        .map(id => allBankQuestions.find(q => q.id === id))
        .filter(q => q !== undefined)
        .map(q => ({ id: q!.id, questionText: q!.questionText, category: q!.category, difficulty: q!.difficulty, baseScore: q!.baseScore || 10 }));

    const updatedQuestions = [...currentEditingQuestions, ...newQuestionsFromBank];

    sampleLiveInterviewSessions[liveSessionIndex].preSelectedQuestions = updatedQuestions;

    setIsEditQuestionsDialogOpen(false);
    setEditingSessionId(null);
    setCurrentEditingQuestions([]);
    setNewQuestionIdsInput('');
    toast({ title: "Questions Updated", description: "Pre-selected questions for the session have been updated." });
  };


  const renderSessionCard = (session: PracticeSession) => {
    const sessionDate = session.date ? parseISO(session.date) : null;
    const now = new Date();
    let canJoin = false;
    if (session.status === 'SCHEDULED' && sessionDate) {
      if (isFuture(sessionDate)) {
        canJoin = true;
      } else {
        // Allow joining if session started within the last hour
        const sessionEndTime = addMinutes(sessionDate, 60); // Assume 1 hour duration
        canJoin = compareAsc(now, sessionEndTime) <= 0 && compareAsc(now, sessionDate) >=0;
      }
    }

    const liveSession = sampleLiveInterviewSessions.find(ls => ls.id === session.id);
    const isCurrentUserInterviewer = liveSession?.participants.find(p => p.userId === currentUser.id && p.role === 'interviewer');

    return (
    <Card key={session.id} className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg"><SessionDateTimeDisplay dateString={session.date} /></CardTitle>
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
      <CardFooter className="flex flex-wrap gap-2 justify-end">
        {canJoin && (
          <Button variant="default" size="sm" asChild className="bg-green-600 hover:bg-green-700 text-white">
            <Link href={`/live-interview/${session.id}`}>
              <Video className="mr-1 h-4 w-4"/>Join Interview
            </Link>
          </Button>
        )}
        {session.status === 'SCHEDULED' && sessionDate && !canJoin && isPast(sessionDate) && (
            <Badge variant="outline">Session time passed</Badge>
        )}
        {session.status === 'SCHEDULED' && (
          <>
            {(isCurrentUserInterviewer || currentUser.role === 'admin') && session.category === "Practice with Experts" && (
                 <Button variant="outline" size="sm" onClick={() => openEditQuestionsDialog(session.id)}>
                    <Edit3 className="mr-1 h-4 w-4" /> Edit Questions
                 </Button>
            )}
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
};


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


      <Card className="shadow-lg" id="question-bank">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
                <CardTitle className="text-xl font-semibold flex items-center gap-2"><ListFilter className="h-5 w-5 text-primary"/>Question Bank ({filteredBankQuestions.length})</CardTitle>
                <CardDescription>Browse, filter, and select questions for your practice quizzes.</CardDescription>
            </div>
            {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
                 <Button onClick={openNewQuestionDialog} className="w-full sm:w-auto mt-2 sm:mt-0"><PlusCircle className="mr-2 h-4 w-4" /> Add New Question</Button>
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
                                  <span className="font-mono text-[10px]">ID: {q.id}</span>
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
                            <p className="text-xs font-semibold text-muted-foreground">Question ID: <span className="font-mono text-primary">{q.id}</span></p>
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
                            {currentUser.role === 'admin' && !q.approved && q.createdBy !== currentUser.id && (
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
                                <Badge variant="outline" className="mt-1 bg-yellow-100 text-yellow-700 border-yellow-300">Awaiting Approval</Badge>
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
                                            <p className="font-semibold">{comment.userName} <span className="text-muted-foreground/70 text-[10px]">{formatDistanceToNow(parseISO(comment.timestamp), { addSuffix: true })}</span></p>
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
              <Label htmlFor="question-text-form">Question Text *</Label>
              <Controller name="questionText" control={questionFormControl} render={({ field }) => <Textarea id="question-text-form" {...field} rows={3} />} />
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
                        <SelectContent>{ALL_DIFFICULTIES.map(diff => <SelectItem key={diff} value={diff}>{diff}</SelectItem>)}</SelectContent>
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
                    {(watchQuestionForm("mcqOptions") || ["","","",""]).map((optVal,index) => (
                        <Controller
                            key={index}
                            name={`mcqOptions.${index}` as any}
                            control={questionFormControl}
                            render={({ field }) => (
                                <Input {...field} value={field.value || ""} placeholder={`Option ${optionLetters[index] || index + 1}`} className="text-sm"/>
                            )}
                        />
                    ))}
                     <div>
                        <Label htmlFor="correctAnswer">Correct Answer (exact text of one option)</Label>
                        <Controller name="correctAnswer" control={questionFormControl} render={({ field }) => (
                            <Input id="correctAnswer" {...field} value={field.value || ""} placeholder="Paste the correct option text here"/>
                        )} />
                    </div>
                     {questionFormErrors.mcqOptions && <p className="text-sm text-destructive mt-1">{questionFormErrors.mcqOptions?.message || (questionFormErrors.mcqOptions as any)?.[0]?.message || (questionFormErrors as any).isMCQ?.message}</p>}
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

      <Dialog open={isEditQuestionsDialogOpen} onOpenChange={(isOpen) => {
        if (!isOpen) {
            setEditingSessionId(null);
            setCurrentEditingQuestions([]);
            setNewQuestionIdsInput('');
        }
        setIsEditQuestionsDialogOpen(isOpen);
      }}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogUITitle className="text-xl">Edit Pre-selected Questions</DialogUITitle>
                <DialogUIDescription>
                    Session: {sampleLiveInterviewSessions.find(ls => ls.id === editingSessionId)?.title || editingSessionId}
                </DialogUIDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] p-1">
                <div className="py-4 space-y-4 pr-2">
                    <Label className="font-medium">Current Questions ({currentEditingQuestions.length}):</Label>
                    {currentEditingQuestions.length > 0 ? (
                        <ul className="space-y-2">
                            {currentEditingQuestions.map(q => (
                                <li key={q.id} className="flex justify-between items-center p-2 border rounded-md text-sm bg-secondary/50">
                                    <span className="truncate flex-1 mr-2" title={q.questionText}>{q.questionText}</span>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveQuestionFromDialog(q.id)} className="h-7 w-7 text-destructive hover:bg-destructive/10">
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-xs text-muted-foreground text-center">No questions currently selected.</p>}

                    <div className="pt-4 border-t">
                        <Label htmlFor="newQuestionIdsInput" className="font-medium">Add New Question IDs (comma-separated):</Label>
                        <Textarea
                            id="newQuestionIdsInput"
                            value={newQuestionIdsInput}
                            onChange={(e) => setNewQuestionIdsInput(e.target.value)}
                            placeholder="e.g., iq1, mcq5, coding3 (Copy IDs from Question Bank)"
                            rows={3}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Find IDs in the <Link href="/interview-prep#question-bank" className="text-primary hover:underline" onClick={() => setIsEditQuestionsDialogOpen(false)}>Question Bank</Link> below.
                        </p>
                    </div>
                </div>
            </ScrollArea>
            <DialogUIFooter className="mt-2">
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleSaveQuestionChanges} className="bg-primary hover:bg-primary/90">Save Question Changes</Button>
            </DialogUIFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
