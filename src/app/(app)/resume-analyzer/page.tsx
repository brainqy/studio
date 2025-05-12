
"use client";

import { useState, type FormEvent, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowRight, Download, FileText, Lightbulb, Loader2, Sparkles, UploadCloud, Zap, CheckCircle, Search, Star, Trash2, BarChart, Clock, Bookmark } from "lucide-react";
import { analyzeResumeAndJobDescription, type AnalyzeResumeAndJobDescriptionOutput } from '@/ai/flows/analyze-resume-and-job-description';
import { calculateMatchScore, type CalculateMatchScoreOutput } from '@/ai/flows/calculate-match-score';
import { suggestResumeImprovements, type SuggestResumeImprovementsOutput } from '@/ai/flows/suggest-resume-improvements';
import { useToast } from '@/hooks/use-toast';
import { sampleResumeScanHistory as initialScanHistory, sampleResumeProfiles, sampleUserProfile } from '@/lib/sample-data'; // Import sample data
import type { ResumeScanHistoryItem, ResumeProfile } from '@/types'; // Import types
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs

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
  const [scanHistory, setScanHistory] = useState<ResumeScanHistoryItem[]>(initialScanHistory.filter(item => item.userId === sampleUserProfile.id)); // Filter history for current user
  const [resumes, setResumes] = useState<ResumeProfile[]>(sampleResumeProfiles.filter(r => r.userId === sampleUserProfile.id)); // User's resumes
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null); // Fix: Correct useState syntax
  const [historyFilter, setHistoryFilter] = useState<'all' | 'starred' | 'highest'>('all');

  const { toast } = useToast();

   useEffect(() => {
    // Fetch resume text when selectedResumeId changes
    const selectedResume = resumes.find(r => r.id === selectedResumeId);
    if (selectedResume) {
      setResumeText(selectedResume.resumeText);
      toast({ title: "Resume Loaded", description: `Loaded content for ${selectedResume.name}.`});
    } else {
        setResumeText(''); // Clear if no resume is selected or found
    }
   }, [selectedResumeId, resumes, toast]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setSelectedResumeId(null); // Deselect any chosen resume if a file is uploaded
      // For simplicity, we'll use a FileReader to get text for .txt files
      // PDF/DOCX would require more complex parsing libraries (e.g., pdf.js, mammoth.js)
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
      toast({ title: "Error", description: "Please upload or select a resume, or paste resume text.", variant: "destructive" });
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
      const currentResumeProfile = selectedResumeId ? resumes.find(r => r.id === selectedResumeId) : null;

      const [analysisRes, scoreRes, improvementsRes] = await Promise.all([
        analyzeResumeAndJobDescription({ resumeText: currentResumeText, jobDescriptionText: jobDescription }),
        calculateMatchScore({ resumeText: currentResumeText, jobDescription: jobDescription }),
        suggestResumeImprovements({ resumeText: currentResumeText, jobDescription: jobDescription })
      ]);

      // Add results to scan history
      const newScanEntry: ResumeScanHistoryItem = {
        id: `scan-${Date.now()}`,
        tenantId: sampleUserProfile.tenantId,
        userId: sampleUserProfile.id,
        resumeId: currentResumeProfile?.id || 'uploaded-file',
        resumeName: currentResumeProfile?.name || resumeFile?.name || 'Pasted Text',
        jobTitle: "Job Title Placeholder", // Need a way to extract/input this
        companyName: "Company Placeholder", // Need a way to extract/input this
        jobDescriptionText: jobDescription,
        scanDate: new Date().toISOString(),
        matchScore: scoreRes.matchScore,
        bookmarked: false,
      };
      setScanHistory(prev => [newScanEntry, ...prev]);


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

  const handleToggleBookmark = (scanId: string) => {
    setScanHistory(prevHistory => {
      const updatedHistory = prevHistory.map(item =>
        item.id === scanId ? { ...item, bookmarked: !item.bookmarked } : item
      );
      const bookmarkedItem = updatedHistory.find(item => item.id === scanId);
      toast({
        title: bookmarkedItem?.bookmarked ? "Scan Bookmarked" : "Bookmark Removed",
        description: `Scan for ${bookmarkedItem?.jobTitle || 'Job'} has been ${bookmarkedItem?.bookmarked ? 'bookmarked' : 'unbookmarked'}.`
      });
      return updatedHistory;
    });
  };

  const handleDeleteScan = (scanId: string) => {
      setScanHistory(prevHistory => prevHistory.filter(item => item.id !== scanId));
      toast({ title: "Scan Deleted", description: "Scan history entry removed." });
      // Add API call to delete from backend in a real app
  };

  const filteredScanHistory = useMemo(() => {
    let filtered = scanHistory;
    if (historyFilter === 'starred') {
      filtered = filtered.filter(item => item.bookmarked);
    } else if (historyFilter === 'highest') {
      // Sort by score desc, slice(0, 1) might be better if only one is needed
      filtered = [...filtered].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }
    // Add 'archived' filter logic if implemented
    return filtered;
  }, [scanHistory, historyFilter]);

  const summaryStats = useMemo(() => {
    const totalScans = scanHistory.length;
    const uniqueResumes = new Set(scanHistory.map(s => s.resumeId)).size;
    const maxScore = scanHistory.reduce((max, s) => Math.max(max, s.matchScore || 0), 0);
    // Improvement metric is complex, using placeholder
    const improvement = scanHistory.filter(s => (s.matchScore || 0) >= 80).length;
    return { totalScans, uniqueResumes, maxScore, improvement };
  }, [scanHistory]);

  // Simple circular progress display
  const ScoreCircle = ({ score }: { score: number }) => (
    <div className="relative flex items-center justify-center w-20 h-20 rounded-full border-4 border-primary bg-background shadow-md">
       <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-600"></div>
       <div
         className="absolute inset-0 rounded-full border-4 border-primary transform -rotate-90"
         style={{
           clipPath: `polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%, 50% 50%)`, // Simplified progress indicator
           strokeDasharray: `${score * 2.51} 251`, // Approximation for circumference
           borderLeftColor: score > 50 ? 'var(--primary)' : 'transparent',
           borderBottomColor: score > 75 ? 'var(--primary)' : 'transparent',
           borderRightColor: score > 25 ? 'var(--primary)' : 'transparent',
           borderTopColor: score > 0 ? 'var(--primary)' : 'transparent',
         }}
       ></div>
      <span className="text-xl font-bold text-primary z-10">{score}%</span>
       <span className="absolute bottom-2 text-[10px] text-muted-foreground z-10">Match</span>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Analyzer Form Card */}
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
              {/* Resume Input Section */}
              <div className="space-y-3">
                 <Label htmlFor="resume-select" className="text-lg font-medium">Select Existing Resume</Label>
                 <select
                    id="resume-select"
                    value={selectedResumeId || ''}
                    onChange={(e) => setSelectedResumeId(e.target.value || null)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                 >
                    <option value="">-- Select a Resume --</option>
                    {resumes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                 </select>

                <div className="relative flex items-center my-2">
                    <div className="flex-grow border-t border-muted"></div>
                    <span className="flex-shrink mx-4 text-muted-foreground text-xs uppercase">OR</span>
                    <div className="flex-grow border-t border-muted"></div>
                </div>

                <Label htmlFor="resume-file" className="text-lg font-medium">Upload New Resume</Label>
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="resume-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary/50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag & drop</p>
                            <p className="text-xs text-muted-foreground">PDF, DOCX, TXT</p>
                        </div>
                        <Input id="resume-file" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.doc,.txt"/>
                    </label>
                </div>
                {resumeFile && <p className="text-sm text-muted-foreground">Uploaded: {resumeFile.name}</p>}

                 <div className="relative flex items-center my-2">
                    <div className="flex-grow border-t border-muted"></div>
                    <span className="flex-shrink mx-4 text-muted-foreground text-xs uppercase">OR</span>
                    <div className="flex-grow border-t border-muted"></div>
                </div>

                <Label htmlFor="resume-text" className="text-lg font-medium">Paste Resume Text</Label>
                <Textarea
                  id="resume-text"
                  placeholder="Paste your resume content here..."
                  value={resumeText}
                  onChange={(e) => { setResumeText(e.target.value); setSelectedResumeId(null); }} // Clear selected resume if text is pasted
                  rows={8}
                  className="border-input focus:ring-primary"
                />
              </div>
              {/* Job Description Input Section */}
              <div className="space-y-3">
                <Label htmlFor="job-description" className="text-lg font-medium">Job Description</Label>
                <Textarea
                  id="job-description"
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={resumes.length > 0 || resumeFile || resumeText ? 10 + 14 : 10} // Adjust height based on resume inputs presence
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

      {/* Analysis Results Card */}
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

      {/* Resume Scan History Section */}
      <Card className="shadow-xl mt-12">
         <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart className="h-7 w-7 text-primary" /> Resume Scan History
          </CardTitle>
          <CardDescription>Review your past resume analyses.</CardDescription>
        </CardHeader>
        <CardContent>
            {/* Summary Cards */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-primary">{summaryStats.totalScans}</p>
                        <p className="text-xs text-muted-foreground">Total Scans</p>
                    </CardContent>
                </Card>
                <Card>
                     <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-primary">{summaryStats.uniqueResumes}</p>
                        <p className="text-xs text-muted-foreground">Unique Resumes</p>
                    </CardContent>
                </Card>
                <Card>
                     <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-primary">{summaryStats.maxScore}%</p>
                        <p className="text-xs text-muted-foreground">Maximum Score</p>
                    </CardContent>
                </Card>
                 <Card>
                     <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-primary">{summaryStats.improvement}</p>
                        <p className="text-xs text-muted-foreground">Good Matches (&gt;80%)</p> {/* Example interpretation */}
                    </CardContent>
                </Card>
             </div>

            {/* Filter Tabs */}
             <Tabs defaultValue="all" onValueChange={(value) => setHistoryFilter(value as any)} className="mb-4">
              <TabsList>
                <TabsTrigger value="all">View All</TabsTrigger>
                <TabsTrigger value="starred">View Starred</TabsTrigger>
                <TabsTrigger value="highest">View Highest Match</TabsTrigger>
                {/* Add View Archived if needed */}
              </TabsList>
            </Tabs>

            {/* History List */}
            <div className="space-y-4">
                {filteredScanHistory.length === 0 ? (
                    <p className="text-center text-muted-foreground py-6">No scans found matching the filter.</p>
                ) : (
                    filteredScanHistory.slice(0, 5).map(item => ( // Limit to 5 for standard user
                         <Card key={item.id} className="flex items-center p-4 gap-4 hover:bg-secondary/30 transition-colors">
                             <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => handleToggleBookmark(item.id)}>
                                 <Star className={cn("h-5 w-5", item.bookmarked && "fill-primary text-primary")} />
                             </Button>
                             <ScoreCircle score={item.matchScore || 0} />
                             <div className="flex-1">
                                <h4 className="font-semibold text-md">{item.jobTitle || 'N/A'} at {item.companyName || 'N/A'}</h4>
                                <p className="text-sm text-muted-foreground">Resume: {item.resumeName}</p>
                                <p className="text-sm text-muted-foreground truncate max-w-xs">JD: {item.jobDescriptionText?.substring(0, 50) || 'N/A'}...</p>
                             </div>
                            <div className="text-right">
                                <Button variant="outline" size="sm" onClick={() => handleDeleteScan(item.id)} className="mb-1">
                                    <Trash2 className="h-4 w-4 mr-1"/> Delete
                                </Button>
                                <p className="text-xs text-muted-foreground">{format(new Date(item.scanDate), 'MMM d, yyyy')}</p>
                            </div>
                         </Card>
                    ))
                )}
                {filteredScanHistory.length > 5 && (
                     <p className="text-center text-sm text-muted-foreground mt-4">
                        Standard users can only view the last 5 scans.
                    </p>
                )}
            </div>

            {/* Unlock Button */}
             <div className="mt-8 text-center">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => toast({title: "Feature Mock", description: "Unlock unlimited history is a premium feature."})}>
                    Unlock Unlimited Scan History
                </Button>
             </div>
        </CardContent>
      </Card>


    </div>
  );
}

