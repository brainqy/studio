
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
import { ArrowRight, Download, FileText, Lightbulb, Loader2, Search, Star, Trash2, BarChart, Clock, Bookmark, CheckCircle, History, Zap, HelpCircle, PlusCircle as PlusCircleIcon, XCircle, Info, UploadCloud } from "lucide-react";
import { analyzeResumeAndJobDescription, type AnalyzeResumeAndJobDescriptionOutput } from '@/ai/flows/analyze-resume-and-job-description';
import { calculateMatchScore, type CalculateMatchScoreOutput } from '@/ai/flows/calculate-match-score';
import { suggestResumeImprovements, type SuggestResumeImprovementsOutput } from '@/ai/flows/suggest-resume-improvements';
import { suggestDynamicSkills, type SuggestDynamicSkillsInput, type SuggestDynamicSkillsOutput } from '@/ai/flows/suggest-dynamic-skills';
import { useToast } from '@/hooks/use-toast';
import { sampleResumeScanHistory as initialScanHistory, sampleResumeProfiles, sampleUserProfile } from '@/lib/sample-data';
import type { ResumeScanHistoryItem, ResumeProfile } from '@/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; 
import ScoreCircle from '@/components/ui/score-circle'; // Import the new component

interface AnalysisResults {
  overallScore: CalculateMatchScoreOutput | null;
  detailedReport: AnalyzeResumeAndJobDescriptionOutput | null;
  improvements: SuggestResumeImprovementsOutput | null;
  skillSuggestions: SuggestDynamicSkillsOutput | null;
}

