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
    ChevronsUpDown, ListChecks, History, Star, Trash2, Bookmark, PlusCircle, HelpCircle, XCircle, Info, Zap, MessageSquare, ThumbsUp, Users, FileText, FileCheck2, EyeSlash, Columns, Palette, CalendarDays
} from "lucide-react"; // Consolidated imports
import { analyzeResumeAndJobDescription, type AnalyzeResumeAndJobDescriptionOutput } from '@/ai/flows/analyze-resume-and-job-description';
import { calculateMatchScore, type CalculateMatchScoreOutput } from '@/ai/flows/calculate-match-score'; // Kept for potential future use
import { suggestResumeImprovements, type SuggestResumeImprovementsOutput } from '@/ai/flows/suggest-resume-improvements'; // Kept for potential future use
import { suggestDynamicSkills, type SuggestDynamicSkillsInput, type SuggestDynamicSkillsOutput } from '@/ai/flows/suggest-dynamic-skills';
import { useToast } from '@/hooks/use-toast';
import { sampleResumeScanHistory as initialScanHistory, sampleResumeProfiles, sampleUserProfile } from '@/lib/sample-data';
import type { ResumeScanHistoryItem, ResumeProfile } from '@/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; 
import ScoreCircle from '@/components/ui/score-circle'; 

