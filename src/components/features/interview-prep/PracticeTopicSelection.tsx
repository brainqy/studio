
"use client";
import type React from 'react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import type { InterviewQuestionCategory } from '@/types'; 
import { ScrollArea } from '@/components/ui/scroll-area';

interface PracticeTopicSelectionProps {
  availableTopics: InterviewQuestionCategory[];
  onTopicsSelected: (selectedTopics: InterviewQuestionCategory[]) => void;
  onBack: () => void;
  practiceType: string;
}

export default function PracticeTopicSelection({ availableTopics, onTopicsSelected, onBack, practiceType }: PracticeTopicSelectionProps) {
  const [selected, setSelected] = useState<Set<InterviewQuestionCategory>>(new Set());

  const toggleTopic = (topic: InterviewQuestionCategory) => {
    setSelected(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topic)) {
        newSet.delete(topic);
      } else {
        newSet.add(topic);
      }
      return newSet;
    });
  };

  const handleSubmit = () => {
    onTopicsSelected(Array.from(selected));
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Select Practice Topics for {practiceType} Interview</CardTitle>
        <CardDescription>Choose one or more topics you'd like to focus on. This will help tailor the session.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72 pr-3">
          <div className="space-y-3">
            {availableTopics.map(topic => (
              <div key={topic} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-secondary/50 transition-colors">
                <Checkbox
                  id={`topic-${topic}`}
                  checked={selected.has(topic)}
                  onCheckedChange={() => toggleTopic(topic)}
                  className="h-5 w-5"
                />
                <Label htmlFor={`topic-${topic}`} className="font-normal text-md flex-1 cursor-pointer">{topic}</Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex justify-between pt-6 border-t bg-secondary/30 p-4 rounded-b-lg">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={handleSubmit} disabled={selected.size === 0}>
          Next: Select Date & Time
        </Button>
      </CardFooter>
    </Card>
  );
}
