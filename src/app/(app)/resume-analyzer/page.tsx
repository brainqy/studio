
"use client";

import React, { useState, type FormEvent, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
    Search, UploadCloud, ArrowRight, Loader2, Download, CheckCircle, BarChart, Edit3, 
    Wrench, AlignLeft, SlidersHorizontal, Wand2, Lightbulb, Brain, SearchCheck, 
    ChevronsUpDown, ListChecks, History, Star, Trash2, Bookmark, PlusCircle, HelpCircle, XCircle, Info, Zap, MessageSquare, ThumbsUp, Users, FileText, FileCheck2, EyeOff, Columns, Palette, CalendarDays
} from "lucide-react";
import { analyzeResumeAndJobDescription, type AnalyzeResumeAndJobDescriptionOutput } from '@/ai/flows/analyze-resume-and-job-description';
// calculateMatchScore and suggestResumeImprovements are kept for potential future re-integration or separate features
// import { calculateMatchScore, type CalculateMatchScoreOutput } from '@/ai/flows/calculate-match-score';
// import { suggestResumeImprovements, type SuggestResumeImprovementsOutput } from '@/ai/flows/suggest-resume-improvements';
// import { suggestDynamicSkills, type SuggestDynamicSkillsInput, type SuggestDynamicSkillsOutput } from '@/ai/flows/suggest-dynamic-skills';
import { useToast } from '@/hooks/use-toast';
import { sampleResumeScanHistory as initialScanHistory, sampleResumeProfiles, sampleUserProfile } from '@/lib/sample-data';
import type { ResumeScanHistoryItem, ResumeProfile, AtsFormattingIssue } from '@/types';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ScoreCircle from '@/components/ui/score-circle';

interface AnalysisResults {
  // overallScoreData: CalculateMatchScoreOutput | null; // Simplified for now
  detailedReport: AnalyzeResumeAndJobDescriptionOutput | null;
  // improvementsData: SuggestResumeImprovementsOutput | null; // Simplified
  // skillSuggestions: SuggestDynamicSkillsOutput | null; // Simplified
}

