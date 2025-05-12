
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BotMessageSquare, Eye, PlusCircle, Edit3, AlertTriangle, UserCheck, ShieldAlert, ListFilter, BarChart3, CheckSquare, Users } from "lucide-react"; // Added BarChart3, CheckSquare, Users
import { useToast } from "@/hooks/use-toast";
import type { SurveyResponse } from "@/types";
import { sampleSurveyResponses, sampleUserProfile } from "@/lib/sample-data";
import { format } from "date-fns";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";

// Mock survey definitions for selection
const mockSurveyDefinitions = [
    { id: 'initialFeedbackSurvey', name: 'Initial User Feedback' },
    { id: 'profileCompletionSurvey', name: 'Profile Completion Nudge' },
    { id: 'featureUsageSurvey', name: 'New Feature Usage Feedback' },
];

export default function MessengerManagementPage() {
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>(sampleSurveyResponses);
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);
  const [isResponseDetailOpen, setIsResponseDetailOpen] = useState(false);
  const [isCreateSurveyOpen, setIsCreateSurveyOpen] = useState(false);
  const [activeSurveyId, setActiveSurveyId] = useState<string>(mockSurveyDefinitions[0].id);
  const [newSurveyName, setNewSurveyName] = useState('');
  const [newSurveyDescription, setNewSurveyDescription] = useState('');

  const { toast } = useToast();

  const currentUser = sampleUserProfile;
  if (currentUser.role !== 'admin') {
    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
            <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground">You do not have permission to view this page.</p>
            <Button asChild className="mt-6">
                <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
        </div>
    );
  }

  const handleViewDetails = (response: SurveyResponse) => {
    setSelectedResponse(response);
    setIsResponseDetailOpen(true);
  };

  const handleCreateNewSurvey = () => {
    if (!newSurveyName.trim()) {
        toast({ title: "Error", description: "Survey name cannot be empty.", variant: "destructive" });
        return;
    }
    // Mock creation
    mockSurveyDefinitions.push({ id: `survey-${Date.now()}`, name: newSurveyName });
    toast({ title: "Survey Created (Mock)", description: `Survey "${newSurveyName}" has been added.` });
    setNewSurveyName('');
    setNewSurveyDescription('');
    setIsCreateSurveyOpen(false);
  };
  
  const incompleteProfileUsers = useMemo(() => {
    return surveyResponses
        .filter(sr => sr.data.experience === 'needs_improvement') 
        .map(sr => ({ id: sr.userId, name: sr.userName, reason: "Indicated 'Needs Improvement' in feedback" }))
        .slice(0, 5); 
  }, [surveyResponses]);

  // Statistics Calculation
  const totalResponses = surveyResponses.length;
  const totalSurveysDeployed = mockSurveyDefinitions.length;
  const usersFlaggedForIncompleteProfile = incompleteProfileUsers.length;
  const positiveFeedbackCount = surveyResponses.filter(sr => sr.data.experience === 'amazing').length;


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <BotMessageSquare className="h-8 w-8" /> Messenger & Survey Management
      </h1>
      <CardDescription>Oversee automated messenger interactions, manage surveys, and analyze user feedback.</CardDescription>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalResponses}</div>
                <p className="text-xs text-muted-foreground">Across all surveys</p>
            </CardContent>
        </Card>
        <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Surveys Deployed</CardTitle>
                <ListFilter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalSurveysDeployed}</div>
                <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
        </Card>
         <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Positive Feedback</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{positiveFeedbackCount}</div>
                <p className="text-xs text-muted-foreground">Users reported 'amazing' experience</p>
            </CardContent>
        </Card>
        <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profile Nudges Sent</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{usersFlaggedForIncompleteProfile}</div>
                <p className="text-xs text-muted-foreground">Based on 'needs improvement' feedback</p>
            </CardContent>
        </Card>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Survey Configuration Card */}
        <Card className="shadow-lg lg:col-span-1">
          <CardHeader>
            <CardTitle>Survey Configuration</CardTitle>
            <CardDescription>Manage and deploy surveys via the floating messenger.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="active-survey">Active Survey</Label>
              <Select value={activeSurveyId} onValueChange={setActiveSurveyId}>
                <SelectTrigger id="active-survey">
                  <SelectValue placeholder="Select a survey to activate" />
                </SelectTrigger>
                <SelectContent>
                  {mockSurveyDefinitions.map(survey => (
                    <SelectItem key={survey.id} value={survey.id}>{survey.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">The selected survey will be presented by the floating messenger.</p>
            </div>
            <Dialog open={isCreateSurveyOpen} onOpenChange={setIsCreateSurveyOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" /> Create New Survey (Mock)
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Survey</DialogTitle>
                  <CardDescription>Define a new survey for the messenger. (Full step definition is mocked)</CardDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="new-survey-name">Survey Name</Label>
                    <Input id="new-survey-name" value={newSurveyName} onChange={(e) => setNewSurveyName(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="new-survey-desc">Survey Description (Optional)</Label>
                    <Textarea id="new-survey-desc" value={newSurveyDescription} onChange={(e) => setNewSurveyDescription(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                  <Button onClick={handleCreateNewSurvey}>Create Survey</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
        
        {/* Incomplete Profiles Card */}
        <Card className="shadow-lg lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ListFilter className="h-5 w-5"/>Potentially Incomplete Profiles (from Surveys)</CardTitle>
                <CardDescription>Users who might need to complete their profiles, based on survey feedback. (Conceptual)</CardDescription>
            </CardHeader>
            <CardContent>
                {incompleteProfileUsers.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No users flagged from surveys for incomplete profiles.</p>
                ) : (
                    <ul className="space-y-2">
                        {incompleteProfileUsers.map(user => (
                            <li key={user.id} className="flex justify-between items-center p-2 border rounded-md">
                                <div>
                                    <p className="font-medium">{user.name} <span className="text-xs text-muted-foreground">({user.id})</span></p>
                                    <p className="text-xs text-muted-foreground">Reason: {user.reason}</p>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/admin/user-management?userId=${user.id}`}>View User</Link>
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
      </div>

      {/* Survey Responses Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Survey Responses</CardTitle>
          <CardDescription>Collected feedback from users via the floating messenger.</CardDescription>
        </CardHeader>
        <CardContent>
          {surveyResponses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No survey responses yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Survey Name</TableHead>
                  <TableHead>Response Date</TableHead>
                  <TableHead>Key Feedback</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {surveyResponses.map((response) => (
                  <TableRow key={response.id}>
                    <TableCell className="font-medium">{response.userName} <span className="text-xs text-muted-foreground">({response.userId})</span></TableCell>
                    <TableCell>{response.surveyName}</TableCell>
                    <TableCell>{format(new Date(response.responseDate), 'PPp')}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {Object.entries(response.data)
                             .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`)
                             .slice(0,2) // Show first 2 key-value pairs
                             .join('; ') || 'N/A'}...
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(response)}>
                        <Eye className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">View Details</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Response Detail Dialog */}
      <Dialog open={isResponseDetailOpen} onOpenChange={setIsResponseDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Survey Response Details</DialogTitle>
            {selectedResponse && (
              <CardDescription>
                From: {selectedResponse.userName} ({selectedResponse.userId}) <br/>
                Survey: {selectedResponse.surveyName} <br/>
                Date: {format(new Date(selectedResponse.responseDate), 'PPp')}
              </CardDescription>
            )}
          </DialogHeader>
          {selectedResponse && (
            <div className="py-4 max-h-[60vh] overflow-y-auto">
              <pre className="bg-secondary p-3 rounded-md text-sm whitespace-pre-wrap">
                {JSON.stringify(selectedResponse.data, null, 2)}
              </pre>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResponseDetailOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
