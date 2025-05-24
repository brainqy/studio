
"use client";

import type React from 'react';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mic, ListChecks, Search, ChevronLeft, ChevronRight, Tag, Settings2, Puzzle, Lightbulb, Code as CodeIcon, Eye, Edit3, Play, PlusCircle, Star as StarIcon, Send, Bookmark as BookmarkIcon, Video, Trash2, ListFilter, ChevronDown, User as UserIcon, XCircle as XCircleIcon, Calendar, MessageSquare, Users as UsersGroupIcon, Brain, CheckCircle, Timer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sampleUserProfile, samplePracticeSessions, sampleInterviewQuestions, sampleCreatedQuizzes, sampleLiveInterviewSessions, SAMPLE_DATA_BASE_DATE } from "@/lib/sample-data";
import type { PracticeSession, InterviewQuestion, InterviewQuestionCategory, MockInterviewSession, DialogStep, PracticeSessionConfig, InterviewQuestionUserComment, InterviewQuestionDifficulty, PracticeFocusArea, BankQuestionSortOrder, BankQuestionFilterView, GenerateMockInterviewQuestionsInput, PracticeSessionStatus, PracticeSessionType, LiveInterviewSession } from '@/types';
import { ALL_CATEGORIES, PREDEFINED_INTERVIEW_TOPICS, MOCK_INTERVIEW_STEPS, RESUME_BUILDER_STEPS } from '@/types';
import { format, parseISO, isFuture, addMinutes, compareAsc, differenceInMinutes, isPast } from "date-fns";
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


const questionFormSchema = z.object({
  questionText: z.string().min(10, "Question text is too short.").max(500, "Question text is too long."),
  category: z.enum(ALL_CATEGORIES),
  isMCQ: z.boolean().default(false),
  mcqOptions: z.array(z.string().min(1, "Option text cannot be empty").max(255, "Option too long")).min(2, "At least two options required for MCQ").max(6, "Maximum 6 options").optional(),
  correctAnswer: z.string().optional(),
  answerOrTip: z.string().min(10, "Answer/Tip is too short.").max(1000, "Answer/Tip is too long."),
  tags: z.string().optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional().default('Medium'),
}).refine(data => {
  if (data.isMCQ) {
    return data.mcqOptions && data.mcqOptions.length >= 2 && data.correctAnswer && data.mcqOptions.includes(data.correctAnswer);
  }
  return true;
}, {
  message: "For MCQ, please provide at least 2 options and ensure the correct answer is one of them.",
  path: ["mcqOptions"],
});

type QuestionFormData = z.infer<typeof questionFormSchema>;

