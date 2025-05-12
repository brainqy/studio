"use client";

import type React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Sparkles, ListChecks, CheckCircle, AlertTriangle, RefreshCw, MessageSquare } from 'lucide-react';
import type { MockInterviewSession } from '@/types';
import ScoreCircle from '@/components/ui/score-circle';

interface StepFeedbackProps {
  session: MockInterviewSession;
  onRestart: () => void;
}

export default function StepFeedback({ session, onRestart }: StepFeedbackProps) {
  if (!session.overallFeedback) {
    return <p>Generating feedback... Please wait.</p>;
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" /> Interview Feedback Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 border rounded-lg bg-secondary/30">
             {session.overallScore !== undefined && (
                <ScoreCircle score={session.overallScore} size="xl" label="Overall Score" />
             )}
            <div className="flex-1">
              <h4 className="font-semibold text-lg text-foreground">Overall Performance:</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{session.overallSummary}</p>
            </div>
          </div>

          {session.overallFeedback && 'keyStrengths' in session.overallFeedback && Array.isArray((session.overallFeedback as any).keyStrengths) && (session.overallFeedback as any).keyStrengths.length > 0 && (
            <div>
              <h4 className="font-semibold text-md text-foreground mb-1 flex items-center gap-1"><CheckCircle className="h-5 w-5 text-green-500" />Key Strengths:</h4>
              <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-muted-foreground">
                {(session.overallFeedback as any).keyStrengths.map((strength: string, i: number) => <li key={i}>{strength}</li>)}
              </ul>
            </div>
          )}

          {session.overallFeedback && 'keyAreasForImprovement' in session.overallFeedback && Array.isArray((session.overallFeedback as any).keyAreasForImprovement) && (session.overallFeedback as any).keyAreasForImprovement.length > 0 && (
             <div>
              <h4 className="font-semibold text-md text-foreground mb-1 flex items-center gap-1"><AlertTriangle className="h-5 w-5 text-yellow-500" />Key Areas for Improvement:</h4>
              <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-muted-foreground">
                {(session.overallFeedback as any).keyAreasForImprovement.map((area: string, i: number) => <li key={i}>{area}</li>)}
              </ul>
            </div>
          )}
          
          {session.overallFeedback && 'finalTips' in session.overallFeedback && Array.isArray((session.overallFeedback as any).finalTips) && (session.overallFeedback as any).finalTips.length > 0 && (
             <div>
              <h4 className="font-semibold text-md text-foreground mb-1 flex items-center gap-1"><ListChecks className="h-5 w-5 text-blue-500" />Final Tips:</h4>
              <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-muted-foreground">
                {(session.overallFeedback as any).finalTips.map((tip: string, i: number) => <li key={i}>{tip}</li>)}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
             <MessageSquare className="h-6 w-6 text-primary" /> Detailed Question Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          {session.answers.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {session.answers.map((answer, index) => (
                <AccordionItem value={`item-${index}`} key={answer.questionId}>
                  <AccordionTrigger className="hover:text-primary data-[state=open]:text-primary">
                    <div className="flex-1 text-left">
                        <span className="font-medium">Q{index + 1}: {answer.questionText.substring(0, 60)}...</span>
                        {answer.aiScore !== undefined && <span className="ml-2 text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">Score: {answer.aiScore}/100</span>}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 p-2">
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground">Your Answer:</p>
                      <p className="text-sm bg-secondary/40 p-2 rounded whitespace-pre-line">{answer.userAnswer}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-muted-foreground">AI Feedback:</p>
                      <p className="text-sm bg-primary/10 p-2 rounded whitespace-pre-line">{answer.aiFeedback || "No specific feedback available."}</p>
                    </div>
                     {(answer as any).strengths && Array.isArray((answer as any).strengths) && (answer as any).strengths.length > 0 && (
                        <div>
                            <p className="font-semibold text-xs text-green-600">Strengths:</p>
                            <ul className="list-disc list-inside ml-4 text-xs text-muted-foreground">
                                {(answer as any).strengths.map((s: string, i: number) => <li key={`s-${i}`}>{s}</li>)}
                            </ul>
                        </div>
                    )}
                     {(answer as any).areasForImprovement && Array.isArray((answer as any).areasForImprovement) && (answer as any).areasForImprovement.length > 0 && (
                         <div>
                            <p className="font-semibold text-xs text-yellow-600">Areas for Improvement:</p>
                            <ul className="list-disc list-inside ml-4 text-xs text-muted-foreground">
                                {(answer as any).areasForImprovement.map((a: string, i: number) => <li key={`a-${i}`}>{a}</li>)}
                            </ul>
                        </div>
                    )}
                     {(answer as any).suggestedImprovements && Array.isArray((answer as any).suggestedImprovements) && (answer as any).suggestedImprovements.length > 0 && (
                         <div>
                            <p className="font-semibold text-xs text-blue-600">Suggestions:</p>
                            <ul className="list-disc list-inside ml-4 text-xs text-muted-foreground">
                                {(answer as any).suggestedImprovements.map((sugg: string, i: number) => <li key={`sugg-${i}`}>{sugg}</li>)}
                            </ul>
                        </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-muted-foreground text-center py-4">No individual question feedback available for this session.</p>
          )}
        </CardContent>
      </Card>

      <div className="text-center mt-8">
        <Button onClick={onRestart} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <RefreshCw className="mr-2 h-5 w-5" /> Start New Mock Interview
        </Button>
      </div>
    </div>
  );
}