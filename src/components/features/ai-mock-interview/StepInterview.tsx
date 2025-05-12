"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Send, MessageSquare } from 'lucide-react';
import type { MockInterviewQuestion } from '@/types';
import { Progress } from '@/components/ui/progress';

interface StepInterviewProps {
  questions: MockInterviewQuestion[];
  currentQuestionIndex: number;
  onAnswerSubmit: (answer: string) => Promise<void>; // Make it async
  onCompleteInterview: () => void;
  isEvaluating?: boolean; // For showing loading state during answer evaluation
}

export default function StepInterview({ 
  questions, 
  currentQuestionIndex, 
  onAnswerSubmit, 
  onCompleteInterview,
  isEvaluating 
}: StepInterviewProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    setUserAnswer(''); // Clear answer when question changes
  }, [currentQuestionIndex]);

  const handleSubmit = async () => {
    if (!userAnswer.trim() || isEvaluating) return;
    await onAnswerSubmit(userAnswer); // Wait for evaluation to complete
    
    // Logic to move to next question or complete is handled in parent
    // Parent component will update currentQuestionIndex or call onCompleteInterview
  };
  
  if (!currentQuestion) {
    return <p>Loading questions or interview complete...</p>;
  }

  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <Label className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {questions.length}</Label>
        <Progress value={progressPercentage} className="w-full h-2 mt-1 [&>div]:bg-primary" />
      </div>

      <div className="p-4 border rounded-lg bg-secondary/50">
        <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
           <MessageSquare className="h-5 w-5 text-primary" />
           {currentQuestion.category && <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">{currentQuestion.category}</span>}
           Question:
        </h3>
        <p className="text-md text-foreground whitespace-pre-line">{currentQuestion.questionText}</p>
      </div>

      <div>
        <Label htmlFor="userAnswer" className="font-medium">Your Answer</Label>
        <Textarea
          id="userAnswer"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Type your answer here..."
          rows={8}
          className="border-input focus:ring-primary"
          disabled={isEvaluating}
        />
      </div>

      <Button onClick={handleSubmit} disabled={!userAnswer.trim() || isEvaluating} className="w-full md:w-auto">
        {isEvaluating ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Evaluating...</>
        ) : currentQuestionIndex === questions.length - 1 ? (
          <><Send className="mr-2 h-4 w-4" /> Submit & View Feedback</>
        ) : (
          <><Send className="mr-2 h-4 w-4" /> Submit & Next Question</>
        )}
      </Button>
    </div>
  );
}