const commentFormSchema = z.object({
    commentText: z.string().min(1, "Comment cannot be empty.").max(500, "Comment too long"),
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

  const [isEditQuestionsDialogOpen, setIsEditQuestionsDialogOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [currentEditingQuestions, setCurrentEditingQuestions] = useState<MockInterviewSession['questions']>([]);
  const [newQuestionIdsInput, setNewQuestionIdsInput] = useState('');


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


  const upcomingSessions = useMemo(() => {
    return practiceSessions
      .filter(s => s.userId === currentUser.id && s.status === 'SCHEDULED' && isFuture(parseISO(s.date)))
      .sort((a, b) => compareAsc(parseISO(a.date), parseISO(b.date)));
  }, [practiceSessions, currentUser.id]);
  
  const allUserSessions = useMemo(() => {
    return [...practiceSessions]
      .filter(s => s.userId === currentUser.id)
      .sort((a, b) => compareAsc(parseISO(b.date), parseISO(a.date)));
  }, [practiceSessions, currentUser.id]);
  
  const cancelledSessions = useMemo(() => {
    return practiceSessions
      .filter(s => s.userId === currentUser.id && s.status === 'CANCELLED')
      .sort((a, b) => compareAsc(parseISO(b.date), parseISO(a.date)));
  }, [practiceSessions, currentUser.id]);

  useEffect(() => {
    console.log("[InterviewPrep] isSetupDialogOpen changed to:", isSetupDialogOpen);
    if (!isSetupDialogOpen) {
      // Reset state when dialog closes
      setDialogStep('selectType');
      setPracticeSessionConfig({
        type: null, topics: [], dateTime: null, friendEmail: '',
        aiTopicOrRole: '', aiJobDescription: '', aiNumQuestions: 5, aiDifficulty: 'medium', aiTimerPerQuestion: 0, aiQuestionCategories: []
      });
      setFriendEmailError(null);
    }
  }, [isSetupDialogOpen]);


  const handleStartPracticeSetup = useCallback(() => {
    console.log("[InterviewPrep] handleStartPracticeSetup called");
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
    console.log("[InterviewPrep] isSetupDialogOpen attempted to be set to true...");
  }, []);
  
  const handleDialogNextStep = () => {
    console.log("[InterviewPrep] handleDialogNextStep called. Current step:", dialogStep, "Config:", practiceSessionConfig);
    if (dialogStep === 'selectType') {
      if (!practiceSessionConfig.type) {
        toast({ title: "Error", description: "Please select an interview type.", variant: "destructive" });
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
        toast({ title: "Invitation Sent (Mock)", description: `Invitation would be sent to ${practiceSessionConfig.friendEmail}. This is a mock feature.` });
        setIsSetupDialogOpen(false); // Close dialog after sending friend invite
        return; // End flow for 'friends' type here
      }
      // For 'ai' or 'experts', proceed to topic selection
      setDialogStep('selectTopics');
    } else if (dialogStep === 'selectTopics') {
      if (practiceSessionConfig.topics.length === 0) {
        toast({ title: "Error", description: "Please select at least one topic.", variant: "destructive" });
        return;
      }
      if (practiceSessionConfig.type === 'ai') {
         // Pre-fill aiTopicOrRole from selected topics for AI flow
        setPracticeSessionConfig(prev => ({...prev, aiTopicOrRole: prev.topics.join(', ')}));
        setDialogStep('aiSetupBasic');
      } else { // 'experts'
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
    console.log("[InterviewPrep] Next dialogStep will be:", dialogStep === 'selectType' ? 'selectTopics' : dialogStep === 'selectTopics' ? (practiceSessionConfig.type === 'ai' ? 'aiSetupBasic' : 'selectTimeSlot') : 'unknown_next_step');
  };


  const handleDialogPreviousStep = () => {
    console.log("[InterviewPrep] handleDialogPreviousStep called. Current step:", dialogStep);
    if (dialogStep === 'selectTimeSlot') setDialogStep('selectTopics');
    else if (dialogStep === 'selectTopics') setDialogStep('selectType');
    else if (dialogStep === 'aiSetupCategories') setDialogStep('aiSetupAdvanced');
    else if (dialogStep === 'aiSetupAdvanced') setDialogStep('aiSetupBasic');
    else if (dialogStep === 'aiSetupBasic') {
        // If returning from AI basic setup, and topics were selected for AI, go back to topics.
        // Otherwise, (e.g., if user directly chose AI type and then went back from basic setup without selecting topics first, which shouldn't happen with current flow) go to type selection.
        if (practiceSessionConfig.type === 'ai' && practiceSessionConfig.topics.length > 0) {
            setDialogStep('selectTopics');
        } else {
            setDialogStep('selectType');
        }
    }
     console.log("[InterviewPrep] Previous dialogStep will be:", dialogStep);
  };

  const handleFinalBookSession = () => {
    console.log("[InterviewPrep] handleFinalBookSession called. Config:", practiceSessionConfig);
    if (!practiceSessionConfig.type) {
        toast({ title: "Booking Error", description: "Interview type not selected.", variant: "destructive"});
        return;
    }

    let newSessionId = '';
    let newSessionTitle = '';

    if (practiceSessionConfig.type === 'experts') {
        if (practiceSessionConfig.topics.length === 0 || !practiceSessionConfig.dateTime) {
            toast({ title: "Booking Error", description: "Missing expert session details (topics or date/time).", variant: "destructive"});
            return;
        }
        newSessionId = `ps-expert-${Date.now()}`;
        newSessionTitle = `Expert Mock Interview: ${practiceSessionConfig.topics.join(', ')}`;
        
        const newPracticeSession: PracticeSession = {
            id: newSessionId,
            userId: currentUser.id,
            date: practiceSessionConfig.dateTime.toISOString(),
            category: "Practice with Experts",
            type: practiceSessionConfig.topics.join(', ') || "General",
            language: "English", 
            status: "SCHEDULED",
            notes: `Scheduled expert session for topics: ${practiceSessionConfig.topics.join(', ')}.`,
        };
        setPracticeSessions(prev => [newPracticeSession, ...prev]);
        samplePracticeSessions.unshift(newPracticeSession); // Update global sample data

        // Also create a corresponding LiveInterviewSession
        const newLiveSession: LiveInterviewSession = {
            id: newSessionId, // Use the same ID
            tenantId: currentUser.tenantId,
            title: newSessionTitle,
            participants: [
                { userId: currentUser.id, name: currentUser.name, role: 'candidate', profilePictureUrl: currentUser.profilePictureUrl },
                // Add a placeholder expert interviewer
                { userId: `expert-${Date.now().toString().slice(-5)}`, name: 'Expert Interviewer', role: 'interviewer', profilePictureUrl: `https://avatar.vercel.sh/expert${Date.now().toString().slice(-3)}.png` } 
            ],
            scheduledTime: newPracticeSession.date,
            status: 'Scheduled', // from LiveInterviewSessionStatuses[0]
            // Pre-select some questions based on topics
            preSelectedQuestions: sampleInterviewQuestions
                .filter(q => practiceSessionConfig.topics.some(topic => 
                    q.category.toLowerCase() === topic.toLowerCase() || 
                    (q.tags && q.tags.some(tag => tag.toLowerCase() === topic.toLowerCase()))
                ))
                .slice(0,5) // Take first 5 matches
                .map(q => ({id: q.id, questionText: q.questionText, category: q.category, difficulty: q.difficulty, baseScore: q.baseScore || 10 })),
        };
        sampleLiveInterviewSessions.unshift(newLiveSession); // Update global sample data

        toast({ title: "Expert Session Booked (Mock)", description: `Session for ${newPracticeSession.type} on ${format(parseISO(newPracticeSession.date), 'PPp')} scheduled.` });

    } else if (practiceSessionConfig.type === 'ai') {
        if (!practiceSessionConfig.aiTopicOrRole?.trim()) {
            toast({ title: "Booking Error", description: "Missing AI interview topic/role.", variant: "destructive"});
            return;
        }
        // Create a PracticeSession entry for AI mock interviews
        newSessionId = `ps-ai-${Date.now()}`;
        const newPracticeSession: PracticeSession = {
          id: newSessionId,
          userId: currentUser.id,
          date: new Date().toISOString(), // AI sessions can start immediately
          category: "Practice with AI",
          type: practiceSessionConfig.aiTopicOrRole,
          language: "English",
          status: "SCHEDULED", // Or a new status like 'READY_TO_START'
          notes: `AI Mock interview configured for: ${practiceSessionConfig.aiTopicOrRole}`,
          // Store AI config in the practice session
          aiTopicOrRole: practiceSessionConfig.aiTopicOrRole,
          aiJobDescription: practiceSessionConfig.aiJobDescription,
          aiNumQuestions: practiceSessionConfig.aiNumQuestions,
          aiDifficulty: practiceSessionConfig.aiDifficulty,
          aiTimerPerQuestion: practiceSessionConfig.aiTimerPerQuestion,
          aiQuestionCategories: practiceSessionConfig.aiQuestionCategories,
        };
        setPracticeSessions(prev => [newPracticeSession, ...prev]);
        samplePracticeSessions.unshift(newPracticeSession); // Update global sample data

        const queryParams = new URLSearchParams();
        if(newPracticeSession.aiTopicOrRole) queryParams.append('topic', newPracticeSession.aiTopicOrRole);
        if(newPracticeSession.aiJobDescription) queryParams.append('jobDescription', newPracticeSession.aiJobDescription);
        if(newPracticeSession.aiNumQuestions) queryParams.append('numQuestions', String(newPracticeSession.aiNumQuestions));
        if(newPracticeSession.aiDifficulty) queryParams.append('difficulty', newPracticeSession.aiDifficulty);
        if(newPracticeSession.aiTimerPerQuestion) queryParams.append('timerPerQuestion', String(newPracticeSession.aiTimerPerQuestion));
        if(newPracticeSession.aiQuestionCategories && newPracticeSession.aiQuestionCategories.length > 0) queryParams.append('categories', newPracticeSession.aiQuestionCategories.join(','));
        queryParams.append('autoFullScreen', 'true');
        queryParams.append('sourceSessionId', newPracticeSession.id);


        toast({ title: "AI Interview Setup Complete!", description: `Redirecting to start your AI mock interview for "${newPracticeSession.aiTopicOrRole}".`, duration: 4000 });
        router.push(`/ai-mock-interview?${queryParams.toString()}`);
    }

    // Reset dialog state after booking any type of session
    setIsSetupDialogOpen(false);
    setPracticeSessionConfig({ type: null, topics: [], dateTime: null, friendEmail: '', aiTopicOrRole: '', aiJobDescription: '', aiNumQuestions: 5, aiDifficulty: 'medium', aiTimerPerQuestion: 0, aiQuestionCategories: [] });
    setDialogStep('selectType');
    console.log("[InterviewPrep] Dialog closed and state reset after booking.");
  };


  const handleCancelPracticeSession = (sessionId: string) => {
    const updater = (session: PracticeSession) => session.id === sessionId ? { ...session, status: 'CANCELLED' as PracticeSession['status'] } : session;
    setPracticeSessions(prev => prev.map(updater));
    // Update global sample data
    const globalIndex = samplePracticeSessions.findIndex(s => s.id === sessionId);
    if (globalIndex !== -1) {
        (samplePracticeSessions[globalIndex] as any).status = 'CANCELLED'; // Using 'as any' if status type is strict
    }
    // Also update the corresponding LiveInterviewSession if it exists
    const liveSessionIndex = sampleLiveInterviewSessions.findIndex(s => s.id === sessionId);
    if (liveSessionIndex !== -1) {
        sampleLiveInterviewSessions[liveSessionIndex].status = 'Cancelled';
    }
    toast({ title: "Session Cancelled", description: "The practice session has been cancelled.", variant: "destructive" });
  };

  const handleRescheduleSession = (sessionId: string) => {
     // This would typically open another dialog for rescheduling
     toast({ title: "Reschedule Mocked", description: "Rescheduling functionality for this session is not yet implemented." });
     // For now, just log it
     console.log("Reschedule requested for session:", sessionId);
  };

  const filteredBankQuestions = useMemo(() => {
    let questionsToFilter = [...allBankQuestions];

    // Filter by view (bookmarks, needs approval)
    if (bankFilterView === 'myBookmarks') {
      questionsToFilter = questionsToFilter.filter(q => q.bookmarkedBy?.includes(currentUser.id));
    } else if (bankFilterView === 'needsApproval' && currentUser.role === 'admin') {
      questionsToFilter = questionsToFilter.filter(q => q.approved === false);
    } else {
      // Default view: show approved questions or questions created by the user (even if pending)
      // Admins see all regardless of approval if not specifically filtering for 'needsApproval'
      questionsToFilter = questionsToFilter.filter(q => q.approved !== false || q.createdBy === currentUser.id || currentUser.role === 'admin');
    }
    
    // Filter by selected categories
    if (selectedBankCategories.length > 0) {
      questionsToFilter = questionsToFilter.filter(q => selectedBankCategories.includes(q.category));
    }

    // Filter by search term
    if (bankSearchTerm.trim() !== '') {
      const searchTermLower = bankSearchTerm.toLowerCase();
      questionsToFilter = questionsToFilter.filter(q =>
        q.questionText.toLowerCase().includes(searchTermLower) ||
        (q.tags && q.tags.some(tag => tag.toLowerCase().includes(searchTermLower)))
      );
    }

    // Apply sorting
    if (bankSortOrder === 'highestRated') {
      questionsToFilter.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (bankSortOrder === 'mostRecent') {
      questionsToFilter.sort((a, b) => {
        // Handle potential undefined or non-standard createdAt
        const dateA = a.createdAt ? parseISO(a.createdAt).getTime() : (parseInt(String(a.id).replace(/\D/g,'')) || 0);
        const dateB = b.createdAt ? parseISO(b.createdAt).getTime() : (parseInt(String(b.id).replace(/\D/g,'')) || 0);
        return dateB - dateA;
      });
    }
    // 'default' sort is by original order (or whatever the DB returns if this were a real backend)
    return questionsToFilter;
  }, [allBankQuestions, selectedBankCategories, bankSearchTerm, currentUser.role, currentUser.id, bankSortOrder, bankFilterView]);

  const paginatedBankQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * questionsPerPage;
    return filteredBankQuestions.slice(startIndex, startIndex + questionsPerPage);
  }, [filteredBankQuestions, currentPage, questionsPerPage]);

  const totalPages = Math.ceil(filteredBankQuestions.length / questionsPerPage);

  const onQuestionFormSubmit = (data: QuestionFormData) => {
    console.log("New/Edit Question Data:", data);
    const questionPayload = {
        ...data,
        tags: data.tags?.split(',').map(t => t.trim()).filter(t => t) || [],
        mcqOptions: data.isMCQ ? data.mcqOptions?.filter(opt => opt && opt.trim() !== "") : undefined, // Ensure options are cleaned
        correctAnswer: data.isMCQ ? data.correctAnswer : undefined,
        approved: currentUser.role === 'admin', // Auto-approve if admin creates
        createdBy: currentUser.id,
        createdAt: new Date().toISOString(),
        bookmarkedBy: [],
        userComments: [],
        rating: 0, // Initial rating
        ratingsCount: 0,
    };

    if (editingQuestion) {
      // Update existing question
      setAllBankQuestions(prev => prev.map(q => q.id === editingQuestion.id ? { ...editingQuestion, ...questionPayload, difficulty: data.difficulty || 'Medium' } : q));
      // Update global sample data
      const globalQIndex = sampleInterviewQuestions.findIndex(q => q.id === editingQuestion.id);
      if (globalQIndex !== -1) Object.assign(sampleInterviewQuestions[globalQIndex], { ...editingQuestion, ...questionPayload, difficulty: data.difficulty || 'Medium' });
      toast({ title: "Question Updated", description: "The interview question has been updated." });
    } else {
      // Add new question
      const newQuestion: InterviewQuestion = {
        ...questionPayload,
        id: `iq-${Date.now()}`, // Simple ID generation for sample data
        difficulty: data.difficulty || 'Medium',
      };
      setAllBankQuestions(prev => [newQuestion, ...prev]);
      sampleInterviewQuestions.unshift(newQuestion); // Add to global sample data
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
    // Check permissions
    if (currentUser.role !== 'admin' && question.createdBy !== currentUser.id) {
        toast({title: "Permission Denied", description: "You can only edit questions you created.", variant: "destructive"});
        return;
    }
    setEditingQuestion(question);
    setQuestionFormValue('questionText', question.questionText);
    setQuestionFormValue('category', question.category);
    setQuestionFormValue('isMCQ', question.isMCQ || false);
    // Ensure mcqOptions has at least 4 elements for the form, padding with empty strings
    const options = question.mcqOptions || [];
    const paddedOptions = [...options, ...Array(Math.max(0, 4 - options.length)).fill("")];
    setQuestionFormValue('mcqOptions', paddedOptions.slice(0,4)); // Take first 4
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
    // Remove from global sample data for demo persistence
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
    // Filter for valid MCQ questions before creating quiz link
    const validMcqQuestionIds = Array.from(selectedQuestionsForQuiz).filter(id => {
        const q = allBankQuestions.find(bq => bq.id === id);
        return q && q.isMCQ && q.mcqOptions && q.mcqOptions.length >= 2 && q.correctAnswer;
    });

    if (validMcqQuestionIds.length === 0) {
        toast({ title: "No Valid MCQ Questions", description: "Please select valid Multiple Choice Questions with options and a correct answer to create a quiz.", variant: "destructive", duration: 5000 });
        return;
    }
    if (validMcqQuestionIds.length !== selectedQuestionsForQuiz.size) {
      toast({ title: "Some Questions Invalid", description: `Only ${validMcqQuestionIds.length} valid MCQ questions were used for the quiz. Others were excluded.`, variant: "default", duration: 5000 });
    }

    const questionIdsQueryParam = validMcqQuestionIds.join(',');
    router.push(`/interview-prep/quiz/edit/new?questions=${questionIdsQueryParam}`);
  };

  const getCategoryIcon = (category: InterviewQuestionCategory) => {
    switch(category) {
      case 'Behavioral': return <UsersGroupIcon className="h-4 w-4 text-purple-500 flex-shrink-0"/>;
      case 'Technical': return <Settings2 className="h-4 w-4 text-orange-500 flex-shrink-0"/>;
      case 'Coding': return <CodeIcon className="h-4 w-4 text-sky-500 flex-shrink-0"/>;
      case 'Role-Specific': return <Brain className="h-4 w-4 text-indigo-500 flex-shrink-0"/>;
      case 'Analytical': return <Puzzle className="h-4 w-4 text-teal-500 flex-shrink-0"/>;
      case 'HR': return <Lightbulb className="h-4 w-4 text-pink-500 flex-shrink-0"/>;
      case 'Common': return <MessageSquare className="h-4 w-4 text-gray-500 flex-shrink-0"/>;
      default: return <Puzzle className="h-4 w-4 text-gray-400 flex-shrink-0"/>; // Default icon
    }
  };

  const onCommentSubmit = (data: CommentFormData, questionId: string) => {
    console.log("Submitting comment:", data, "for question:", questionId);
    const newComment: InterviewQuestionUserComment = {
        id: `uc-${questionId}-${Date.now()}`, // Unique comment ID
        userId: currentUser.id,
        userName: currentUser.name,
        comment: data.commentText,
        timestamp: new Date().toISOString(),
    };
    setAllBankQuestions(prevQs => prevQs.map(q =>
        q.id === questionId ? { ...q, userComments: [...(q.userComments || []), newComment] } : q
    ));
    // Update global sample data for demo persistence
    const globalQIndex = sampleInterviewQuestions.findIndex(q => q.id === questionId);
    if (globalQIndex !== -1) {
      const currentComments = sampleInterviewQuestions[globalQIndex].userComments || [];
      sampleInterviewQuestions[globalQIndex].userComments = [...currentComments, newComment];
    }
    resetCommentForm();
    setCommentingQuestionId(null); // Close comment input after submit
    toast({ title: "Comment Added", description: "Your comment has been posted." });
  };

  const handleRateQuestion = (questionId: string, rating: number) => {
    console.log("Rating question:", questionId, "with rating:", rating);
    setAllBankQuestions(prevQs => prevQs.map(q => {
        if (q.id === questionId) {
            const existingRatingIndex = q.userRatings?.findIndex(r => r.userId === currentUser.id);
            let newUserRatings = [...(q.userRatings || [])];
            if (existingRatingIndex !== undefined && existingRatingIndex !== -1) {
                // User is changing their rating
                newUserRatings[existingRatingIndex] = { userId: currentUser.id, rating };
            } else {
                // User is rating for the first time
                newUserRatings.push({ userId: currentUser.id, rating });
            }
            const totalRatingSum = newUserRatings.reduce((sum, r) => sum + r.rating, 0);
            const newAvgRating = newUserRatings.length > 0 ? parseFloat((totalRatingSum / newUserRatings.length).toFixed(1)) : 0;
            return { ...q, userRatings: newUserRatings, rating: newAvgRating, ratingsCount: newUserRatings.length };
        }
        return q;
    }));

    // Update global sample data for demo persistence
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

    setRatingQuestionId(null); // Close rating input
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

  // Function to open the edit questions dialog
  const openEditQuestionsDialog = (sessionId: string) => {
    const sessionToEdit = sampleLiveInterviewSessions.find(s => s.id === sessionId);
    if (sessionToEdit) {
      setEditingSessionId(sessionId);
      setCurrentEditingQuestions(sessionToEdit.preSelectedQuestions || []);
      setNewQuestionIdsInput(''); // Clear previous input
      setIsEditQuestionsDialogOpen(true);
    } else {
      toast({ title: "Error", description: "Could not find the live interview session to edit questions.", variant: "destructive" });
    }
  };

  // Function to remove a question from the dialog's editing list
  const handleRemoveQuestionFromDialog = (questionIdToRemove: string) => {
    setCurrentEditingQuestions(prev => prev.filter(q => q.id !== questionIdToRemove));
  };

  // Function to save changes from the edit questions dialog
  const handleSaveQuestionChanges = () => {
    if (!editingSessionId) return;

    // Get new questions from bank based on IDs
    const newIdsArray = newQuestionIdsInput.split(',').map(id => id.trim()).filter(id => id);
    const newQuestionsFromBank = newIdsArray
        .map(id => allBankQuestions.find(bq => bq.id === id))
        .filter(q => q !== undefined) // Filter out undefined if ID not found
        .map(q => ({ id: q!.id, questionText: q!.questionText, category: q!.category, difficulty: q!.difficulty, baseScore: q!.baseScore || 10 })); // Map to MockInterviewQuestion structure

    // Combine current questions (after removals) with new ones, ensuring no duplicates
    const combinedQuestions = [...currentEditingQuestions];
    newQuestionsFromBank.forEach(newQ => {
        if (!combinedQuestions.some(cq => cq.id === newQ.id)) {
            combinedQuestions.push(newQ);
        }
    });
    
    // Update the global sampleLiveInterviewSessions
    const liveSessionIndex = sampleLiveInterviewSessions.findIndex(s => s.id === editingSessionId);
    if (liveSessionIndex !== -1) {
        sampleLiveInterviewSessions[liveSessionIndex].preSelectedQuestions = combinedQuestions;
        toast({ title: "Questions Updated", description: "Pre-selected questions for the session have been updated." });
    } else {
        toast({ title: "Error", description: "Failed to find the session to update.", variant: "destructive" });
    }
    setIsEditQuestionsDialogOpen(false);
    setEditingSessionId(null);
    setCurrentEditingQuestions([]);
    setNewQuestionIdsInput('');
  };


  const renderSessionCard = (session: PracticeSession) => {
    const sessionDate = parseISO(session.date);
    const now = new Date();
    let canJoin = false;
    let joinPath = '';

    // Determine if user can join
    if (session.status === 'SCHEDULED') {
        if (session.category === "Practice with AI") {
             canJoin = true; // AI sessions can be started anytime if scheduled
             const queryParams = new URLSearchParams();
             if(session.aiTopicOrRole) queryParams.append('topic', session.aiTopicOrRole);
             if(session.aiJobDescription) queryParams.append('jobDescription', session.aiJobDescription);
             if(session.aiNumQuestions) queryParams.append('numQuestions', String(session.aiNumQuestions));
             if(session.aiDifficulty) queryParams.append('difficulty', session.aiDifficulty);
             if(session.aiTimerPerQuestion) queryParams.append('timerPerQuestion', String(session.aiTimerPerQuestion));
             if(session.aiQuestionCategories && session.aiQuestionCategories.length > 0) queryParams.append('categories', session.aiQuestionCategories.join(','));
             queryParams.append('autoFullScreen', 'true'); // Assuming you want AI interviews fullscreen by default
             queryParams.append('sourceSessionId', session.id); // Link back to this practice session
             joinPath = `/ai-mock-interview?${queryParams.toString()}`;
        } else { // Experts or Friends
            const isFutureSession = isFuture(sessionDate);
            // Allow joining if session is in future or started within the last 60 minutes
            const isRecentPast = isPast(sessionDate) && differenceInMinutes(now, sessionDate) <= 60;
            canJoin = isFutureSession || isRecentPast;
            joinPath = `/live-interview/${session.id}`;
        }
    }
    
    // Check if current user is the interviewer for this live session (non-AI)
    const liveSession = sampleLiveInterviewSessions.find(ls => ls.id === session.id);
    const isCurrentUserInterviewerForThisLiveSession = liveSession?.participants.find(p => p.userId === currentUser.id && p.role === 'interviewer');
    
    console.log(`[RenderSessionCard] Session ID: ${session.id}, User: ${currentUser.id}, Is Interviewer: ${isCurrentUserInterviewerForThisLiveSession}`);

    return (
    <Card key={session.id} className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            <SessionDateTime date={session.date} />
          </CardTitle>
          <span className={cn(
            "px-2 py-1 text-xs font-semibold rounded-full",
            session.status === 'SCHEDULED' ? "bg-green-100 text-green-700" :
            session.status === 'COMPLETED' ? "bg-blue-100 text-blue-700" :
            "bg-red-100 text-red-700" // For CANCELLED
          )}>
            {session.status}
          </span>
        </div>
        <CardDescription className="text-sm">{session.category}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1 text-xs text-muted-foreground">
        <p className="flex items-center gap-1"><Tag className="h-3.5 w-3.5"/>Focus: {session.type}</p>
        {/* Display AI config if it's an AI session */}
        {session.category === "Practice with AI" && (
          <>
            {session.aiNumQuestions && <p className="text-xs">Questions: {session.aiNumQuestions}</p>}
            {session.aiDifficulty && <p className="text-xs">Difficulty: {session.aiDifficulty.charAt(0).toUpperCase() + session.aiDifficulty.slice(1)}</p>}
            {session.aiTimerPerQuestion && session.aiTimerPerQuestion > 0 && <p className="text-xs">Timer: {session.aiTimerPerQuestion}s/question</p>}
          </>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        {canJoin && (
          <Button variant="default" size="sm" asChild className={cn(session.category === "Practice with AI" ? "bg-purple-600 hover:bg-purple-700" : "bg-green-600 hover:bg-green-700", "text-white")}>
            <Link href={joinPath}>
              {session.category === "Practice with AI" ? <Brain className="mr-1 h-4 w-4"/> : <Video className="mr-1 h-4 w-4"/>}
              {session.category === "Practice with AI" ? "Start AI Interview" : "Join Interview"}
            </Link>
          </Button>
        )}
        {/* Edit Questions button for "Practice with Experts" if current user is interviewer or admin */}
        {session.status === 'SCHEDULED' && session.category === "Practice with Experts" && liveSession && (isCurrentUserInterviewerForThisLiveSession || currentUser.role === 'admin') && (
          <Button variant="outline" size="sm" onClick={() => openEditQuestionsDialog(session.id)}>
            <Edit3 className="mr-1 h-4 w-4"/>Edit Questions
          </Button>
        )}
        {session.status === 'SCHEDULED' && !canJoin && !isFuture(sessionDate) && (
            // Session time passed and cannot join
            <Badge variant="outline">Session time passed</Badge>
        )}
        {session.status === 'SCHEDULED' && (
          <>
            <Button variant="destructive" size="sm" onClick={() => handleCancelPracticeSession(session.id)}>
              <XCircleIcon className="mr-1 h-4 w-4"/>Cancel
            </Button>
            {session.category !== "Practice with AI" && ( // Reschedule not typically for AI sessions that can start anytime
                 <Button variant="outline" size="sm" onClick={() => handleRescheduleSession(session.id)}>
                    <Calendar className="mr-1 h-4 w-4"/>Reschedule
                </Button>
            )}
          </>
        )}
        {session.status === 'COMPLETED' && (
           <Button variant="outline" size="sm" onClick={() => toast({title: "View Report (Mock)", description: "This would show the detailed report for the completed session."})}><Eye className="mr-1 h-4 w-4"/>View Report</Button>
        )}
        {session.status === 'CANCELLED' && (
           <p className="text-xs text-red-500">This session was cancelled.</p>
        )}
      </CardFooter>
    </Card>
  );
}

  // Client-side component to handle date formatting to avoid hydration mismatch
  const SessionDateTime = ({ date: isoDateString }: { date: string }) => {
    const [formattedDateTime, setFormattedDateTime] = useState<string | null>(null);
    
    useEffect(() => {
      try {
        const sessionDate = parseISO(isoDateString);
        setFormattedDateTime(format(sessionDate, "MMM dd, yyyy - p"));
      } catch (e) {
        console.error("Error formatting date:", isoDateString, e);
        setFormattedDateTime("Invalid Date");
      }
    }, [isoDateString]);
  
    if (!formattedDateTime) {
      // SSR/initial render fallback
      try {
        return <span>{format(parseISO(isoDateString), "MMM dd, yyyy")} - Loading time...</span>;
      } catch {
        return <span>Invalid Date</span>
      }
    }
    return <span>{formattedDateTime}</span>;
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
            {/* <Button variant="link" className="p-0 h-auto text-primary text-sm">GET MORE FOR FREE</Button> */}
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
            <Card className="text-center py-10"><CardContent><XCircleIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3"/><p className="text-muted-foreground">No cancelled interviews found.</p></CardContent></Card>
          )}
        </TabsContent>
      </Tabs>


      <Card className="shadow-lg" id="question-bank">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
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
                                  <span>ID: {q.id}</span>
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
                                     <XCircleIcon className="h-4 w-4"/>
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
            <DialogTitle className="text-xl">{editingQuestion ? "Edit Question" : "Add New Question"}</DialogTitle>
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
                    <Label>MCQ Options (at least 2 required, max 4 shown)</Label>
                    {(watchQuestionForm("mcqOptions") || ["","","",""]).slice(0,4).map((_,index) => ( 
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
                     {questionFormErrors.mcqOptions && <p className="text-sm text-destructive mt-1">{questionFormErrors.mcqOptions.message}</p>}
                     {questionFormErrors.correctAnswer && <p className="text-sm text-destructive mt-1">{questionFormErrors.correctAnswer.message}</p>}
                </div>
            )}
            <div>
              <Label htmlFor="answerOrTip">Suggested Answer / Explanation / Tip *</Label>
              <Controller name="answerOrTip" control={questionFormControl} render={({ field }) => <Textarea id="answerOrTip" {...field} rows={4} />} />
              {questionFormErrors.answerOrTip && <p className="text-sm text-destructive mt-1">{questionFormErrors.answerOrTip.message}</p>}
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90">{editingQuestion ? "Save Changes" : "Add Question"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isSetupDialogOpen} onOpenChange={(open) => {
        // This onOpenChange is from the "Start New Practice Session" Dialog
        console.log("[InterviewPrep] Setup Dialog onOpenChange, open:", open);
        setIsSetupDialogOpen(open);
        // Cleanup moved to useEffect listening to isSetupDialogOpen
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl text-center font-semibold">
              {dialogStep === 'selectType' && "Select Interview Type"}
              {dialogStep === 'selectTopics' && `Select Practice Topics for ${practiceSessionConfig.type === 'ai' ? 'AI Interview' : 'Expert Session'}`}
              {dialogStep === 'selectTimeSlot' && "Choose Date & Time"}
              {dialogStep === 'aiSetupBasic' && "AI Interview: Basic Setup"}
              {dialogStep === 'aiSetupAdvanced' && "AI Interview: Advanced Options"}
              {dialogStep === 'aiSetupCategories' && "AI Interview: Question Categories"}
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              {dialogStep === 'selectType' && "How would you like to practice?"}
              {dialogStep === 'selectTopics' && `For your ${practiceSessionConfig.type} interview.`}
              {dialogStep === 'selectTimeSlot' && `For your ${practiceSessionConfig.type} interview on ${practiceSessionConfig.topics.join(', ')}.`}
              {dialogStep === 'aiSetupBasic' && "Tell us about the role or topic for your AI mock interview."}
              {dialogStep === 'aiSetupAdvanced' && "Configure the number of questions, difficulty, and timer."}
              {dialogStep === 'aiSetupCategories' && "Optionally, select specific question categories for your AI interview."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 min-h-[200px]">
            {dialogStep === 'selectType' && (
              <>
                <RadioGroup
                  onValueChange={(value) => {
                    setPracticeSessionConfig(prev => ({ ...prev, type: value as PracticeSessionType, topics: [] }));
                    if (friendEmailError && value !== 'friends') setFriendEmailError(null);
                  }}
                  value={practiceSessionConfig.type || ""}
                  className="grid grid-cols-1 gap-2"
                >
                  {(['friends', 'experts', 'ai'] as PracticeSessionType[]).map(type => (
                    <Label 
                      key={type} 
                      htmlFor={`type-${type}`}
                      className={cn(
                        "h-20 text-sm flex flex-col items-center justify-center rounded-md border-2 p-4 hover:border-primary cursor-pointer",
                        practiceSessionConfig.type === type ? "border-primary bg-primary/10 text-primary" : "border-border"
                      )}
                    >
                       <RadioGroupItem value={type} id={`type-${type}`} className="sr-only" />
                      {type === 'friends' && <UsersGroupIcon className="mb-1 h-5 w-5"/>}
                      {type === 'experts' && <Brain className="mb-1 h-5 w-5"/>}
                      {type === 'ai' && <Mic className="mb-1 h-5 w-5"/>}
                      Practice with {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Label>
                  ))}
                </RadioGroup>
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
                        <Label htmlFor="aiTimerPerQuestion" className="flex items-center gap-1">
                            <Timer className="h-4 w-4" /> Time per Question (seconds)
                        </Label>
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
                    availableTopics={ALL_CATEGORIES as any} // Cast because ALL_CATEGORIES is readonly
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

          <DialogFooter className="mt-2 flex flex-row justify-between w-full">
            <div>
            {dialogStep !== 'selectType' && (
              <Button variant="outline" onClick={handleDialogPreviousStep}><ChevronLeft className="mr-1 h-4 w-4"/>Back</Button>
            )}
            </div>
            <div className="flex gap-2">
                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                {dialogStep === 'selectType' && (
                <Button onClick={handleDialogNextStep} disabled={!practiceSessionConfig.type || (practiceSessionConfig.type === 'friends' && (!practiceSessionConfig.friendEmail || !!friendEmailError))}>
                    {practiceSessionConfig.type === 'friends' ? "Send Invitation" : "Next"} <ChevronRight className="ml-1 h-4 w-4"/>
                </Button>
                )}
                {dialogStep === 'selectTopics' && (practiceSessionConfig.type === 'experts' || practiceSessionConfig.type === 'ai') && (
                    <Button onClick={handleDialogNextStep} disabled={practiceSessionConfig.topics.length === 0}>Next <ChevronRight className="ml-1 h-4 w-4"/></Button>
                )}
                {dialogStep === 'aiSetupBasic' && practiceSessionConfig.type === 'ai' && (
                    <Button onClick={handleDialogNextStep} disabled={!practiceSessionConfig.aiTopicOrRole?.trim()}>Next <ChevronRight className="ml-1 h-4 w-4"/></Button>
                )}
                {dialogStep === 'aiSetupAdvanced' && practiceSessionConfig.type === 'ai' && (
                    <Button onClick={handleDialogNextStep}>Next <ChevronRight className="ml-1 h-4 w-4"/></Button>
                )}

                {dialogStep === 'selectTimeSlot' && practiceSessionConfig.type === 'experts' && (
                <Button onClick={handleFinalBookSession} disabled={!practiceSessionConfig.dateTime} className="bg-green-600 hover:bg-green-700 text-white">Book Expert Session</Button>
                )}
                {dialogStep === 'aiSetupCategories' && practiceSessionConfig.type === 'ai' && (
                    <Button onClick={handleFinalBookSession} className="bg-green-600 hover:bg-green-700 text-white">Start AI Interview</Button>
                )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for Editing Questions for a Live Session */}
      <Dialog open={isEditQuestionsDialogOpen} onOpenChange={setIsEditQuestionsDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Pre-selected Questions</DialogTitle>
            <DialogDescription>
              Session: {sampleLiveInterviewSessions.find(s => s.id === editingSessionId)?.title || editingSessionId}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label>Current Questions ({currentEditingQuestions.length}):</Label>
              {currentEditingQuestions.length > 0 ? (
                <ScrollArea className="h-40 border rounded-md p-2 mt-1">
                  <ul className="space-y-1">
                    {currentEditingQuestions.map(q => (
                      <li key={q.id} className="flex justify-between items-center p-1.5 text-xs bg-secondary rounded">
                        <span className="truncate flex-1 mr-2" title={q.questionText}>{q.questionText}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveQuestionFromDialog(q.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive"/>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              ) : <p className="text-xs text-muted-foreground mt-1">No questions currently selected.</p>}
            </div>
            <div>
              <Label htmlFor="newQuestionIdsInput">Add New Question IDs (comma-separated from Question Bank):</Label>
              <Textarea
                id="newQuestionIdsInput"
                value={newQuestionIdsInput}
                onChange={(e) => setNewQuestionIdsInput(e.target.value)}
                placeholder="e.g., iq1, mcq5, coding3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSaveQuestionChanges}>Save Question Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
    
