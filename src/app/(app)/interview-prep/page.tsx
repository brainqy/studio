"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Brain, Mic, MessageSquare, Users, Zap, Tag, Lightbulb } from "lucide-react";
import { sampleInterviewQuestions } from "@/lib/sample-data";
import type { InterviewQuestion, InterviewQuestionCategory } from "@/types";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";


const ALL_CATEGORIES: InterviewQuestionCategory[] = ['Common', 'Behavioral', 'Technical', 'Role-Specific'];

export default function InterviewPreparationPage() {
  const [selectedCategories, setSelectedCategories] = useState<Set<InterviewQuestionCategory>>(new Set(ALL_CATEGORIES));
  const [searchTerm, setSearchTerm] = useState('');

  const filteredQuestions = useMemo(() => {
    return sampleInterviewQuestions.filter(q => {
      const matchesCategory = selectedCategories.size === 0 || selectedCategories.has(q.category);
      const matchesSearch = searchTerm === '' || 
                            q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            q.answerOrTip.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (q.tags && q.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Brain className="h-8 w-8" /> Interview Preparation
          </h1>
          <CardDescription>Sharpen your skills with mock interviews and our extensive question bank.</CardDescription>
        </div>
         <Button variant="outline" size="lg" asChild>
            <Link href="/alumni-connect">
               <Users className="mr-2 h-5 w-5" /> Find Alumni for Mock Interview
            </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Mic className="h-6 w-6 text-primary"/>Mock Interviews</CardTitle>
          <CardDescription>Practice makes perfect. Simulate real interview scenarios.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Currently, you can connect with experienced alumni through our <Link href="/alumni-connect" className="text-primary hover:underline">Alumni Connect</Link> page to request mock interviews.
            Look for alumni offering "Interview Practice" or similar in their "Offers Help With" section.
          </p>
          <div className="p-6 border-2 border-dashed rounded-lg text-center bg-secondary/30">
            <Zap className="h-10 w-10 text-primary mx-auto mb-3"/>
            <h3 className="text-lg font-semibold text-foreground">AI-Powered Mock Interviews (Coming Soon!)</h3>
            <p className="text-sm text-muted-foreground mt-1">
              We're working on an AI feature that will provide instant feedback on your interview responses. Stay tuned!
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MessageSquare className="h-6 w-6 text-primary"/>Interview Question Bank</CardTitle>
          <CardDescription>Explore common questions and expert tips.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="md:col-span-1 space-y-3">
              <Label htmlFor="search-questions" className="font-medium">Search Questions</Label>
              <Input 
                id="search-questions" 
                placeholder="Keywords, tags..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <h4 className="font-medium pt-2">Filter by Category:</h4>
              <ScrollArea className="h-40 pr-2">
                <div className="space-y-2">
                {ALL_CATEGORIES.map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cat-${category}`}
                      checked={selectedCategories.has(category)}
                      onCheckedChange={(checked) => handleCategoryChange(category, checked)}
                    />
                    <Label htmlFor={`cat-${category}`} className="font-normal text-sm">{category}</Label>
                  </div>
                ))}
                </div>
              </ScrollArea>
            </div>
            <div className="md:col-span-3">
              {filteredQuestions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No questions match your criteria.</p>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {filteredQuestions.map((q) => (
                    <AccordionItem value={q.id} key={q.id}>
                      <AccordionTrigger className="text-md text-left hover:text-primary data-[state=open]:text-primary">
                        {q.question}
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2 pl-2 text-sm">
                        <p className="text-muted-foreground whitespace-pre-line">{q.answerOrTip}</p>
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
    </div>
  );
}