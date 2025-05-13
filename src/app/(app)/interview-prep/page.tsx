
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Brain, Mic, MessageSquare, Users, Zap, Tag, Lightbulb, CheckSquare as CheckSquareIcon, Code } from "lucide-react"; // Added Code icon
import { sampleInterviewQuestions } from "@/lib/sample-data";
import type { InterviewQuestion, InterviewQuestionCategory } from "@/types";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // For displaying MCQ options


const ALL_CATEGORIES: InterviewQuestionCategory[] = ['Common', 'Behavioral', 'Technical', 'Coding', 'Role-Specific', 'Analytical', 'HR'];

export default function InterviewPreparationPage() {
  const [selectedCategories, setSelectedCategories] = useState<Set<InterviewQuestionCategory>>(new Set(ALL_CATEGORIES));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMcqAnswers, setSelectedMcqAnswers] = useState<Record<string, string>>({}); // To store user's MCQ selections

  const filteredQuestions = useMemo(() => {
    return sampleInterviewQuestions.filter(q => {
      const matchesCategory = selectedCategories.size === 0 || selectedCategories.has(q.category);
      const matchesSearch = searchTerm === '' || 
                            q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            q.answerOrTip.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (q.tags && q.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) ||
                            (q.isMCQ && q.mcqOptions && q.mcqOptions.some(opt => opt.toLowerCase().includes(searchTerm.toLowerCase())));
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
    // In a real quiz, you might check the answer here or store it for later evaluation.
  };

  const getCategoryIcon = (category: InterviewQuestionCategory) => {
    switch(category) {
      case 'Behavioral': return <Users className="h-4 w-4 text-purple-500 flex-shrink-0" title="Behavioral Question"/>;
      case 'Technical': return <Zap className="h-4 w-4 text-orange-500 flex-shrink-0" title="Technical Question"/>;
      case 'Coding': return <Code className="h-4 w-4 text-sky-500 flex-shrink-0" title="Coding Question"/>;
      case 'Role-Specific': return <Brain className="h-4 w-4 text-indigo-500 flex-shrink-0" title="Role-Specific Question"/>;
      case 'Analytical': return <MessageSquare className="h-4 w-4 text-teal-500 flex-shrink-0" title="Analytical Question"/>;
      case 'HR': return <Lightbulb className="h-4 w-4 text-pink-500 flex-shrink-0" title="HR Question"/>;
      case 'Common': return <MessageSquare className="h-4 w-4 text-gray-500 flex-shrink-0" title="Common Question"/>;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Brain className="h-8 w-8" /> Interview Preparation
          </h1>
          <CardDescription>Sharpen your skills with mock interviews and our extensive question bank.</CardDescription>
        </div>
         <Button variant="default" size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/ai-mock-interview">
               <Mic className="mr-2 h-5 w-5" /> Start AI Mock Interview
            </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MessageSquare className="h-6 w-6 text-primary"/>Interview Question Bank</CardTitle>
          <CardDescription>Explore common questions, technical challenges, and expert tips. Select categories to filter questions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="md:col-span-1 space-y-3">
              <Label htmlFor="search-questions" className="font-medium">Search Questions</Label>
              <Input 
                id="search-questions" 
                placeholder="Keywords, tags, topics..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <h4 className="font-medium pt-2">Filter by Category:</h4>
              <ScrollArea className="h-48 border rounded-md p-2">
                <div className="space-y-2">
                {ALL_CATEGORIES.map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cat-${category}`}
                      checked={selectedCategories.has(category)}
                      onCheckedChange={(checked) => handleCategoryChange(category, checked)}
                    />
                    <Label htmlFor={`cat-${category}`} className="font-normal text-sm cursor-pointer">{category}</Label>
                  </div>
                ))}
                </div>
              </ScrollArea>
            </div>
            <div className="md:col-span-3">
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
                           {q.isMCQ && <CheckSquareIcon className="h-4 w-4 text-blue-500 flex-shrink-0" title="Multiple Choice Question"/>}
                           {getCategoryIcon(q.category)}
                           <span>{q.question}</span>
                        </div>
                         <span className="ml-auto mr-2 text-xs px-2 py-0.5 bg-accent text-accent-foreground rounded-full whitespace-nowrap">{q.category}</span>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pl-2 text-sm">
                        {q.isMCQ && q.mcqOptions && (
                          <div className="mb-3 p-3 border rounded-md bg-secondary/30">
                            <p className="font-medium text-foreground mb-2">Options:</p>
                            <RadioGroup 
                                onValueChange={(value) => handleMcqSelection(q.id, value)} 
                                value={selectedMcqAnswers[q.id]}
                                className="space-y-1.5"
                            >
                              {q.mcqOptions.map((option, index) => (
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
                        )}
                        <div className="p-3 border rounded-md bg-primary/5">
                            <p className="font-medium text-primary mb-1">Answer/Tip/Explanation:</p>
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
            </div>
          </div>
        </CardContent>
      </Card>

       <Card className="shadow-md bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-700 flex items-center gap-2">
            <Lightbulb className="h-5 w-5"/>Pro Tip: Prepare with the STAR Method
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-600 space-y-1">
          <p>For behavioral questions, structure your answers using the STAR method:</p>
          <p><strong>S</strong>ituation: Describe the context.</p>
          <p><strong>T</strong>ask: What was your responsibility?</p>
          <p><strong>A</strong>ction: What specific steps did you take?</p>
          <p><strong>R</strong>esult: What was the outcome of your actions?</p>
        </CardContent>
      </Card>
    </div>
  );
}