interface AnalysisResults {
  overallScoreData: CalculateMatchScoreOutput | null; // Retain for overall match score display
  detailedReport: AnalyzeResumeAndJobDescriptionOutput | null;
  improvementsData: SuggestResumeImprovementsOutput | null; // Retain for potential improvements section
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
        // Simulate text extraction for non-txt files for demo purposes
        // In a real app, this would involve server-side processing for PDF/DOCX
        currentResumeText = `Simulated content for ${resumeFile.name}. Actual text extraction would happen on a server. The resume mentions skills like React, Node.js, and project management. It highlights experience leading a team of 5 developers and increasing efficiency by 15%. Education includes a Master's degree in Computer Science.`;
        if(resumeFile.name.toLowerCase().includes("product")) {
            currentResumeText += " Experience in product strategy, user research, and agile methodologies. Launched 3 successful products."
        }
        setResumeText(currentResumeText); // Update state so it's used
      }
      
      const currentResumeProfile = selectedResumeId ? resumes.find(r => r.id === selectedResumeId) : null;

      const jdLines = jobDescription.split('\n');
      const jobTitleMatch = jdLines.find(line => line.toLowerCase().includes('title:'))?.split(/:(.*)/s)[1]?.trim() || "Job Title Placeholder";
      const companyMatch = jdLines.find(line => line.toLowerCase().includes('company:'))?.split(/:(.*)/s)[1]?.trim() || "Company Placeholder";

      // Only call the main detailed analysis flow
      const detailedReportRes = await analyzeResumeAndJobDescription({ resumeText: currentResumeText, jobDescriptionText: jobDescription });
      
      // For the overallScoreData, we can derive a primary score from the detailedReport
      // For example, using overallQualityScore or hardSkillsScore as the main "match score"
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
        matchScore: overallScoreData.matchScore, // Use derived score
        bookmarked: false,
      };
      setScanHistory(prev => [newScanEntry, ...prev]);

      setResults({
        overallScoreData: overallScoreData,
        detailedReport: detailedReportRes,
        improvementsData: null, // We'll add improvements back later if needed
        skillSuggestions: null, // We'll add skill suggestions back later if needed
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
                  placeholder="Paste the job description here... For better results, include 'Title: &lt;Job Title&gt;' and 'Company: &lt;Company Name&gt;' on separate lines if possible."
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
            <div className="md:col-span-1 space-y-6 p-4 border-r border-border">
                <ScoreCircle score={results.overallScoreData?.matchScore ?? results.detailedReport.overallQualityScore ?? results.detailedReport.hardSkillsScore ?? 0} size="xl" label="Match Rate" />
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
                            {label: "ATS Format Compliance", score: results.detailedReport.atsStandardFormattingComplianceScore},
                        ] as {label: string; score?: number}[]
                    ).map(cat => cat.score !== undefined && (
                        <div key={cat.label}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-muted-foreground">{cat.label}</span>
                                <span className="font-semibold text-primary">{cat.score}%</span>
                            </div>
                            <Progress value={cat.score} className="h-2 [&gt;div]:bg-primary" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="md:col-span-2 space-y-6 p-4">
                <Alert>
                    <Zap className="h-4 w-4" />
                    <AlertTitle>Overall Feedback</AlertTitle>
                    <AlertDescription>{results.detailedReport.overallFeedback || "No overall feedback provided."}</AlertDescription>
                </Alert>

                <Accordion type="multiple" defaultValue={['item-searchability', 'item-content-style', 'item-ats']} className="w-full">
                    {/* Searchability Section */}
                    <AccordionItem value="item-searchability">
                        <AccordionTrigger className="text-lg font-semibold hover:text-primary data-[state=open]:text-primary"><Search className="mr-2 h-5 w-5"/>Searchability</AccordionTrigger>
                        <AccordionContent className="space-y-3 p-1">
                             {results.detailedReport.searchabilityDetails?.keywordDensityFeedback && <p className="text-sm italic text-muted-foreground p-2 bg-secondary/30 rounded-md">Keyword Feedback: {results.detailedReport.searchabilityDetails.keywordDensityFeedback}</p>}
                            {[
                                { label: "Contact Info", details: [
                                    { item: "Email Present", checked: results.detailedReport.searchabilityDetails?.hasEmail },
                                    { item: "Phone Number Present", checked: results.detailedReport.searchabilityDetails?.hasPhoneNumber },
                                ]},
                                { label: "Key Sections", details: [
                                    { item: "Professional Summary Found", checked: results.detailedReport.searchabilityDetails?.hasProfessionalSummary },
                                    { item: "Work Experience Section Found", checked: results.detailedReport.searchabilityDetails?.hasWorkExperienceSection },
                                    { item: "Education Section Found", checked: results.detailedReport.searchabilityDetails?.hasEducationSection },
                                ]},
                                { label: "Role Alignment", details: [
                                    { item: "Job title in resume aligns with JD", checked: results.detailedReport.searchabilityDetails?.jobTitleMatchesJD }
                                ]},
                            ].map(section => (
                                <Card key={section.label} className="pt-2">
                                    <CardHeader className="p-3"><CardTitle className="text-sm font-medium">{section.label}</CardTitle></CardHeader>
                                    <CardContent className="p-3 pt-0 space-y-1">
                                    {section.details.map(detail => (
                                        <div key={detail.item} className="flex items-center text-sm">
                                            {detail.checked ? <CheckCircle className="h-4 w-4 text-green-500 mr-2 shrink-0"/> : <XCircle className="h-4 w-4 text-red-500 mr-2 shrink-0"/>}
                                            <span className={cn(detail.checked === false ? "text-red-700 dark:text-red-400" : "text-muted-foreground")}>{detail.item}</span>
                                        </div>
                                    ))}
                                    </CardContent>
                                </Card>
                            ))}
                        </AccordionContent>
                    </AccordionItem>

                    {/* Content & Style Insights Section */}
                    <AccordionItem value="item-content-style">
                        <AccordionTrigger className="text-lg font-semibold hover:text-primary data-[state=open]:text-primary"><Palette className="mr-2 h-5 w-5"/>Content &amp; Style Insights</AccordionTrigger>
                        <AccordionContent className="space-y-3 p-1">
                            {results.detailedReport.quantifiableAchievementDetails && (
                                <Card>
                                    <CardHeader className="p-3"><CardTitle className="text-sm font-medium flex items-center gap-1"><BarChart className="h-4 w-4"/>Quantifiable Achievements ({results.detailedReport.quantifiableAchievementDetails.score}%)</CardTitle></CardHeader>
                                    <CardContent className="p-3 pt-0 text-xs space-y-1">
                                        {results.detailedReport.quantifiableAchievementDetails.examplesFound && results.detailedReport.quantifiableAchievementDetails.examplesFound.length > 0 && <p><strong>Strong Examples:</strong> {results.detailedReport.quantifiableAchievementDetails.examplesFound.join('; ')}</p>}
                                        {results.detailedReport.quantifiableAchievementDetails.areasLackingQuantification && results.detailedReport.quantifiableAchievementDetails.areasLackingQuantification.length > 0 && <p><strong>Needs Quantification:</strong> {results.detailedReport.quantifiableAchievementDetails.areasLackingQuantification.join('; ')}</p>}
                                    </CardContent>
                                </Card>
                            )}
                             {results.detailedReport.actionVerbDetails && (
                                <Card>
                                    <CardHeader className="p-3"><CardTitle className="text-sm font-medium flex items-center gap-1"><ThumbsUp className="h-4 w-4"/>Action Verbs ({results.detailedReport.actionVerbDetails.score}%)</CardTitle></CardHeader>
                                    <CardContent className="p-3 pt-0 text-xs space-y-1">
                                        {results.detailedReport.actionVerbDetails.strongVerbsUsed && results.detailedReport.actionVerbDetails.strongVerbsUsed.length > 0 && <p><strong>Strong Verbs:</strong> {results.detailedReport.actionVerbDetails.strongVerbsUsed.join(', ')}</p>}
                                        {results.detailedReport.actionVerbDetails.weakVerbsUsed && results.detailedReport.actionVerbDetails.weakVerbsUsed.length > 0 && <p><strong>Weak Verbs:</strong> {results.detailedReport.actionVerbDetails.weakVerbsUsed.join(', ')}</p>}
                                        {results.detailedReport.actionVerbDetails.overusedVerbs && results.detailedReport.actionVerbDetails.overusedVerbs.length > 0 && <p><strong>Overused:</strong> {results.detailedReport.actionVerbDetails.overusedVerbs.join(', ')}</p>}
                                        {results.detailedReport.actionVerbDetails.suggestedStrongerVerbs && results.detailedReport.actionVerbDetails.suggestedStrongerVerbs.length > 0 && <p><strong>Suggestions:</strong> {results.detailedReport.actionVerbDetails.suggestedStrongerVerbs.map(s => `${s.original} → ${s.suggestion}`).join('; ')}</p>}
                                    </CardContent>
                                </Card>
                            )}
                             {results.detailedReport.impactStatementDetails && (
                                <Card>
                                    <CardHeader className="p-3"><CardTitle className="text-sm font-medium flex items-center gap-1"><Zap className="h-4 w-4"/>Impact Statements ({results.detailedReport.impactStatementDetails.clarityScore}%)</CardTitle></CardHeader>
                                    <CardContent className="p-3 pt-0 text-xs space-y-1">
                                        {results.detailedReport.impactStatementDetails.exampleWellWrittenImpactStatements && results.detailedReport.impactStatementDetails.exampleWellWrittenImpactStatements.length > 0 && <p><strong>Good Examples:</strong> {results.detailedReport.impactStatementDetails.exampleWellWrittenImpactStatements.join('; ')}</p>}
                                        {results.detailedReport.impactStatementDetails.unclearImpactStatements && results.detailedReport.impactStatementDetails.unclearImpactStatements.length > 0 && <p><strong>Could Improve:</strong> {results.detailedReport.impactStatementDetails.unclearImpactStatements.join('; ')}</p>}
                                    </CardContent>
                                </Card>
                            )}
                             {results.detailedReport.readabilityDetails && (
                                <Card>
                                    <CardHeader className="p-3"><CardTitle className="text-sm font-medium flex items-center gap-1"><MessageSquare className="h-4 w-4"/>Readability</CardTitle></CardHeader>
                                    <CardContent className="p-3 pt-0 text-xs space-y-1">
                                        {results.detailedReport.readabilityDetails.fleschReadingEase && <p><strong>Flesch Reading Ease:</strong> {results.detailedReport.readabilityDetails.fleschReadingEase.toFixed(1)}</p>}
                                        {results.detailedReport.readabilityDetails.fleschKincaidGradeLevel && <p><strong>Flesch-Kincaid Grade Level:</strong> {results.detailedReport.readabilityDetails.fleschKincaidGradeLevel.toFixed(1)}</p>}
                                        {results.detailedReport.readabilityDetails.readabilityFeedback && <p><strong>Feedback:</strong> {results.detailedReport.readabilityDetails.readabilityFeedback}</p>}
                                    </CardContent>
                                </Card>
                            )}
                        </AccordionContent>
                    </AccordionItem>

                    {/* ATS Friendliness Section */}
                    <AccordionItem value="item-ats">
                        <AccordionTrigger className="text-lg font-semibold hover:text-primary data-[state=open]:text-primary"><FileText className="mr-2 h-5 w-5"/>ATS Friendliness</AccordionTrigger>
                        <AccordionContent className="space-y-3 p-1">
                            {results.detailedReport.atsParsingConfidence && (
                                <Card>
                                    <CardHeader className="p-3"><CardTitle className="text-sm font-medium flex items-center gap-1"><SearchCheck className="h-4 w-4"/>ATS Parsing Confidence ({results.detailedReport.atsParsingConfidence.overall}%)</CardTitle></CardHeader>
                                    <CardContent className="p-3 pt-0 text-xs space-y-1">
                                        {results.detailedReport.atsParsingConfidence.sections && Object.keys(results.detailedReport.atsParsingConfidence.sections).length > 0 && (
                                          <p><strong>Section Scores:</strong> {Object.entries(results.detailedReport.atsParsingConfidence.sections).map(([key, val]) => `${key}: ${val}%`).join(', ')}</p>
                                        )}
                                        {results.detailedReport.atsParsingConfidence.warnings && results.detailedReport.atsParsingConfidence.warnings.length > 0 && <p><strong>Warnings:</strong> {results.detailedReport.atsParsingConfidence.warnings.join('; ')}</p>}
                                    </CardContent>
                                </Card>
                            )}
                             {results.detailedReport.standardFormattingIssues && (
                                <Card>
                                    <CardHeader className="p-3"><CardTitle className="text-sm font-medium flex items-center gap-1"><Columns className="h-4 w-4"/>Standard Formatting ({results.detailedReport.atsStandardFormattingComplianceScore}%)</CardTitle></CardHeader>
                                    <CardContent className="p-3 pt-0 text-xs space-y-1">
                                        {results.detailedReport.standardFormattingIssues.map((item, idx) => (
                                            <p key={idx}><strong>Issue:</strong> {item.issue} → <strong>Recommendation:</strong> {item.recommendation}</p>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}
                            {results.detailedReport.undefinedAcronyms && results.detailedReport.undefinedAcronyms.length > 0 && (
                               <Card>
                                    <CardHeader className="p-3"><CardTitle className="text-sm font-medium flex items-center gap-1"><EyeSlash className="h-4 w-4"/>Undefined Acronyms</CardTitle></CardHeader>
                                    <CardContent className="p-3 pt-0 text-xs">
                                        <p>{results.detailedReport.undefinedAcronyms.join(', ')}</p>
                                    </CardContent>
                                </Card>
                            )}
                        </AccordionContent>
                    </AccordionItem>

                     {/* Recruiter Tips Section */}
                    <AccordionItem value="item-recruiter-tips">
                        <AccordionTrigger className="text-lg font-semibold hover:text-primary data-[state=open]:text-primary"><Users className="mr-2 h-5 w-5"/>Recruiter Feedback</AccordionTrigger>
                        <AccordionContent className="space-y-2 p-1">
                            {results.detailedReport.recruiterTips.map((tip, idx) => (
                                <Card key={idx} className={cn("p-3", tip.status === 'negative' ? 'border-red-500' : tip.status === 'neutral' ? 'border-yellow-500' : 'border-green-500')}>
                                     <h4 className="font-medium text-sm text-foreground">{tip.category}</h4>
                                     <div className="flex items-center text-xs mt-0.5">
                                        {tip.status === 'positive' && <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1.5 shrink-0"/>}
                                        {tip.status === 'neutral' && <Info className="h-3.5 w-3.5 text-blue-500 mr-1.5 shrink-0"/>}
                                        {tip.status === 'negative' && <XCircle className="h-3.5 w-3.5 text-red-500 mr-1.5 shrink-0"/>}
                                        <span className={cn(tip.status === 'negative' ? "text-red-700 dark:text-red-400" : "text-muted-foreground")}>{tip.finding}</span>
                                    </div>
                                    {tip.suggestion && tip.status !== 'positive' && <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5 pl-5">Suggestion: {tip.suggestion}</p>}
                                </Card>
                            ))}
                        </AccordionContent>
                    </AccordionItem>

                </Accordion>
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
                  { title: "High Scoring (&gt;80%)", value: summaryStats.improvement }, 
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