type SuggestedSkillFromAI = SuggestDynamicSkillsOutput['suggestedSkills'][0];

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
      setResumeText(selectedResume.resumeText);
      toast({ title: "Resume Loaded", description: `Loaded content for ${selectedResume.name}.`});
    } else if (!resumeFile) {
        // setResumeText(''); // Commented out to prevent clearing pasted text when deselecting
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
          setResumeText(e.target?.result as string);
        };
        reader.readAsText(file);
      } else {
        toast({ title: "File Selected", description: `Selected ${file.name}. Content will be extracted upon analysis.` });
      }
    }
  };

  const handleSubmit = async (event?: FormEvent) => {
    if(event) event.preventDefault();
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
      let currentResumeText = resumeText;
      if (resumeFile && !resumeText) {
        currentResumeText = `Content of ${resumeFile.name} (extraction simulation). In a real app, server would extract text from PDF/DOCX.`;
      }
      
      const currentResumeProfile = selectedResumeId ? resumes.find(r => r.id === selectedResumeId) : null;

      const jdLines = jobDescription.split('\n');
      const jobTitleMatch = jdLines.find(line => line.toLowerCase().includes('title:'))?.split(':')[1]?.trim() || "Job Title Placeholder";
      const companyMatch = jdLines.find(line => line.toLowerCase().includes('company:'))?.split(':')[1]?.trim() || "Company Placeholder";


      const [overallScoreRes, detailedReportRes, improvementsRes, skillSuggestionsRes] = await Promise.all([
        calculateMatchScore({ resumeText: currentResumeText, jobDescription: jobDescription }),
        analyzeResumeAndJobDescription({ resumeText: currentResumeText, jobDescriptionText: jobDescription }),
        suggestResumeImprovements({ resumeText: currentResumeText, jobDescription: jobDescription }),
        suggestDynamicSkills({ currentSkills: currentResumeText.match(/\b\w+(?:-\w+)*\b/g) || [], contextText: jobDescription })
      ]);

      const newScanEntry: ResumeScanHistoryItem = {
        id: `scan-${Date.now()}`,
        tenantId: sampleUserProfile.tenantId,
        userId: sampleUserProfile.id,
        resumeId: currentResumeProfile?.id || (resumeFile ? `file-${resumeFile.name}` : 'pasted-text'),
        resumeName: currentResumeProfile?.name || resumeFile?.name || 'Pasted Resume',
        jobTitle: jobTitleMatch,
        companyName: companyMatch,
        resumeTextSnapshot: currentResumeText,
        jobDescriptionText: jobDescription,
        scanDate: new Date().toISOString(),
        matchScore: overallScoreRes.matchScore,
        bookmarked: false,
      };
      setScanHistory(prev => [newScanEntry, ...prev]);


      setResults({
        overallScore: overallScoreRes,
        detailedReport: detailedReportRes,
        improvements: improvementsRes,
        skillSuggestions: skillSuggestionsRes,
      });
      toast({ title: "Analysis Complete", description: "Resume analysis results are ready." });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({ title: "Analysis Failed", description: "An error occurred during analysis.", variant: "destructive" });
    } finally {
      setIsLoading(false);
      const reportSection = document.getElementById('analysis-report-section');
        if (reportSection) {
            reportSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
  };

  const handleDownloadReport = () => {
    toast({ title: "Download Report", description: "PDF report generation is mocked. Printing the page to PDF can be an alternative."});
    // window.print(); // This would print the whole page, not ideal for a focused report
  };
  
  const handleUploadAndRescan = () => {
    setResumeFile(null);
    setResumeText('');
    setSelectedResumeId(null);
    setResults(null); // Clear previous results
    toast({ title: "Ready for Rescan", description: "Please upload or select a new resume to analyze against the current job description."});
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
    // Clear resumeFile and selectedResumeId to ensure the historical text is used
    setResumeFile(null); 
    setSelectedResumeId(null);
    
    toast({ title: "Loading Historical Scan...", description: "Re-generating analysis for the selected scan." });
    
    // Trigger analysis with historical data
    // We need to ensure handleSubmit uses the state that was just set.
    // A slight delay or direct call to analysis logic is better.
    // Forcing re-render by setting isLoading true temporarily before calling handleSubmit
    setIsLoading(true);
    // Using useEffect to run handleSubmit after state updates might be cleaner
    // but for this direct action, let's call a modified handleSubmit or the core logic.

    // Directly call the analysis logic.
    try {
      const [overallScoreRes, detailedReportRes, improvementsRes, skillSuggestionsRes] = await Promise.all([
        calculateMatchScore({ resumeText: item.resumeTextSnapshot, jobDescription: item.jobDescriptionText }),
        analyzeResumeAndJobDescription({ resumeText: item.resumeTextSnapshot, jobDescriptionText: item.jobDescriptionText }),
        suggestResumeImprovements({ resumeText: item.resumeTextSnapshot, jobDescription: item.jobDescriptionText }),
        suggestDynamicSkills({ currentSkills: item.resumeTextSnapshot.match(/\b\w+(?:-\w+)*\b/g) || [], contextText: item.jobDescriptionText })
      ]);

      setResults({
        overallScore: overallScoreRes,
        detailedReport: detailedReportRes,
        improvements: improvementsRes,
        skillSuggestions: skillSuggestionsRes,
      });
      toast({ title: "Historical Report Loaded", description: "The analysis report for the selected scan has been re-generated." });
    } catch (error) {
      console.error("Historical analysis error:", error);
      toast({ title: "Report Load Failed", description: "An error occurred while re-generating the historical report.", variant: "destructive" });
    } finally {
      setIsLoading(false);
      const reportSection = document.getElementById('analysis-report-section');
        if (reportSection) {
            reportSection.scrollIntoView({ behavior: 'smooth' });
        }
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
      filtered = filtered.filter(item => (item as any).archived === true); 
    }
    return filtered;
  }, [scanHistory, historyFilter]);

  const summaryStats = useMemo(() => {
    const totalScans = scanHistory.length;
    const uniqueResumes = new Set(scanHistory.map(s => s.resumeId)).size;
    const maxScore = scanHistory.reduce((max, s) => Math.max(max, s.matchScore || 0), 0);
    const improvement = scanHistory.filter(s => (s.matchScore || 0) >= 80).length;
    return { totalScans, uniqueResumes, maxScore, improvement };
  }, [scanHistory]);

  const handleAddSkillToProfile = (skill: string) => {
     // In a real app, this would update user profile state and call an API
    // For demo, we just show a toast
    // You might want to navigate the user to their profile page or open a skill editing modal
    const currentProfileSkills = sampleUserProfile.skills || [];
    if (!currentProfileSkills.includes(skill)) {
        sampleUserProfile.skills = [...currentProfileSkills, skill]; // Update sample data for demo persistence
        toast({
            title: "Skill Added to Profile (Mock)",
            description: `"${skill}" has been added to your profile. Visit My Profile to see changes.`,
        });
    } else {
        toast({
            title: "Skill Already Exists (Mock)",
            description: `"${skill}" is already in your profile skills.`,
            variant: "default",
        });
    }
  };


  return (
    <div className="space-y-8">
    <TooltipProvider>
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
                 <div className="flex items-center gap-2">
                   <Label htmlFor="resume-select" className="text-lg font-medium">Select Existing Resume</Label>
                   <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
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
                    <option value="">-- Select a Resume --</option>
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
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Paste the full job description here. For best results, ensure the job title and company name are included. You can add them on separate lines like "Title: Software Engineer" and "Company: Tech Corp" if not present.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Textarea
                  id="job-description-area"
                  placeholder="Paste the job description here... For better results, include 'Title: <Job Title>' and 'Company: <Company Name>' on separate lines if possible."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={resumes.length > 0 || resumeFile || resumeText ? 10 + 14 : 10} // Dynamic rows calculation
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
      
      {/* DETAILED REPORT SECTION */}
      {results && !isLoading && results.overallScore && results.detailedReport && (
        <Card className="shadow-xl mt-8" id="analysis-report-section">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <CheckCircle className="h-7 w-7 text-primary" /> Analysis Report
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
            {/* Left Sidebar for Scores & Actions */}
            <div className="md:col-span-1 space-y-6 p-4 border-r border-border">
                <ScoreCircle score={results.overallScore.matchScore} size="xl" label="Match Rate" />
                <Button onClick={handleUploadAndRescan} className="w-full bg-blue-600 hover:bg-blue-700 text-white">Upload & Rescan</Button>
                <Button onClick={handlePowerEdit} variant="outline" className="w-full">Power Edit</Button>

                <div className="space-y-3">
                    {(
                        [
                            {label: "Searchability", score: results.detailedReport.searchabilityScore},
                            {label: "Recruiter Tips", score: results.detailedReport.recruiterTipsScore},
                            {label: "Formatting", score: results.detailedReport.formattingScore},
                            {label: "Highlights", score: results.detailedReport.highlightsScore},
                            {label: "Hard Skills", score: results.detailedReport.hardSkillsScore},
                            {label: "Soft Skills", score: results.detailedReport.softSkillsScore},
                        ] as {label: string; score?: number}[]
                    ).map(cat => cat.score !== undefined && (
                        <div key={cat.label}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-muted-foreground">{cat.label}</span>
                                <span className="font-semibold text-primary">{cat.score}%</span>
                            </div>
                            <Progress value={cat.score} className="h-2 [&>div]:bg-primary" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Main Content for Details */}
            <div className="md:col-span-2 space-y-6 p-4">
                {/* Searchability Section */}
                <Card>
                    <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Search className="h-5 w-5 text-primary"/>Searchability</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {[
                            { label: "Contact Info", present: results.detailedReport.searchabilityDetails.hasEmail && results.detailedReport.searchabilityDetails.hasPhoneNumber, details: [
                                { item: "Email Present", checked: results.detailedReport.searchabilityDetails.hasEmail },
                                { item: "Phone Number Present", checked: results.detailedReport.searchabilityDetails.hasPhoneNumber },
                            ]},
                            { label: "Job Title Match", present: results.detailedReport.searchabilityDetails.jobTitleMatchesJD, details: [
                                { item: "Job title aligns with description", checked: results.detailedReport.searchabilityDetails.jobTitleMatchesJD }
                            ]},
                            { label: "Section Headings", present: results.detailedReport.searchabilityDetails.hasWorkExperienceSection && results.detailedReport.searchabilityDetails.hasEducationSection, details: [
                                { item: "Work Experience Section Found", checked: results.detailedReport.searchabilityDetails.hasWorkExperienceSection },
                                { item: "Education Section Found", checked: results.detailedReport.searchabilityDetails.hasEducationSection },
                            ]},
                        ].map(section => (
                            <div key={section.label} className="py-2 border-b last:border-b-0">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium text-foreground">{section.label}</h4>
                                    <Tooltip><TooltipTrigger asChild><Info className="h-4 w-4 text-muted-foreground cursor-help"/></TooltipTrigger><TooltipContent><p>Details for {section.label.toLowerCase()}</p></TooltipContent></Tooltip>
                                </div>
                                <ul className="mt-1 space-y-0.5">
                                {section.details.map(detail => (
                                    <li key={detail.item} className="flex items-center text-sm">
                                        {detail.checked ? <CheckCircle className="h-4 w-4 text-green-500 mr-2 shrink-0"/> : <XCircle className="h-4 w-4 text-red-500 mr-2 shrink-0"/>}
                                        <span className={cn(detail.checked ? "text-muted-foreground" : "text-red-700 dark:text-red-400")}>{detail.item}</span>
                                    </li>
                                ))}
                                </ul>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Recruiter Tips Section */}
                 {results.detailedReport.recruiterTips.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary"/>Recruiter Tips</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {results.detailedReport.recruiterTips.map((tip, idx) => (
                                <div key={idx} className="py-2 border-b last:border-b-0">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-medium text-foreground">{tip.category}</h4>
                                         <Tooltip><TooltipTrigger asChild><Info className="h-4 w-4 text-muted-foreground cursor-help"/></TooltipTrigger><TooltipContent><p>{tip.suggestion || tip.finding}</p></TooltipContent></Tooltip>
                                    </div>
                                    <div className="flex items-center text-sm mt-1">
                                        {tip.status === 'positive' && <CheckCircle className="h-4 w-4 text-green-500 mr-2 shrink-0"/>}
                                        {tip.status === 'neutral' && <Info className="h-4 w-4 text-blue-500 mr-2 shrink-0"/>}
                                        {tip.status === 'negative' && <XCircle className="h-4 w-4 text-red-500 mr-2 shrink-0"/>}
                                        <span className={cn(tip.status === 'negative' ? "text-red-700 dark:text-red-400" : "text-muted-foreground")}>{tip.finding}</span>
                                    </div>
                                    {tip.suggestion && tip.status !== 'positive' && <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5 pl-6">Suggestion: {tip.suggestion}</p>}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                 )}

                {/* Formatting Details Section */}
                {results.detailedReport.formattingDetails.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/>Formatting</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {results.detailedReport.formattingDetails.map((item, idx) =>(
                                <div key={idx} className="py-2 border-b last:border-b-0">
                                     <div className="flex justify-between items-center">
                                        <h4 className="font-medium text-foreground">{item.aspect}</h4>
                                        <Tooltip><TooltipTrigger asChild><Info className="h-4 w-4 text-muted-foreground cursor-help"/></TooltipTrigger><TooltipContent><p>{item.feedback}</p></TooltipContent></Tooltip>
                                    </div>
                                    <div className="flex items-center text-sm mt-1">
                                        {item.status === 'positive' && <CheckCircle className="h-4 w-4 text-green-500 mr-2 shrink-0"/>}
                                        {item.status === 'neutral' && <Info className="h-4 w-4 text-blue-500 mr-2 shrink-0"/>}
                                        {item.status === 'negative' && <XCircle className="h-4 w-4 text-red-500 mr-2 shrink-0"/>}
                                        <span className={cn(item.status === 'negative' ? "text-red-700 dark:text-red-400" : "text-muted-foreground")}>{item.feedback}</span>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
                
                {/* Existing Accordions for Improvements and Skills - can be refactored or kept */}
                <Accordion type="single" collapsible className="w-full" defaultValue="item-improvements">
                  {results.improvements && results.improvements.improvedResumeSections.length > 0 && (
                    <AccordionItem value="item-improvements">
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
                  {results.skillSuggestions && results.skillSuggestions.suggestedSkills.length > 0 && (
                    <AccordionItem value="item-skill-suggestions">
                      <AccordionTrigger className="text-lg font-semibold hover:text-primary">Dynamic Skill Suggestions</AccordionTrigger>
                      <AccordionContent className="space-y-3 p-1">
                        <p className="text-sm text-muted-foreground">Based on the job description, consider adding these skills to your profile or resume:</p>
                        {results.skillSuggestions.suggestedSkills.map((skillRec: SuggestedSkillFromAI) => (
                          <Card key={skillRec.skill} className="bg-secondary/30 p-3">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h4 className="font-semibold text-foreground">{skillRec.skill}</h4>
                                <p className="text-xs text-muted-foreground">Relevance: <span className="text-primary font-bold">{skillRec.relevanceScore}%</span></p>
                              </div>
                              <Button size="sm" variant="outline" onClick={() => handleAddSkillToProfile(skillRec.skill)}>
                                 <PlusCircleIcon className="mr-1 h-4 w-4" /> Add to Profile
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 italic">Reasoning: {skillRec.reasoning}</p>
                          </Card>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>

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
                  { title: "Maximum Score", value: `${summaryStats.maxScore}%` },
                  { title: "High Scoring (>80%)", value: summaryStats.improvement }, 
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
                                <Button variant="outline" size="sm" onClick={() => handleDeleteScan(item.id)} className="mt-1">
                                  <Trash2 className="h-3 w-3"/>
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

