"use client";

import { useState, type FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowRight, Download, FileText, Lightbulb, Loader2, Sparkles, UploadCloud } from "lucide-react";
import { analyzeResumeAndJobDescription, type AnalyzeResumeAndJobDescriptionOutput } from '@/ai/flows/analyze-resume-and-job-description';
import { calculateMatchScore, type CalculateMatchScoreOutput } from '@/ai/flows/calculate-match-score';
import { suggestResumeImprovements, type SuggestResumeImprovementsOutput } from '@/ai/flows/suggest-resume-improvements';
import { useToast } from '@/hooks/use-toast';

interface AnalysisResults {
  analysis: AnalyzeResumeAndJobDescriptionOutput | null;
  score: CalculateMatchScoreOutput | null;
  improvements: SuggestResumeImprovementsOutput | null;
}

export default function ResumeAnalyzerPage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResumeFile(file);
      // For simplicity, we'll use a FileReader to get text for .txt files
      // PDF/DOCX would require more complex parsing libraries (e.g., pdf.js, mammoth.js)
      // This part is a mock for actual PDF/DOCX parsing
      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (e) => setResumeText(e.target?.result as string);
        reader.readAsText(file);
      } else {
         setResumeText(`Mock content for ${file.name}. Actual parsing for PDF/DOCX needed.`);
         toast({ title: "File Uploaded", description: `${file.name} uploaded. Content is mocked for non-TXT files.` });
      }
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!resumeText && !resumeFile) {
      toast({ title: "Error", description: "Please upload a resume or paste resume text.", variant: "destructive" });
      return;
    }
    if (!jobDescription) {
      toast({ title: "Error", description: "Please provide a job description.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const currentResumeText = resumeText || `Content of ${resumeFile?.name}`;
      
      // These would typically be Server Actions or API calls
      // For now, directly calling the GenAI functions (assuming they are usable this way)
      const [analysisRes, scoreRes, improvementsRes] = await Promise.all([
        analyzeResumeAndJobDescription({ resumeText: currentResumeText, jobDescriptionText: jobDescription }),
        calculateMatchScore({ resumeText: currentResumeText, jobDescription: jobDescription }),
        suggestResumeImprovements({ resumeText: currentResumeText, jobDescription: jobDescription })
      ]);

      setResults({
        analysis: analysisRes,
        score: scoreRes,
        improvements: improvementsRes,
      });
      toast({ title: "Analysis Complete", description: "Resume analysis results are ready." });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({ title: "Analysis Failed", description: "An error occurred during analysis.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownloadReport = () => {
    // Mock PDF download. In a real app, use a library like jsPDF or react-pdf, or a server-side PDF generation.
    toast({ title: "Download Report", description: "PDF report generation is mocked. Printing the page to PDF can be an alternative."});
    window.print();
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="h-8 w-8 text-primary" /> Resume Analyzer
          </CardTitle>
          <CardDescription>Upload your resume and paste a job description to get an AI-powered analysis and match score.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="resume-file" className="text-lg font-medium">Upload Resume (PDF, DOCX, TXT)</Label>
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="resume-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary/50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">PDF, DOCX, TXT (MAX. 5MB)</p>
                        </div>
                        <Input id="resume-file" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.doc,.txt"/>
                    </label>
                </div>
                {resumeFile && <p className="text-sm text-muted-foreground">Uploaded: {resumeFile.name}</p>}
                 <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                        OR
                        </span>
                    </div>
                </div>
                <Label htmlFor="resume-text" className="text-lg font-medium">Paste Resume Text</Label>
                <Textarea
                  id="resume-text"
                  placeholder="Paste your resume content here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  rows={10}
                  className="border-input focus:ring-primary"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="job-description" className="text-lg font-medium">Job Description</Label>
                <Textarea
                  id="job-description"
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={resumeFile || resumeText ? 10 + 9 : 10} // Dynamically adjust height
                  className="border-input focus:ring-primary"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  Analyze Resume <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {isLoading && (
        <div className="text-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-muted-foreground">AI is working its magic... Please wait.</p>
        </div>
      )}

      {results && !isLoading && (
        <Card className="shadow-xl mt-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-7 w-7 text-primary" /> Analysis Report
              </CardTitle>
              <CardDescription>Here's how your resume matches the job description.</CardDescription>
            </div>
            <Button onClick={handleDownloadReport} variant="outline">
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {results.score && (
              <Card className="bg-secondary/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><FileText className="h-6 w-6 text-primary"/> Match Score</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center">
                    <p className="text-6xl font-bold text-primary">{results.score.matchScore}%</p>
                    <p className="text-muted-foreground">Overall Alignment</p>
                  </div>
                  <Progress value={results.score.matchScore} className="w-full h-3 [&>div]:bg-primary" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div>
                      <h4 className="font-semibold text-green-600">Relevant Keywords Found:</h4>
                      {results.score.relevantKeywords.length > 0 ? (
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                          {results.score.relevantKeywords.slice(0,5).map(kw => <li key={kw}>{kw}</li>)}
                          {results.score.relevantKeywords.length > 5 && <li>...and {results.score.relevantKeywords.length - 5} more</li>}
                        </ul>
                      ) : <p className="text-sm text-muted-foreground">No specific relevant keywords highlighted by AI.</p>}
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-600">Missing Keywords:</h4>
                       {results.score.missingKeywords.length > 0 ? (
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                          {results.score.missingKeywords.slice(0,5).map(kw => <li key={kw}>{kw}</li>)}
                           {results.score.missingKeywords.length > 5 && <li>...and {results.score.missingKeywords.length - 5} more</li>}
                        </ul>
                      ) : <p className="text-sm text-muted-foreground">No critical missing keywords identified by AI. Good job!</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
              {results.analysis && (
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-lg font-semibold hover:text-primary">Detailed Analysis</AccordionTrigger>
                  <AccordionContent className="space-y-3 p-1">
                    <p><strong className="text-primary">Matching Skills:</strong> {results.analysis.matchingSkills.join(', ') || 'N/A'}</p>
                    <p><strong className="text-primary">Missing Skills for Job:</strong> {results.analysis.missingSkills.join(', ') || 'N/A'}</p>
                    <h4 className="font-semibold mt-2 text-primary">Resume Highlights:</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{results.analysis.resumeHighlights || 'N/A'}</p>
                    <h4 className="font-semibold mt-2 text-primary">Job Description Key Points:</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{results.analysis.jobDescriptionHighlights || 'N/A'}</p>
                  </AccordionContent>
                </AccordionItem>
              )}

              {results.improvements && results.improvements.improvedResumeSections.length > 0 && (
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-lg font-semibold hover:text-primary">Improvement Suggestions</AccordionTrigger>
                  <AccordionContent className="space-y-4 p-1">
                    {results.improvements.improvedResumeSections.map(section => (
                      <div key={section.sectionTitle}>
                        <h4 className="font-semibold text-md text-primary flex items-center gap-2"><Lightbulb className="h-5 w-5"/>{section.sectionTitle}</h4>
                        <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-muted-foreground">
                          {section.suggestedImprovements.map((sugg, i) => <li key={i}>{sugg}</li>)}
                        </ul>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              )}
               {results.improvements && results.improvements.improvedResumeSections.length === 0 && (
                 <AccordionItem value="item-2">
                    <AccordionTrigger className="text-lg font-semibold hover:text-primary">Improvement Suggestions</AccordionTrigger>
                    <AccordionContent className="p-1">
                        <Alert>
                            <Lightbulb className="h-4 w-4" />
                            <AlertTitle>Great Job!</AlertTitle>
                            <AlertDescription>
                                The AI found no specific improvement suggestions for your resume based on this job description. It seems to be well-aligned!
                            </AlertDescription>
                        </Alert>
                    </AccordionContent>
                 </AccordionItem>
               )}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
