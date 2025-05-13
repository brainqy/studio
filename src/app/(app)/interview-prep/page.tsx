
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Brain, Mic, MessageSquare, Users, Zap, Tag, Lightbulb, CheckSquare as CheckSquareIcon, Code, Puzzle, BookCopy } from "lucide-react";
import { sampleInterviewQuestions } from "@/lib/sample-data";
import type { InterviewQuestion, InterviewQuestionCategory } from "@/types";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";


const ALL_CATEGORIES: InterviewQuestionCategory[] = ['Common', 'Behavioral', 'Technical', 'Coding', 'Role-Specific', 'Analytical', 'HR'];

export default function InterviewPreparationPage() {
  const [selectedCategories, setSelectedCategories] = useState<Set<InterviewQuestionCategory>>(new Set(ALL_CATEGORIES));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMcqAnswers, setSelectedMcqAnswers] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const filteredQuestions = useMemo(() => {
    // Ensure all questions are MCQs as per requirement
    return sampleInterviewQuestions.filter(q => {
      if (!q.isMCQ || !q.mcqOptions || !q.correctAnswer) return false; // Only include valid MCQs

      const matchesCategory = selectedCategories.size === 0 || selectedCategories.has(q.category);
      const matchesSearch = searchTerm === '' || 
                            q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (q.answerOrTip && q.answerOrTip.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (q.tags && q.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) ||
                            (q.mcqOptions && q.mcqOptions.some(opt => opt.toLowerCase().includes(searchTerm.toLowerCase())));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategories, searchTerm]);

  const handleCategoryChange = (category: InterviewQuestionCategory, checked: boolean | "indeterminate") => {
    const newCategories = new Set(selectedCategories);
    if (checked === true) {
      newCategories.add(category);
    } else {
      newCategories.delete(category);
    }
    setSelectedCategories(newCategories);
  };
  
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
    // Logic for quiz creation would go here
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
          <CardTitle className="text-lg">Filter Questions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4 items-start">
            <div className="flex-1 min-w-0"> {/* Ensure input can shrink */}
                <Label htmlFor="search-questions" className="font-medium sr-only">Search Questions</Label>
                <Input 
                    id="search-questions" 
                    placeholder="Search by keywords, tags, topics..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                />
            </div>
            <div className="md:w-auto w-full">
                <Label className="font-medium sr-only">Categories</Label>
                <ScrollArea className="h-20 md:h-auto md:max-h-28 border rounded-md p-2">
                    <div className="flex flex-row md:flex-wrap gap-x-4 gap-y-2">
                    {ALL_CATEGORIES.map(category => (
                    <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                        id={`cat-${category}`}
                        checked={selectedCategories.has(category)}
                        onCheckedChange={(checked) => handleCategoryChange(category, checked)}
                        />
                        <Label htmlFor={`cat-${category}`} className="font-normal text-sm cursor-pointer whitespace-nowrap">{category}</Label>
                    </div>
                    ))}
                    </div>
                </ScrollArea>
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

