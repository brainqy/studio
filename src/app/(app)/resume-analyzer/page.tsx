
"use client";

import React from 'react'; // Explicitly import React
import { useState, type FormEvent, useEffect, useMemo } from 'react';
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
} from "lucide-react"; // Consolidated imports
import { analyzeResumeAndJobDescription, type AnalyzeResumeAndJobDescriptionOutput } from '@/ai/flows/analyze-resume-and-job-description';
import { calculateMatchScore, type CalculateMatchScoreOutput } from '@/ai/flows/calculate-match-score'; // Kept for potential future use
import { suggestResumeImprovements, type SuggestResumeImprovementsOutput } from '@/ai/flows/suggest-resume-improvements'; // Kept for potential future use
import { suggestDynamicSkills, type SuggestDynamicSkillsInput, type SuggestDynamicSkillsOutput } from '@/ai/flows/suggest-dynamic-skills';
import { useToast } from '@/hooks/use-toast';
import { sampleResumeScanHistory as initialScanHistory, sampleResumeProfiles, sampleUserProfile } from '@/lib/sample-data';
import type { ResumeScanHistoryItem, ResumeProfile, AtsFormattingIssue } from '@/types'; // Added AtsFormattingIssue
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; 
import ScoreCircle from '@/components/ui/score-circle'; 