export default function ResumeAnalyzerPage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [scanHistory, setScanHistory] = useState<ResumeScanHistoryItem[]>(initialScanHistory.filter(item => item.userId === sampleUserProfile.id));
  const [resumes, setResumes] = useState<ResumeProfile[]>(sampleResumeProfiles.filter(r => r.userId === sampleUserProfile.id));
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'highest' | 'starred' | 'archived'>('all');

  const { toast } = useToast();

   useEffect(() => {
    const selectedResume = resumes.find(r => r.id === selectedResumeId);
    if (selectedResume) {
      setResumeText(selectedResume.resumeText ?? '');
      toast({ title: "Resume Loaded", description: `Loaded content for ${selectedResume.name}.`});
    } else if (!resumeFile) {
        // Only clear if no file selected and no resume ID selected. Avoids clearing pasted text.
        // if(!selectedResumeId) setResumeText('');
    }
   }, [selectedResumeId, resumes, toast, resumeFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setResumeFile(file);
      setSelectedResumeId(null); 
      setResumeText(''); 
      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (e) => {
          setResumeText(e.target?.result as string ?? '');
        };
        reader.readAsText(file);
      } else {
        toast({ title: "File Selected", description: `Selected ${file.name}. Content will be extracted upon analysis (simulated for non-txt).` });
      }
    }
  };

  const handleSubmit = async (event?: FormEvent) => {
    if(event) event.preventDefault();
    if (!resumeText.trim() && !resumeFile) {
      toast({ title: "Error", description: "Please upload or select a resume, or paste resume text.", variant: "destructive" });
      return;
    }
    if (!jobDescription.trim()) {
      toast({ title: "Error", description: "Please provide a job description.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      let currentResumeText = resumeText;
      if (resumeFile && !resumeText.trim()) {
        // Simulate text extraction for non-txt files for demo purposes
        currentResumeText = `Simulated content for ${resumeFile.name}. This resume highlights experience in full-stack development with React, Node.js, and Python. It includes leadership of a team of 5 and successful project delivery increasing efficiency by 15%. Education includes a Master's degree in Computer Science.`;
        if (resumeFile.name.toLowerCase().includes("product")) {
            currentResumeText += " Additionally, showcases expertise in product strategy, user research, and agile methodologies. Successfully launched 3 new products to market.";
        } else if (resumeFile.name.toLowerCase().includes("data")) {
            currentResumeText += " Focuses on data analysis, machine learning model development, and data visualization using Python (Pandas, Scikit-learn) and Tableau.";
        }
        setResumeText(currentResumeText); // Update state if we're simulating text
      }
      
      const currentResumeProfile = selectedResumeId ? resumes.find(r => r.id === selectedResumeId) : null;

      const jdLines = jobDescription.split('\n');
      const jobTitleMatch = jdLines.find(line => typeof line === 'string' && line.toLowerCase().includes('title:'))?.split(/:(.*)/s)[1]?.trim() || "Job Title Placeholder";
      const companyMatch = jdLines.find(line => typeof line === 'string' && line.toLowerCase().includes('company:'))?.split(/:(.*)/s)[1]?.trim() || "Company Placeholder";

      const detailedReportRes = await analyzeResumeAndJobDescription({ resumeText: currentResumeText, jobDescriptionText: jobDescription });
      
      // The detailedReportRes itself is now the main source of all scores and details
      setResults({
        detailedReport: detailedReportRes,
      });

      // Create and add scan history item
      const newScanEntry: ResumeScanHistoryItem = {
        id: `scan-${Date.now()}`,
        tenantId: sampleUserProfile.tenantId,
        userId: sampleUserProfile.id,
        resumeId: currentResumeProfile?.id || (resumeFile ? `file-${resumeFile.name}` : 'pasted-text'),
        resumeName: currentResumeProfile?.name || resumeFile?.name || 'Pasted Resume',
        jobTitle: jobTitleMatch,
        companyName: companyMatch,
        resumeTextSnapshot: currentResumeText,
        jobDescriptionText: jobDescription, // Store full JD for re-analysis
        scanDate: new Date().toISOString(),
        matchScore: detailedReportRes.overallQualityScore ?? detailedReportRes.hardSkillsScore ?? 0,
        bookmarked: false,
      };
      setScanHistory(prev => [newScanEntry, ...prev]);
      // Optionally update the lastAnalyzed date for the selected resume profile
      if (currentResumeProfile) {
        setResumes(prevResumes => prevResumes.map(r => r.id === currentResumeProfile.id ? {...r, lastAnalyzed: new Date().toISOString().split('T')[0]} : r));
        // Update global sample data for demo persistence
        const globalResumeIndex = sampleResumeProfiles.findIndex(r => r.id === currentResumeProfile.id);
        if (globalResumeIndex !== -1) {
            sampleResumeProfiles[globalResumeIndex].lastAnalyzed = new Date().toISOString().split('T')[0];
        }
      }


      toast({ title: "Analysis Complete", description: "Resume analysis results are ready." });
    } catch (error) {
      console.error("Analysis error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({ title: "Analysis Failed", description: `An error occurred during analysis: ${errorMessage}`, variant: "destructive", duration: 7000 });
      // Set results to a default error state if needed, which getDefaultOutput already provides
      setResults({ detailedReport: (analyzeResumeAndJobDescription as any).getDefaultOutput(errorMessage) });
    } finally {
      setIsLoading(false);
      const reportSection = document.getElementById('analysis-report-section');
      if (reportSection) {
          reportSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleDownloadReport = () => {
    toast({ title: "Download Report (Mock)", description: "PDF report generation is mocked. Printing the page to PDF can be an alternative."});
  };
  
  const handleUploadAndRescan = () => {
    setResumeFile(null);
    // Do not clear resumeText if user might want to rescan pasted text
    // Do not clear selectedResumeId if user wants to rescan a stored resume
    setResults(null); 
    toast({ title: "Ready for Rescan", description: "Modify resume/JD and click Analyze, or upload a new resume to analyze against the current job description."});
  };

  const handlePowerEdit = () => {
    toast({ title: "Power Edit (Mock)", description: "This feature would open an advanced resume editor."});
  };

  const handleViewReport = async (item: ResumeScanHistoryItem) => {
    if (!item.resumeTextSnapshot || !item.jobDescriptionText) {
        toast({ title: "Cannot View Report", description: "Missing resume or job description text for this historical scan.", variant: "destructive" });
        return;
    }
    setResumeText(item.resumeTextSnapshot);
    setJobDescription(item.jobDescriptionText);
    setResumeFile(null); 
    setSelectedResumeId(null); // Unset selected profile to ensure historical text is used
    
    toast({ title: "Loading Historical Scan...", description: "Re-generating analysis for the selected scan." });
    setIsLoading(true);
    try {
      const detailedReportRes = await analyzeResumeAndJobDescription({ resumeText: item.resumeTextSnapshot, jobDescriptionText: item.jobDescriptionText });
      setResults({
        detailedReport: detailedReportRes,
      });
      toast({ title: "Historical Report Loaded", description: "The analysis report for the selected scan has been re-generated." });
    } catch (error) {
      console.error("Historical analysis error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({ title: "Report Load Failed", description: `An error occurred while re-generating the historical report: ${errorMessage}`, variant: "destructive", duration: 7000 });
      setResults({ detailedReport: (analyzeResumeAndJobDescription as any).getDefaultOutput(errorMessage) });
    } finally {
      setIsLoading(false);
      const reportSection = document.getElementById('analysis-report-section');
      if (reportSection) reportSection.scrollIntoView({ behavior: 'smooth' });
    }
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
  };

  const filteredScanHistory = useMemo(() => {
    let filtered = [...scanHistory];
    if (historyFilter === 'highest') {
      filtered.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    } else if (historyFilter === 'starred') {
      filtered = filtered.filter(item => item.bookmarked);
    } else if (historyFilter === 'archived') {
      // Assuming an 'archived' status might be added to ResumeScanHistoryItem type later
      filtered = filtered.filter(item => (item as any).archived === true); 
    }
    return filtered;
  }, [scanHistory, historyFilter]);

  const summaryStats = useMemo(() => {
    const totalScans = scanHistory.length;
    const uniqueResumes = new Set(scanHistory.map(s => s.resumeId)).size;
    const maxScore = scanHistory.reduce((max, s) => Math.max(max, s.matchScore || 0), 0);
    const highScoringCount = scanHistory.filter(s => (s.matchScore || 0) >= 80).length;
    return { totalScans, uniqueResumes, maxScore, highScoringCount };
  }, [scanHistory]);
  
  const getIssuesCountText = (score: number | undefined, itemsWithIssues?: any[]): string => {
    if (itemsWithIssues && itemsWithIssues.length > 0) {
      return `${itemsWithIssues.length} issue${itemsWithIssues.length !== 1 ? 's' : ''}`;
    }
    if (score === undefined) return 'N/A';
    const issues = Math.max(0, Math.round((100 - score) / 20)); // Simple heuristic
    return `${issues} issue${issues !== 1 ? 's' : ''}`;
  };

  const getSearchabilityIssuesCount = (details: AnalyzeResumeAndJobDescriptionOutput['searchabilityDetails']): string => {
      if (!details) return 'N/A';
      let issues = 0;
      if (!details.hasPhoneNumber) issues++;
      if (!details.hasEmail) issues++;
      // if (!details.hasAddress) issues++; // Optional
      if (!details.jobTitleMatchesJD) issues++;
      if (!details.hasWorkExperienceSection) issues++;
      if (!details.hasEducationSection) issues++;
      if (!details.hasProfessionalSummary) issues++;
      return `${issues} issue${issues !== 1 ? 's' : ''}`;
  };


  return (
    <div className="space-y-8">
    <TooltipProvider>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Search className="h-8 w-8 text-primary" /> Resume Analyzer
          </CardTitle>
          <CardDescription>Upload your resume and paste a job description to get an AI-powered analysis and match score.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                 <div className="flex items-center gap-2">
                   <Label htmlFor="resume-select" className="text-lg font-medium">Select Existing Resume</Label>
                   <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" type="button" className="h-5 w-5 p-0"><HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" /></Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Choose a resume you've previously saved or analyzed.</p>
                      </TooltipContent>
                    </Tooltip>
                 </div>
                 <select
                    id="resume-select"
                    value={selectedResumeId || ''}
                    onChange={(e) => { setSelectedResumeId(e.target.value || null); if(e.target.value) setResumeFile(null); }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                 >
                    <option value="">-- Select or Paste/Upload Below --</option>
                    {resumes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                 </select>

                <div className="relative flex items-center my-2">
                    <div className="flex-grow border-t border-muted"></div>
                    <span className="flex-shrink mx-4 text-muted-foreground text-xs uppercase">OR</span>
                    <div className="flex-grow border-t border-muted"></div>
                </div>

                <Label htmlFor="resume-file-upload" className="text-lg font-medium">Upload New Resume</Label>
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="resume-file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary/50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag &amp; drop</p>
                            <p className="text-xs text-muted-foreground">PDF, DOCX, TXT</p>
                        </div>
                        <Input id="resume-file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.doc,.txt"/>
                    </label>
                </div>
                {resumeFile && <p className="text-sm text-muted-foreground">Uploaded: {resumeFile.name}</p>}

                 <div className="relative flex items-center my-2">
                    <div className="flex-grow border-t border-muted"></div>
                    <span className="flex-shrink mx-4 text-muted-foreground text-xs uppercase">OR</span>
                    <div className="flex-grow border-t border-muted"></div>
                </div>

                <Label htmlFor="resume-text-area" className="text-lg font-medium">Paste Resume Text</Label>
                <Textarea
                  id="resume-text-area"
                  placeholder="Paste your resume content here..."
                  value={resumeText}
                  onChange={(e) => { setResumeText(e.target.value); setSelectedResumeId(null); setResumeFile(null); }}
                  rows={8}
                  className="border-input focus:ring-primary"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor="job-description-area" className="text-lg font-medium">Job Description</Label>
                   <Tooltip>
                    <TooltipTrigger asChild>
                       <Button variant="ghost" size="icon" type="button" className="h-5 w-5 p-0"><HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" /></Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Paste the full job description. For best results, include "Title: &lt;Job Title&gt;" and "Company: &lt;Company Name&gt;" on separate lines if not naturally present in the JD.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Textarea
                  id="job-description-area"
                  placeholder="Paste the job description here... For better results, include 'Title: <Job Title>' and 'Company: <Company Name>' on separate lines if possible."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={resumes.length > 0 || resumeFile || resumeText ? 10 + 14 : 10} // Dynamic rows based on if resume input is visible
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
      
      {results && results.detailedReport && (
        <Card className="shadow-xl mt-8" id="analysis-report-section">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <FileCheck2 className="h-7 w-7 text-primary" /> Analysis Report
                </CardTitle>
                <CardDescription>Detailed breakdown of your resume against the job description.</CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleDownloadReport} variant="outline">
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column - Scores & Actions */}
                <div className="md:col-span-1 space-y-6 p-4 border-r border-border rounded-l-lg bg-secondary/30">
                    <ScoreCircle score={results.detailedReport.overallQualityScore ?? results.detailedReport.hardSkillsScore ?? 0} size="xl" label="Match Rate" />
                    
                    <Button onClick={handleUploadAndRescan} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        <UploadCloud className="mr-2 h-4 w-4" /> Upload & Rescan
                    </Button>
                    <Button onClick={handlePowerEdit} variant="outline" className="w-full">
                        <Wand2 className="mr-2 h-4 w-4" /> Power Edit
                    </Button>

                    <div className="space-y-3 pt-4 border-t">
                        {[
                            {label: "Searchability", score: results.detailedReport.searchabilityScore, issuesText: getSearchabilityIssuesCount(results.detailedReport.searchabilityDetails)},
                            {label: "Recruiter Tips", score: results.detailedReport.recruiterTipsScore, issuesText: getIssuesCountText(results.detailedReport.recruiterTipsScore, undefined, results.detailedReport.recruiterTips?.filter(tip => tip.status === 'negative').length)},
                            {label: "Formatting", score: results.detailedReport.formattingScore, issuesText: getIssuesCountText(results.detailedReport.formattingScore, undefined, results.detailedReport.formattingDetails?.length)},
                            {label: "Highlights", score: results.detailedReport.highlightsScore, issuesText: getIssuesCountText(results.detailedReport.highlightsScore)},
                            {label: "Hard Skills", score: results.detailedReport.hardSkillsScore, issuesText: getIssuesCountText(results.detailedReport.hardSkillsScore, undefined, results.detailedReport.missingSkills?.length)},
                            {label: "Soft Skills", score: results.detailedReport.softSkillsScore, issuesText: getIssuesCountText(results.detailedReport.softSkillsScore)},
                            {label: "ATS Compliance", score: results.detailedReport.atsStandardFormattingComplianceScore, issuesText: getIssuesCountText(results.detailedReport.atsStandardFormattingComplianceScore, undefined, results.detailedReport.standardFormattingIssues?.length)},
                        ].map(cat => cat.score !== undefined && (
                            <div key={cat.label}>
                                <div className="flex justify-between text-sm mb-0.5">
                                    <span className="font-medium text-muted-foreground">{cat.label}</span>
                                    <span className="text-xs text-red-500">{cat.issuesText}</span>
                                </div>
                                <Progress value={cat.score} className="h-2 [&>div]:bg-primary mb-1" />
                                <p className="text-xs text-primary text-right font-semibold">{cat.score}%</p>
                            </div>
                        ))}
                    </div>
                     <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
                        <Lightbulb className="mr-2 h-4 w-4" /> Guide me
                    </Button>
                </div>

                {/* Right Column - Detailed Breakdown */}
                <div className="md:col-span-2 space-y-6 p-4">
                     <div className="flex items-start gap-2 text-sm text-muted-foreground mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <Info className="h-6 w-6 text-blue-600 shrink-0 mt-0.5"/>
                        <div>
                            <strong className="text-blue-700">Quick Guide:</strong>
                            <ol className="list-decimal list-inside text-xs">
                                <li>Review suggestions in the tabs/accordions below.</li>
                                <li>Update your original resume document (e.g., in Word or Google Docs).</li>
                                <li>Use "Upload & Rescan" with your updated resume to see improvements!</li>
                            </ol>
                        </div>
                    </div>
                    
                    <Tabs defaultValue="searchability_tab" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
                            <TabsTrigger value="searchability_tab" className="text-xs sm:text-sm">Searchability</TabsTrigger>
                            <TabsTrigger value="recruiter_tips_tab" className="text-xs sm:text-sm">Recruiter Tips</TabsTrigger>
                            <TabsTrigger value="content_style_tab" className="text-xs sm:text-sm">Content/Style</TabsTrigger>
                            <TabsTrigger value="ats_formatting_tab" className="text-xs sm:text-sm">ATS & Formatting</TabsTrigger>
                        </TabsList>

                        <TabsContent value="searchability_tab" className="mt-4">
                             <Card className="border-border shadow-sm">
                                <CardHeader className="p-3 bg-secondary/20 rounded-t-md">
                                    <CardTitle className="text-md font-semibold flex items-center gap-2">
                                        <Search className="h-5 w-5 text-primary"/>Searchability Checklist
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 space-y-3">
                                    {[
                                        {label: "Phone Number Found", checked: results.detailedReport.searchabilityDetails?.hasPhoneNumber ?? false, tip: "Ensure a clear phone number is present."},
                                        {label: "Email Found", checked: results.detailedReport.searchabilityDetails?.hasEmail ?? false, tip: "Include a professional email address."},
                                        {label: "Address Present (Optional)", checked: results.detailedReport.searchabilityDetails?.hasAddress ?? false, tip: "City, State is often sufficient."},
                                        {label: "Job Title Aligns with JD", checked: results.detailedReport.searchabilityDetails?.jobTitleMatchesJD ?? false, tip: "Tailor your resume's job title or summary to the target role."},
                                        {label: "Professional Summary/Objective Found", checked: results.detailedReport.searchabilityDetails?.hasProfessionalSummary ?? false, tip: "A concise summary helps recruiters quickly understand your profile."},
                                        {label: "Work Experience Section Clear", checked: results.detailedReport.searchabilityDetails?.hasWorkExperienceSection ?? false, tip: "Use standard headings like 'Experience' or 'Work History'."},
                                        {label: "Education Section Clear", checked: results.detailedReport.searchabilityDetails?.hasEducationSection ?? false, tip: "Use standard headings like 'Education'."},
                                    ].map(item => (
                                        <div key={item.label} className="flex items-start gap-2 text-sm p-2 border-b last:border-b-0">
                                            {item.checked ? <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5"/> : <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5"/>}
                                            <div className="flex-1">
                                                <span className={cn(item.checked ? "text-foreground" : "text-red-600")}>{item.label}</span>
                                                {!item.checked && <p className="text-xs text-muted-foreground italic">{item.tip}</p>}
                                            </div>
                                        </div>
                                    ))}
                                    {results.detailedReport.searchabilityDetails?.keywordDensityFeedback && (
                                        <div className="p-2 bg-muted rounded-md mt-2">
                                            <p className="text-xs font-medium">Keyword Density Feedback:</p>
                                            <p className="text-xs italic">{results.detailedReport.searchabilityDetails.keywordDensityFeedback}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                        
                        <TabsContent value="recruiter_tips_tab" className="mt-4">
                             {results.detailedReport.recruiterTips && results.detailedReport.recruiterTips.length > 0 && (
                                <Card className="border-border shadow-sm">
                                    <CardHeader className="p-3 bg-secondary/20 rounded-t-md">
                                        <CardTitle className="text-md font-semibold flex items-center gap-2">
                                            <Users className="h-5 w-5 text-primary"/>Recruiter Tips ({results.detailedReport.recruiterTipsScore}%)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-3 space-y-2">
                                        {results.detailedReport.recruiterTips.map((tip, idx) => (
                                            <div key={idx} className={cn("p-2 border-l-4 rounded-r-md bg-card text-xs", tip.status === 'positive' ? 'border-green-500' : tip.status === 'neutral' ? 'border-blue-500' : 'border-red-500')}>
                                                <strong className="text-foreground">{tip.category}:</strong> {tip.finding}
                                                {tip.suggestion && tip.status !== 'positive' && <p className="text-blue-600 mt-0.5 pl-2"><em>Suggestion: {tip.suggestion}</em></p>}
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="content_style_tab" className="mt-4">
                            <Accordion type="multiple" className="w-full space-y-3">
                                {results.detailedReport.quantifiableAchievementDetails && (
                                <AccordionItem value="quantifiable" className="border rounded-md shadow-sm bg-card">
                                    <AccordionTrigger className="text-sm font-medium hover:text-primary data-[state=open]:text-primary p-3"><BarChart className="mr-2 h-4 w-4"/>Quantifiable Achievements ({results.detailedReport.quantifiableAchievementDetails.score ?? 0}%)</AccordionTrigger>
                                    <AccordionContent className="p-3 border-t text-xs space-y-1">
                                        {results.detailedReport.quantifiableAchievementDetails.examplesFound && results.detailedReport.quantifiableAchievementDetails.examplesFound.length > 0 && <p><strong>Strong Examples:</strong> {results.detailedReport.quantifiableAchievementDetails.examplesFound.join('; ')}</p>}
                                        {results.detailedReport.quantifiableAchievementDetails.areasLackingQuantification && results.detailedReport.quantifiableAchievementDetails.areasLackingQuantification.length > 0 && <p className="text-red-600"><strong>Needs Quantification:</strong> {results.detailedReport.quantifiableAchievementDetails.areasLackingQuantification.join('; ')}</p>}
                                        {(!results.detailedReport.quantifiableAchievementDetails.examplesFound || results.detailedReport.quantifiableAchievementDetails.examplesFound.length === 0) && (!results.detailedReport.quantifiableAchievementDetails.areasLackingQuantification || results.detailedReport.quantifiableAchievementDetails.areasLackingQuantification.length === 0) && <p>No specific details provided by AI.</p>}
                                    </AccordionContent>
                                </AccordionItem>
                                )}
                                {results.detailedReport.actionVerbDetails && (
                                <AccordionItem value="action-verbs" className="border rounded-md shadow-sm bg-card">
                                    <AccordionTrigger className="text-sm font-medium hover:text-primary data-[state=open]:text-primary p-3"><ThumbsUp className="mr-2 h-4 w-4"/>Action Verbs ({results.detailedReport.actionVerbDetails.score ?? 0}%)</AccordionTrigger>
                                    <AccordionContent className="p-3 border-t text-xs space-y-1">
                                        {results.detailedReport.actionVerbDetails.strongVerbsUsed && results.detailedReport.actionVerbDetails.strongVerbsUsed.length > 0 && <p><strong>Strong Verbs:</strong> {results.detailedReport.actionVerbDetails.strongVerbsUsed.join(', ')}</p>}
                                        {results.detailedReport.actionVerbDetails.weakVerbsUsed && results.detailedReport.actionVerbDetails.weakVerbsUsed.length > 0 && <p className="text-yellow-600"><strong>Weak Verbs:</strong> {results.detailedReport.actionVerbDetails.weakVerbsUsed.join(', ')}</p>}
                                        {results.detailedReport.actionVerbDetails.overusedVerbs && results.detailedReport.actionVerbDetails.overusedVerbs.length > 0 && <p className="text-yellow-600"><strong>Overused:</strong> {results.detailedReport.actionVerbDetails.overusedVerbs.join(', ')}</p>}
                                        {results.detailedReport.actionVerbDetails.suggestedStrongerVerbs && results.detailedReport.actionVerbDetails.suggestedStrongerVerbs.length > 0 && <p><strong>Suggestions:</strong> {results.detailedReport.actionVerbDetails.suggestedStrongerVerbs.map(s => `${s.original} → ${s.suggestion}`).join('; ')}</p>}
                                    </AccordionContent>
                                </AccordionItem>
                                )}
                                {results.detailedReport.impactStatementDetails && (
                                <AccordionItem value="item-impact" className="border rounded-md shadow-sm bg-card">
                                    <AccordionTrigger className="text-sm font-medium hover:text-primary data-[state=open]:text-primary p-3"><Zap className="mr-2 h-4 w-4"/>Impact Statements ({results.detailedReport.impactStatementDetails.clarityScore ?? 0}%)</AccordionTrigger>
                                    <AccordionContent className="p-3 border-t text-xs space-y-1">
                                        {results.detailedReport.impactStatementDetails.exampleWellWrittenImpactStatements && results.detailedReport.impactStatementDetails.exampleWellWrittenImpactStatements.length > 0 && <p><strong>Good Examples:</strong> {results.detailedReport.impactStatementDetails.exampleWellWrittenImpactStatements.join('; ')}</p>}
                                        {results.detailedReport.impactStatementDetails.unclearImpactStatements && results.detailedReport.impactStatementDetails.unclearImpactStatements.length > 0 && <p className="text-red-600"><strong>Could Improve:</strong> {results.detailedReport.impactStatementDetails.unclearImpactStatements.join('; ')}</p>}
                                    </AccordionContent>
                                </AccordionItem>
                                )}
                                {results.detailedReport.readabilityDetails && (
                                <AccordionItem value="item-readability" className="border rounded-md shadow-sm bg-card">
                                    <AccordionTrigger className="text-sm font-medium hover:text-primary data-[state=open]:text-primary p-3"><MessageSquare className="mr-2 h-4 w-4"/>Readability</AccordionTrigger>
                                    <AccordionContent className="p-3 border-t text-xs space-y-1">
                                        {results.detailedReport.readabilityDetails.fleschReadingEase !== undefined && <p><strong>Flesch Reading Ease:</strong> {results.detailedReport.readabilityDetails.fleschReadingEase.toFixed(1)}</p>}
                                        {results.detailedReport.readabilityDetails.fleschKincaidGradeLevel !== undefined && <p><strong>Flesch-Kincaid Grade Level:</strong> {results.detailedReport.readabilityDetails.fleschKincaidGradeLevel.toFixed(1)}</p>}
                                        {results.detailedReport.readabilityDetails.readabilityFeedback && <p><strong>Feedback:</strong> {results.detailedReport.readabilityDetails.readabilityFeedback}</p>}
                                    </AccordionContent>
                                </AccordionItem>
                                )}
                            </Accordion>
                        </TabsContent>

                        <TabsContent value="ats_formatting_tab" className="mt-4">
                            <Accordion type="multiple" className="w-full space-y-3">
                                {results.detailedReport.atsParsingConfidence && (
                                    <AccordionItem value="ats-confidence" className="border rounded-md shadow-sm bg-card">
                                    <AccordionTrigger className="text-sm font-medium hover:text-primary data-[state=open]:text-primary p-3"><SearchCheck className="mr-2 h-4 w-4"/>ATS Parsing Confidence ({results.detailedReport.atsParsingConfidence.overall ?? 0}%)</AccordionTrigger>
                                    <AccordionContent className="p-3 border-t text-xs space-y-1">
                                         {results.detailedReport.atsParsingConfidence.warnings && results.detailedReport.atsParsingConfidence.warnings.length > 0 && (
                                            <p className="text-yellow-600"><strong>Warnings:</strong> {results.detailedReport.atsParsingConfidence.warnings.join('; ')}</p>
                                        )}
                                        {(!results.detailedReport.atsParsingConfidence.warnings || results.detailedReport.atsParsingConfidence.warnings.length === 0) && <p>No specific parsing warnings.</p>}
                                    </AccordionContent>
                                    </AccordionItem>
                                )}
                                {results.detailedReport.standardFormattingIssues && (
                                    <AccordionItem value="standard-formatting" className="border rounded-md shadow-sm bg-card">
                                    <AccordionTrigger className="text-sm font-medium hover:text-primary data-[state=open]:text-primary p-3"><Columns className="mr-2 h-4 w-4"/>Standard Formatting ({results.detailedReport.atsStandardFormattingComplianceScore ?? 0}%)</AccordionTrigger>
                                    <AccordionContent className="p-3 border-t text-xs space-y-1">
                                        {results.detailedReport.standardFormattingIssues.length > 0 ? results.detailedReport.standardFormattingIssues.map((item, idx) => (
                                            <p key={idx}><strong className="text-red-600">Issue:</strong> {item.issue} <br/><span className="text-blue-600">→ Recommendation:</span> {item.recommendation}</p>
                                        )) : <p>No specific standard formatting issues found.</p>}
                                    </AccordionContent>
                                    </AccordionItem>
                                )}
                                {results.detailedReport.undefinedAcronyms && results.detailedReport.undefinedAcronyms.length > 0 && (
                                <AccordionItem value="acronyms" className="border rounded-md shadow-sm bg-card">
                                    <AccordionTrigger className="text-sm font-medium hover:text-primary data-[state=open]:text-primary p-3"><EyeOff className="mr-2 h-4 w-4"/>Undefined Acronyms</AccordionTrigger>
                                    <AccordionContent className="p-3 border-t text-xs">
                                        <p className="text-yellow-600">Consider defining: {results.detailedReport.undefinedAcronyms.join(', ')}</p>
                                    </AccordionContent>
                                </AccordionItem>
                                )}
                            </Accordion>
                        </TabsContent>
                    </Tabs>
                </div>
            </CardContent>
        </Card>
      )}

      {/* Scan History Section */}
      <Card className="shadow-xl mt-12">
         <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <History className="h-7 w-7 text-primary" /> Resume Scan History
          </CardTitle>
          <CardDescription>Review your past resume analyses.</CardDescription>
        </CardHeader>
        <CardContent>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { title: "Total Scans", value: summaryStats.totalScans },
                  { title: "Unique Resumes", value: summaryStats.uniqueResumes },
                  { title: "Highest Score", value: `${summaryStats.maxScore}%` },
                  { title: "High Scoring (>80%)", value: summaryStats.highScoringCount }, 
                ].map(stat => (
                  <Card key={stat.title} className="border shadow-sm">
                      <CardContent className="p-4 text-center">
                          <p className="text-3xl font-bold text-primary">{stat.value}</p>
                          <p className="text-xs text-muted-foreground">{stat.title}</p>
                      </CardContent>
                  </Card>
                ))}
             </div>

             <Tabs defaultValue="all" onValueChange={(value) => setHistoryFilter(value as 'all' | 'highest' | 'starred' | 'archived')} className="mb-4">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                <TabsTrigger value="all">View All</TabsTrigger>
                <TabsTrigger value="highest">Highest Match</TabsTrigger>
                <TabsTrigger value="starred">Starred</TabsTrigger>
                <TabsTrigger value="archived">Archived</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-4">
                {filteredScanHistory.length === 0 ? (
                    <p className="text-center text-muted-foreground py-6">No scans found matching the filter.</p>
                ) : (
                    filteredScanHistory.slice(0, 5).map(item => (
                         <Card key={item.id} className="flex items-center p-4 gap-3 border hover:shadow-md transition-shadow">
                             <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-yellow-500 self-start mt-1" onClick={() => handleToggleBookmark(item.id)}>
                                 <Star className={cn("h-5 w-5", item.bookmarked && "fill-yellow-400 text-yellow-500")} />
                             </Button>
                             {item.matchScore !== undefined && <ScoreCircle score={item.matchScore} size="sm" />}
                             <div className="flex-1 space-y-0.5">
                                <h4 className="font-semibold text-md text-foreground">{item.jobTitle || 'Job Title Missing'} at {item.companyName || 'Company Missing'}</h4>
                                <p className="text-sm text-muted-foreground">Resume: {item.resumeName || 'Unknown Resume'}</p>
                             </div>
                            <div className="flex flex-col items-end space-y-1 self-start">
                               <p className="text-xs text-muted-foreground">{format(new Date(item.scanDate), 'MMM dd, yyyy')}</p>
                                <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => handleViewReport(item)}>View Report</Button>
                                <Button variant="outline" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteScan(item.id)}>
                                  <Trash2 className="h-3.5 w-3.5"/>
                                </Button>
                            </div>
                         </Card>
                    ))
                )}
                {scanHistory.length > 5 && (
                     <p className="text-center text-sm text-muted-foreground mt-4">
                        Standard users can only view the last 5 scans.
                    </p>
                )}
            </div>
             <div className="mt-8 text-center">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 text-base" onClick={() => toast({title: "Feature Mock", description: "Unlock unlimited history is a premium feature."})}>
                    Unlock Unlimited Scan History
                </Button>
             </div>
        </CardContent>
      </Card>
    </TooltipProvider>
    </div>
  );
}

