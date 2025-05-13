
"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Brain, Mic, MessageSquare, Users, Zap, Tag, Lightbulb, CheckSquare as CheckSquareIcon, Code, Puzzle, BookCopy, ListFilter, Info, Share2, RefreshCw, History } from "lucide-react";
import { sampleInterviewQuestions, sampleUserProfile, sampleMockInterviewSessions, sampleCommunityPosts } from "@/lib/sample-data";
import type { InterviewQuestion, InterviewQuestionCategory, MockInterviewSession, CommunityPost } from "@/types";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import ScoreCircle from '@/components/ui/score-circle';
import { ScrollArea } from "@/components/ui/scroll-area";

const ALL_CATEGORIES: InterviewQuestionCategory[] = ['Common', 'Behavioral', 'Technical', 'Coding', 'Role-Specific', 'Analytical', 'HR'];

export default function InterviewPreparationPage() {
  const [selectedCategories, setSelectedCategories] = useState<InterviewQuestionCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMcqAnswers, setSelectedMcqAnswers] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const [viewingSession, setViewingSession] = useState<MockInterviewSession | null>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const currentUser = sampleUserProfile;
  
  const userInterviewHistory = useMemo(() => {
    // In a real app, fetch this for the current user
    return sampleMockInterviewSessions.filter(session => session.userId === currentUser.id);
  }, [currentUser.id]);


  const filteredQuestions = useMemo(() => {
    return sampleInterviewQuestions.filter(q => {
      if (!q.isMCQ || !q.mcqOptions || !q.correctAnswer) return false; 

      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(q.category);
      const matchesSearch = searchTerm === '' || 
                            q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (q.answerOrTip && q.answerOrTip.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (q.tags && q.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) ||
                            (q.mcqOptions && q.mcqOptions.some(opt => opt.toLowerCase().includes(searchTerm.toLowerCase())));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategories, searchTerm]);
  
  const handleMcqSelection = (questionId: string, selectedOption: string) => {
    setSelectedMcqAnswers(prev => ({...prev, [questionId]: selectedOption}));
  };

  const getCategoryIcon = (category: InterviewQuestionCategory) => {
    switch(category) {
      case 'Behavioral': return <Users className="h-4 w-4 text-purple-500 flex-shrink-0" title="Behavioral Question"/>;
      case 'Technical': return <Zap className="h-4 w-4 text-orange-500 flex-shrink-0" title="Technical Question"/>;
      case 'Coding': return <Code className="h-4 w-4 text-sky-500 flex-shrink-0" title="Coding Question"/>;
      case 'Role-Specific': return <Brain className="h-4 w-4 text-indigo-500 flex-shrink-0" title="Role-Specific Question"/>;
      case 'Analytical': return <Puzzle className="h-4 w-4 text-teal-500 flex-shrink-0" title="Analytical Question"/>;
      case 'HR': return <Lightbulb className="h-4 w-4 text-pink-500 flex-shrink-0" title="HR Question"/>;
      case 'Common': return <MessageSquare className="h-4 w-4 text-gray-500 flex-shrink-0" title="Common Question"/>;
      default: return null;
    }
  };

  const handleCreateQuiz = () => {
    if (filteredQuestions.length === 0) {
        toast({title: "No Questions Selected", description: "Please adjust filters to include questions for the quiz.", variant: "destructive"});
        return;
    }
    toast({title: "Create Quiz (Mock)", description: `Quiz creation with ${filteredQuestions.length} questions initiated. This is a mock feature.`});
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

      {/* Filters Section */}
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
                <Label className="font-medium mb-2 block text-sm">Fast filter for questions (Categories):</Label>
                <ToggleGroup
                    type="multiple"
                    variant="outline"
                    value={selectedCategories}
                    onValueChange={(value) => { setSelectedCategories(value as InterviewQuestionCategory[]); }}
                    className="flex flex-wrap gap-2 justify-start"
                >
                    {ALL_CATEGORIES.map(category => (
                        <ToggleGroupItem key={category} value={category} aria-label={`Toggle ${category}`} className="text-xs px-2 py-1 h-auto">
                           {category}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
            </div>
        </CardContent>
      </Card>
      
      {/* Question Bank Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MessageSquare className="h-6 w-6 text-primary"/>Questions</CardTitle>
          <CardDescription>Browse and practice with our curated list of interview questions.</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredQuestions.length === 0 ? (
            <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg">
                <Zap className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2"/>
                <p>No questions match your criteria.</p>
                <p className="text-xs">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {filteredQuestions.map((q) => (
                <AccordionItem value={q.id} key={q.id}>
                  <AccordionTrigger className="text-md text-left hover:text-primary data-[state=open]:text-primary">
                    <div className="flex items-center gap-2">
                       <CheckSquareIcon className="h-4 w-4 text-blue-500 flex-shrink-0" title="Multiple Choice Question"/>
                       {getCategoryIcon(q.category)}
                       <span>{q.question}</span>
                    </div>
                     <span className="ml-auto mr-2 text-xs px-2 py-0.5 bg-accent text-accent-foreground rounded-full whitespace-nowrap">{q.category}</span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pl-2 text-sm">
                    <div className="mb-3 p-3 border rounded-md bg-secondary/30">
                        <p className="font-medium text-foreground mb-2">Options:</p>
                        <RadioGroup 
                            onValueChange={(value) => handleMcqSelection(q.id, value)} 
                            value={selectedMcqAnswers[q.id]}
                            className="space-y-1.5"
                        >
                          {q.mcqOptions!.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <RadioGroupItem value={option} id={`${q.id}-opt-${index}`} />
                              <Label htmlFor={`${q.id}-opt-${index}`} className="font-normal cursor-pointer">{option}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                        {selectedMcqAnswers[q.id] && q.correctAnswer && (
                            <p className={`mt-2 text-xs font-semibold ${selectedMcqAnswers[q.id] === q.correctAnswer ? 'text-green-600' : 'text-red-600'}`}>
                                Your answer is {selectedMcqAnswers[q.id] === q.correctAnswer ? 'correct!' : `incorrect. Correct answer: ${q.correctAnswer}`}
                            </p>
                        )}
                      </div>
                    <div className="p-3 border rounded-md bg-primary/5">
                        <p className="font-medium text-primary mb-1">Explanation/Tip:</p>
                        <p className="text-muted-foreground whitespace-pre-line">{q.answerOrTip}</p>
                    </div>
                    {q.tags && q.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {q.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 text-xs bg-accent text-accent-foreground rounded-full flex items-center gap-1">
                            <Tag className="h-3 w-3"/>{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
        <CardFooter>
            <Button onClick={handleCreateQuiz} disabled={filteredQuestions.length === 0} className="bg-primary hover:bg-primary/90">
                <Puzzle className="mr-2 h-4 w-4" /> Create Quiz from Filtered Questions
            </Button>
        </CardFooter>
      </Card>

      {/* Interview History Section */}
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
                <Card key={session.id} className="p-4 bg-secondary/30">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{session.topic}</h4>
                      <p className="text-xs text-muted-foreground">
                        Taken on: {format(parseISO(session.createdAt), 'PPp')}
                        {session.overallScore !== undefined && ` • Score: ${session.overallScore}%`}
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

      {/* Report Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Interview Report: {viewingSession?.topic}</DialogTitle>
            <DialogDescription>
              Session on {viewingSession && format(parseISO(viewingSession.createdAt), 'PPp')}
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
                    {/* Detailed Answers can be added here if needed */}
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


       <Card className="shadow-md bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-700 flex items-center gap-2">
            <Lightbulb className="h-5 w-5"/>Pro Tip: Effective Practice
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-600 space-y-1">
          <p>Regularly test yourself with MCQs from different categories.</p>
          <p>Understand why the correct answer is right and why others are wrong.</p>
          <p>Use the explanations to deepen your knowledge.</p>
        </CardContent>
      </Card>
    </div>
  );
}