interface AnalysisResults {
  overallScoreData: CalculateMatchScoreOutput | null;
  detailedReport: AnalyzeResumeAndJobDescriptionOutput | null;
  improvementsData: SuggestResumeImprovementsOutput | null;
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
        currentResumeText = `Simulated content for ${resumeFile.name}. Actual text extraction would happen on a server. The resume mentions skills like React, Node.js, and project management. It highlights experience leading a team of 5 developers and increasing efficiency by 15%. Education includes a Master's degree in Computer Science.`;
        if(resumeFile.name.toLowerCase().includes("product")) {
            currentResumeText += " Experience in product strategy, user research, and agile methodologies. Launched 3 successful products."
        }
        setResumeText(currentResumeText);
      }
      
      const currentResumeProfile = selectedResumeId ? resumes.find(r => r.id === selectedResumeId) : null;

      const jdLines = jobDescription.split('\n');
      const jobTitleMatch = jdLines.find(line => line.toLowerCase().includes('title:'))?.split(/:(.*)/s)[1]?.trim() || "Job Title Placeholder";
      const companyMatch = jdLines.find(line => line.toLowerCase().includes('company:'))?.split(/:(.*)/s)[1]?.trim() || "Company Placeholder";

      const detailedReportRes = await analyzeResumeAndJobDescription({ resumeText: currentResumeText, jobDescriptionText: jobDescription });
      
      const overallScoreData : CalculateMatchScoreOutput = {
        matchScore: detailedReportRes.overallQualityScore ?? detailedReportRes.hardSkillsScore ?? 0,
        missingKeywords: detailedReportRes.missingSkills ?? [],
        relevantKeywords: detailedReportRes.matchingSkills ?? [],
      };

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
        matchScore: overallScoreData.matchScore, 
        bookmarked: false,
      };
      setScanHistory(prev => [newScanEntry, ...prev]);

      setResults({
        overallScoreData: overallScoreData,
        detailedReport: detailedReportRes,
        improvementsData: null,
        skillSuggestions: null,
      });
      toast({ title: "Analysis Complete", description: "Resume analysis results are ready." });
    } catch (error) {
      console.error("Analysis error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({ title: "Analysis Failed", description: `An error occurred during analysis: ${errorMessage}`, variant: "destructive", duration: 7000 });
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
  };
  
  const handleUploadAndRescan = () => {
    setResumeFile(null);
    setResumeText('');
    setSelectedResumeId(null);
    setResults(null); 
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
    setResumeFile(null); 
    setSelectedResumeId(null);
    
    toast({ title: "Loading Historical Scan...", description: "Re-generating analysis for the selected scan." });
    setIsLoading(true);
    try {
      const detailedReportRes = await analyzeResumeAndJobDescription({ resumeText: item.resumeTextSnapshot, jobDescriptionText: item.jobDescriptionText });
      const overallScoreData : CalculateMatchScoreOutput = {
        matchScore: detailedReportRes.overallQualityScore ?? detailedReportRes.hardSkillsScore ?? 0,
        missingKeywords: detailedReportRes.missingSkills ?? [],
        relevantKeywords: detailedReportRes.matchingSkills ?? [],
      };
      setResults({
        overallScoreData,
        detailedReport: detailedReportRes,
        improvementsData: null, 
        skillSuggestions: null, 
      });
      toast({ title: "Historical Report Loaded", description: "The analysis report for the selected scan has been re-generated." });
    } catch (error) {
      console.error("Historical analysis error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({ title: "Report Load Failed", description: `An error occurred while re-generating the historical report: ${errorMessage}`, variant: "destructive", duration: 7000 });
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
    const currentProfileSkills = sampleUserProfile.skills || [];
    if (!currentProfileSkills.includes(skill)) {
        sampleUserProfile.skills = [...currentProfileSkills, skill];
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
  
  const getIssuesCount = (score: number | undefined, totalChecks?: number, falseChecks?: number): string => {
    if (totalChecks !== undefined && falseChecks !== undefined) {
        return `${falseChecks} issue${falseChecks !== 1 ? 's' : ''}`;
    }
    if (score === undefined) return 'N/A';
    if (score >= 95) return '0 issues';
    if (score >= 80) return '1-2 issues';
    if (score >= 60) return '3-4 issues';
    if (score >= 40) return '5+ issues';
    return 'Many issues';
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
                  rows={resumes.length > 0 || resumeFile || resumeText ? 10 + 14 : 10} 
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
                        {(
                            [
                                {label: "Searchability", score: results.detailedReport.searchabilityScore, details: results.detailedReport.searchabilityDetails ? Object.values(results.detailedReport.searchabilityDetails).filter(v => v === false || (typeof v === 'string' && v.toLowerCase().includes('n/a'))).length : undefined},
                                {label: "Recruiter Tips", score: results.detailedReport.recruiterTipsScore, details: results.detailedReport.recruiterTips?.filter(tip => tip.status === 'negative').length},
                                {label: "Formatting", score: results.detailedReport.formattingScore, details: results.detailedReport.formattingDetails?.length},
                                {label: "Highlights", score: results.detailedReport.highlightsScore},
                                {label: "Hard Skills", score: results.detailedReport.hardSkillsScore, details: results.detailedReport.missingSkills?.length},
                                {label: "Soft Skills", score: results.detailedReport.softSkillsScore},
                                {label: "ATS Format Compliance", score: results.detailedReport.atsStandardFormattingComplianceScore, details: results.detailedReport.standardFormattingIssues?.length},
                            ] as {label: string; score?: number, details?: number}[]
                        ).map(cat => cat.score !== undefined && (
                            <div key={cat.label}>
                                <div className="flex justify-between text-sm mb-0.5">
                                    <span className="font-medium text-muted-foreground">{cat.label}</span>
                                    {cat.details !== undefined && <span className="text-xs text-red-500">{cat.details} issue{cat.details !== 1 ? 's' : ''}</span>}
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
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <Info className="h-5 w-5 text-blue-600 shrink-0"/>
                        <div>
                            <strong>Quick Guide:</strong>
                            <ol className="list-decimal list-inside text-xs">
                                <li>Review suggestions below.</li>
                                <li>Update your original resume document.</li>
                                <li>Use "Upload & Rescan" to see improvements!</li>
                            </ol>
                        </div>
                    </div>
                    
                    <Tabs defaultValue="searchability" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
                            <TabsTrigger value="searchability" className="text-xs sm:text-sm">Searchability</TabsTrigger>
                            <TabsTrigger value="recruiter" className="text-xs sm:text-sm">Recruiter Tips</TabsTrigger>
                            <TabsTrigger value="content_style" className="text-xs sm:text-sm">Content/Style</TabsTrigger>
                            <TabsTrigger value="ats" className="text-xs sm:text-sm">ATS & Formatting</TabsTrigger>
                        </TabsList>

                        <TabsContent value="searchability" className="mt-4">
                            <Card className="border-border shadow-sm">
                                <CardHeader className="p-3 bg-secondary/20 rounded-t-md">
                                    <CardTitle className="text-md font-semibold flex items-center gap-2">
                                        <Search className="h-5 w-5 text-primary"/>Searchability Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 space-y-2">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-medium text-foreground mb-1 flex items-center gap-1.5">
                                            <Info className="h-3.5 w-3.5 text-muted-foreground"/> Contact Info:
                                        </h4>
                                        <ul className="space-y-0.5 text-xs pl-2">
                                            <li className="flex items-center gap-1.5">{(results.detailedReport.searchabilityDetails?.hasEmail ?? false) ? <CheckCircle className="h-3.5 w-3.5 text-green-500"/> : <XCircle className="h-3.5 w-3.5 text-red-500"/>} Email found</li>
                                            <li className="flex items-center gap-1.5">{(results.detailedReport.searchabilityDetails?.hasPhoneNumber ?? false) ? <CheckCircle className="h-3.5 w-3.5 text-green-500"/> : <XCircle className="h-3.5 w-3.5 text-red-500"/>} Phone number found</li>
                                            <li className="flex items-center gap-1.5">{(results.detailedReport.searchabilityDetails?.hasAddress ?? false) ? <CheckCircle className="h-3.5 w-3.5 text-green-500"/> : <XCircle className="h-3.5 w-3.5 text-red-500"/>} Address found (optional but can be useful)</li>
                                        </ul>
                                    </div>
                                    <hr className="my-2"/>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-medium text-foreground mb-1 flex items-center gap-1.5">
                                            <Info className="h-3.5 w-3.5 text-muted-foreground"/> Job Title Match:
                                        </h4>
                                        <p className={cn("text-xs flex items-center gap-1.5 pl-2", (results.detailedReport.searchabilityDetails?.jobTitleMatchesJD ?? false) ? "text-green-600" : "text-red-600")}>
                                            {(results.detailedReport.searchabilityDetails?.jobTitleMatchesJD ?? false) ? <CheckCircle className="h-3.5 w-3.5"/> : <XCircle className="h-3.5 w-3.5"/>} 
                                            The job title on your resume {(results.detailedReport.searchabilityDetails?.jobTitleMatchesJD ?? false) ? "matches or aligns with" : "does not match well with"} the one in the job description.
                                        </p>
                                    </div>
                                     <hr className="my-2"/>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-medium text-foreground mb-1 flex items-center gap-1.5">
                                            <Info className="h-3.5 w-3.5 text-muted-foreground"/> Section Headings:
                                        </h4>
                                        <ul className="space-y-0.5 text-xs pl-2">
                                            <li className="flex items-center gap-1.5">{(results.detailedReport.searchabilityDetails?.hasProfessionalSummary ?? false) ? <CheckCircle className="h-3.5 w-3.5 text-green-500"/> : <XCircle className="h-3.5 w-3.5 text-red-500"/>} Professional Summary / Objective</li>
                                            <li className="flex items-center gap-1.5">{(results.detailedReport.searchabilityDetails?.hasWorkExperienceSection ?? false) ? <CheckCircle className="h-3.5 w-3.5 text-green-500"/> : <XCircle className="h-3.5 w-3.5 text-red-500"/>} Work Experience Section</li>
                                            <li className="flex items-center gap-1.5">{(results.detailedReport.searchabilityDetails?.hasEducationSection ?? false) ? <CheckCircle className="h-3.5 w-3.5 text-green-500"/> : <XCircle className="h-3.5 w-3.5 text-red-500"/>} Education Section</li>
                                        </ul>
                                    </div>
                                    {results.detailedReport.searchabilityDetails?.keywordDensityFeedback && <p className="text-xs italic text-muted-foreground p-2 bg-background rounded-md mt-2">Keyword Feedback: {results.detailedReport.searchabilityDetails.keywordDensityFeedback}</p>}
                                </CardContent>
                            </Card>
                        </TabsContent>
                        
                        <TabsContent value="recruiter" className="mt-4">
                             {results.detailedReport.recruiterTips && results.detailedReport.recruiterTips.length > 0 && (
                                <Card className="border-border shadow-sm">
                                    <CardHeader className="p-3 bg-secondary/20 rounded-t-md">
                                        <CardTitle className="text-md font-semibold flex items-center gap-2">
                                            <Users className="h-5 w-5 text-primary"/>Recruiter Tips
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

                        <TabsContent value="content_style" className="mt-4">
                             <Accordion type="multiple" className="w-full">
                                {results.detailedReport.quantifiableAchievementDetails && (
                                <AccordionItem value="item-quantifiable">
                                    <AccordionTrigger className="text-md font-semibold hover:text-primary data-[state=open]:text-primary"><BarChart className="mr-2 h-5 w-5"/>Quantifiable Achievements</AccordionTrigger>
                                    <AccordionContent className="space-y-2 p-1">
                                        <Card>
                                            <CardHeader className="p-3"><CardTitle className="text-sm font-medium flex items-center gap-1">Score: {results.detailedReport.quantifiableAchievementDetails.score}%</CardTitle></CardHeader>
                                            <CardContent className="p-3 pt-0 text-xs space-y-1">
                                                {results.detailedReport.quantifiableAchievementDetails.examplesFound && results.detailedReport.quantifiableAchievementDetails.examplesFound.length > 0 && <p><strong>Strong Examples:</strong> {results.detailedReport.quantifiableAchievementDetails.examplesFound.join('; ')}</p>}
                                                {results.detailedReport.quantifiableAchievementDetails.areasLackingQuantification && results.detailedReport.quantifiableAchievementDetails.areasLackingQuantification.length > 0 && <p><strong>Needs Quantification:</strong> {results.detailedReport.quantifiableAchievementDetails.areasLackingQuantification.join('; ')}</p>}
                                            </CardContent>
                                        </Card>
                                    </AccordionContent>
                                </AccordionItem>
                                )}
                                {results.detailedReport.actionVerbDetails && (
                                <AccordionItem value="item-action-verbs">
                                    <AccordionTrigger className="text-md font-semibold hover:text-primary data-[state=open]:text-primary"><ThumbsUp className="mr-2 h-5 w-5"/>Action Verbs</AccordionTrigger>
                                    <AccordionContent className="space-y-2 p-1">
                                        <Card>
                                            <CardHeader className="p-3"><CardTitle className="text-sm font-medium flex items-center gap-1">Score: {results.detailedReport.actionVerbDetails.score}%</CardTitle></CardHeader>
                                            <CardContent className="p-3 pt-0 text-xs space-y-1">
                                                {results.detailedReport.actionVerbDetails.strongVerbsUsed && results.detailedReport.actionVerbDetails.strongVerbsUsed.length > 0 && <p><strong>Strong Verbs:</strong> {results.detailedReport.actionVerbDetails.strongVerbsUsed.join(', ')}</p>}
                                                {results.detailedReport.actionVerbDetails.weakVerbsUsed && results.detailedReport.actionVerbDetails.weakVerbsUsed.length > 0 && <p><strong>Weak Verbs:</strong> {results.detailedReport.actionVerbDetails.weakVerbsUsed.join(', ')}</p>}
                                                {results.detailedReport.actionVerbDetails.overusedVerbs && results.detailedReport.actionVerbDetails.overusedVerbs.length > 0 && <p><strong>Overused:</strong> {results.detailedReport.actionVerbDetails.overusedVerbs.join(', ')}</p>}
                                                {results.detailedReport.actionVerbDetails.suggestedStrongerVerbs && results.detailedReport.actionVerbDetails.suggestedStrongerVerbs.length > 0 && <p><strong>Suggestions:</strong> {results.detailedReport.actionVerbDetails.suggestedStrongerVerbs.map(s => `${s.original} → ${s.suggestion}`).join('; ')}</p>}
                                            </CardContent>
                                        </Card>
                                    </AccordionContent>
                                </AccordionItem>
                                )}
                                {results.detailedReport.impactStatementDetails && (
                                <AccordionItem value="item-impact">
                                    <AccordionTrigger className="text-md font-semibold hover:text-primary data-[state=open]:text-primary"><Zap className="mr-2 h-5 w-5"/>Impact Statements</AccordionTrigger>
                                    <AccordionContent className="space-y-2 p-1">
                                        <Card>
                                            <CardHeader className="p-3"><CardTitle className="text-sm font-medium flex items-center gap-1">Clarity Score: {results.detailedReport.impactStatementDetails.clarityScore}%</CardTitle></CardHeader>
                                            <CardContent className="p-3 pt-0 text-xs space-y-1">
                                                {results.detailedReport.impactStatementDetails.exampleWellWrittenImpactStatements && results.detailedReport.impactStatementDetails.exampleWellWrittenImpactStatements.length > 0 && <p><strong>Good Examples:</strong> {results.detailedReport.impactStatementDetails.exampleWellWrittenImpactStatements.join('; ')}</p>}
                                                {results.detailedReport.impactStatementDetails.unclearImpactStatements && results.detailedReport.impactStatementDetails.unclearImpactStatements.length > 0 && <p><strong>Could Improve:</strong> {results.detailedReport.impactStatementDetails.unclearImpactStatements.join('; ')}</p>}
                                            </CardContent>
                                        </Card>
                                    </AccordionContent>
                                </AccordionItem>
                                )}
                                {results.detailedReport.readabilityDetails && (
                                <AccordionItem value="item-readability">
                                    <AccordionTrigger className="text-md font-semibold hover:text-primary data-[state=open]:text-primary"><MessageSquare className="mr-2 h-5 w-5"/>Readability</AccordionTrigger>
                                    <AccordionContent className="space-y-2 p-1">
                                        <Card>
                                            <CardContent className="p-3 text-xs space-y-1">
                                                {results.detailedReport.readabilityDetails.fleschReadingEase && <p><strong>Flesch Reading Ease:</strong> {results.detailedReport.readabilityDetails.fleschReadingEase.toFixed(1)}</p>}
                                                {results.detailedReport.readabilityDetails.fleschKincaidGradeLevel && <p><strong>Flesch-Kincaid Grade Level:</strong> {results.detailedReport.readabilityDetails.fleschKincaidGradeLevel.toFixed(1)}</p>}
                                                {results.detailedReport.readabilityDetails.readabilityFeedback && <p><strong>Feedback:</strong> {results.detailedReport.readabilityDetails.readabilityFeedback}</p>}
                                            </CardContent>
                                        </Card>
                                    </AccordionContent>
                                </AccordionItem>
                                )}
                            </Accordion>
                        </TabsContent>

                        <TabsContent value="ats" className="mt-4">
                            <Accordion type="multiple" className="w-full">
                                {results.detailedReport.atsParsingConfidence && (
                                    <AccordionItem value="item-ats-confidence">
                                    <AccordionTrigger className="text-md font-semibold hover:text-primary data-[state=open]:text-primary"><SearchCheck className="mr-2 h-5 w-5"/>ATS Parsing Confidence</AccordionTrigger>
                                    <AccordionContent className="space-y-2 p-1">
                                        <Card>
                                            <CardHeader className="p-3"><CardTitle className="text-sm font-medium flex items-center gap-1">Overall: {results.detailedReport.atsParsingConfidence.overall}%</CardTitle></CardHeader>
                                             {results.detailedReport.atsParsingConfidence.warnings && results.detailedReport.atsParsingConfidence.warnings.length > 0 && (
                                                <CardContent className="p-3 pt-0 text-xs space-y-1">
                                                   <p><strong>Warnings:</strong> {results.detailedReport.atsParsingConfidence.warnings.join('; ')}</p>
                                                </CardContent>
                                            )}
                                        </Card>
                                    </AccordionContent>
                                    </AccordionItem>
                                )}
                                {results.detailedReport.standardFormattingIssues && results.detailedReport.standardFormattingIssues.length > 0 && (
                                    <AccordionItem value="item-standard-formatting">
                                    <AccordionTrigger className="text-md font-semibold hover:text-primary data-[state=open]:text-primary"><Columns className="mr-2 h-5 w-5"/>Standard Formatting ({results.detailedReport.atsStandardFormattingComplianceScore}%)</AccordionTrigger>
                                    <AccordionContent className="space-y-2 p-1">
                                        <Card>
                                            <CardContent className="p-3 text-xs space-y-1">
                                                {results.detailedReport.standardFormattingIssues.map((item, idx) => (
                                                    <p key={idx}><strong>Issue:</strong> {item.issue} → <strong>Recommendation:</strong> {item.recommendation}</p>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    </AccordionContent>
                                    </AccordionItem>
                                )}
                                {results.detailedReport.formattingDetails && results.detailedReport.formattingDetails.length > 0 && (
                                    <AccordionItem value="item-general-formatting">
                                        <AccordionTrigger className="text-md font-semibold hover:text-primary data-[state=open]:text-primary"><Palette className="mr-2 h-5 w-5"/>General Formatting</AccordionTrigger>
                                        <AccordionContent className="space-y-2 p-1">
                                        <Card>
                                            <CardContent className="p-3 text-xs space-y-1">
                                                {results.detailedReport.formattingDetails.map((item, idx) => (
                                                    <p key={idx}><strong>Issue:</strong> {item.issue} → <strong>Recommendation:</strong> {item.recommendation}</p>
                                                ))}
                                            </CardContent>
                                        </Card>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}
                                {results.detailedReport.undefinedAcronyms && results.detailedReport.undefinedAcronyms.length > 0 && (
                                <AccordionItem value="item-acronyms">
                                    <AccordionTrigger className="text-md font-semibold hover:text-primary data-[state=open]:text-primary"><EyeOff className="mr-2 h-5 w-5"/>Undefined Acronyms</AccordionTrigger>
                                    <AccordionContent className="space-y-2 p-1">
                                        <Card>
                                            <CardContent className="p-3 text-xs">
                                                <p>{results.detailedReport.undefinedAcronyms.join(', ')}</p>
                                            </CardContent>
                                        </Card>
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
