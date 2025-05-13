"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Brain, Mic, MessageSquare, Users, Zap, Tag, Lightbulb, CheckSquare as CheckSquareIcon, Code, Puzzle, BookCopy, ListFilter, Info, Share2, RefreshCw, History, Check, X, Star as StarIcon, UserCircle, CalendarDays, ThumbsUp, ShieldCheck, Edit3 as EditIcon, ShieldAlert, PlusCircle } from "lucide-react";
import { sampleInterviewQuestions, sampleUserProfile, sampleMockInterviewSessions, sampleCommunityPosts } from "@/lib/sample-data";
import type { InterviewQuestion, InterviewQuestionCategory, MockInterviewSession, CommunityPost, InterviewQuestionDifficulty } from "@/types";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import ScoreCircle from '@/components/ui/score-circle';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox"; 
import { cn } from "@/lib/utils"; 
import { Badge } from "@/components/ui/badge";

const ALL_CATEGORIES: InterviewQuestionCategory[] = ['Common', 'Behavioral', 'Technical', 'Coding', 'Role-Specific', 'Analytical', 'HR'];

export default function InterviewPreparationPage() {
  const [selectedCategories, setSelectedCategories] = useState<InterviewQuestionCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMcqAnswers, setSelectedMcqAnswers] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const [viewingSession, setViewingSession] = useState<MockInterviewSession | null>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const currentUser = sampleUserProfile;
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set()); 
  
  const userInterviewHistory = useMemo(() => {
    return sampleMockInterviewSessions.filter(session => session.userId === currentUser.id);
  }, [currentUser.id]);


  const filteredQuestions = useMemo(() => {
    return sampleInterviewQuestions.filter(q => {
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
  }, [selectedCategories, searchTerm, currentUser.role]);
  
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

  const handleCreateQuiz = () => {
    const questionsForQuiz = sampleInterviewQuestions.filter(q => selectedQuestionIds.has(q.id));
    if (questionsForQuiz.length === 0) {
        toast({title: "No Questions Selected", description: "Please select questions to include in the quiz.", variant: "destructive"});
        return;
    }
    toast({title: "Create Quiz (Mock)", description: `Quiz creation with ${questionsForQuiz.length} questions initiated. This is a mock feature.`});
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


  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookCopy className="h-8 w-8" /> Interview Question Bank
          </h1>
          <CardDescription>Explore multiple-choice questions and expert tips. Select categories to filter.</CardDescription>
        </div>
         <Button variant="default" size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/ai-mock-interview">
               <Mic className="mr-2 h-5 w-5" /> Start AI Mock Interview
            </Link>
        </Button>
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
      
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2"><MessageSquare className="h-6 w-6 text-primary"/>Questions ({filteredQuestions.length} matching)</CardTitle>
            <CardDescription>Browse and practice with our curated list of interview questions. Select questions to create a custom quiz.</CardDescription>
          </div>
          <Button onClick={handleCreateQuiz} disabled={selectedQuestionIds.size === 0} className="bg-primary hover:bg-primary/90 shrink-0">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Quiz ({selectedQuestionIds.size})
          </Button>
        </CardHeader>
        <CardContent>
          {filteredQuestions.length === 0 ? (
            <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg">
                <Zap className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2"/>
                <p>No questions match your criteria.</p>
                <p className="text-xs">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full space-y-3">
              {filteredQuestions.map((q) => (
                <AccordionItem value={q.id} key={q.id} className="border rounded-lg bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <AccordionTrigger className="text-md text-left hover:no-underline data-[state=open]:bg-secondary/50 relative group py-3 px-4">
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
                              <Label htmlFor={`${q.id}-opt-${index}`} className="font-normal cursor-pointer flex-1">{option}</Label>
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
                    <div className="mt-3 text-xs text-muted-foreground space-y-1 border-t pt-3">
                        {q.rating !== undefined && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">User Rating:</span>
                            {[1,2,3,4,5].map(star => (
                                <StarIcon key={star} className={cn("h-3.5 w-3.5", q.rating! >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300")}/>
                            ))}
                            ({q.rating}/5)
                          </div>
                        )}
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
