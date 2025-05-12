

"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BotMessageSquare, Eye, PlusCircle, Edit3, AlertTriangle, UserCheck, ShieldAlert, ListFilter, BarChart3, CheckSquare, Users, Info, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SurveyResponse, SurveyStep } from "@/types";
import { sampleSurveyResponses, sampleUserProfile, profileCompletionSurveyDefinition } from "@/lib/sample-data";
import { format } from "date-fns";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SurveyDefinitionListItem {
  id: string;
  name: string;
  description?: string;
  steps?: SurveyStep[]; // For storing created survey steps
}

// Mock survey definitions for selection
const initialSurveyDefinitions: SurveyDefinitionListItem[] = [
    { id: 'initialFeedbackSurvey', name: 'Initial User Feedback', description: 'Gather first impressions from users.', steps: [] /* Loaded by FloatingMessenger from its own const */ },
    { id: 'profileCompletionSurvey', name: 'Profile Completion Survey', description: 'Guide users to complete their profile.', steps: profileCompletionSurveyDefinition },
];

export default function MessengerManagementPage() {
  const [surveyDefinitionsState, setSurveyDefinitionsState] = useState<SurveyDefinitionListItem[]>(initialSurveyDefinitions);
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>(sampleSurveyResponses);
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);
  const [isResponseDetailOpen, setIsResponseDetailOpen] = useState(false);
  const [isCreateSurveyOpen, setIsCreateSurveyOpen] = useState(false);
  const [activeSurveyId, setActiveSurveyId] = useState<string>(initialSurveyDefinitions[0].id);
  
  // State for new survey dialog
  const [newSurveyName, setNewSurveyName] = useState('');
  const [newSurveyDescription, setNewSurveyDescription] = useState('');
  const [newSurveySteps, setNewSurveySteps] = useState<SurveyStep[]>([]); // For building steps in dialog

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
  
  // Dispatch event when activeSurveyId changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('changeActiveSurvey', { detail: activeSurveyId }));
    }
  }, [activeSurveyId]);


  const handleViewDetails = (response: SurveyResponse) => {
    setSelectedResponse(response);
    setIsResponseDetailOpen(true);
  };

  const handleCreateNewSurvey = () => {
    if (!newSurveyName.trim()) {
        toast({ title: "Error", description: "Survey name cannot be empty.", variant: "destructive" });
        return;
    }
    const newSurvey: SurveyDefinitionListItem = { 
      id: `survey-${Date.now()}`, 
      name: newSurveyName, 
      description: newSurveyDescription, 
      steps: newSurveySteps // For now, steps are built in a conceptual way in dialog
    };
    
    setSurveyDefinitionsState(prev => [...prev, newSurvey]);
    toast({ title: "Survey Created (Conceptual)", description: `Survey "${newSurveyName}" has been added to the list. Full step definition and live deployment requires further development.` });
    
    setNewSurveyName('');
    setNewSurveyDescription('');
    setNewSurveySteps([]);
    setIsCreateSurveyOpen(false);
  };
  
  const incompleteProfileUsers = useMemo(() => {
    return surveyResponses
        .filter(sr => sr.surveyId === 'initialFeedbackSurvey' && sr.data.experience === 'needs_improvement') 
        .map(sr => ({ id: sr.userId, name: sr.userName, reason: "Indicated 'Needs Improvement' in feedback" }))
        .slice(0, 5); 
  }, [surveyResponses]);

  const totalResponses = surveyResponses.length;
  const totalSurveysDeployed = surveyDefinitionsState.length;
  const usersFlaggedForIncompleteProfile = incompleteProfileUsers.length;
  const positiveFeedbackCount = surveyResponses.filter(sr => sr.surveyId === 'initialFeedbackSurvey' && sr.data.experience === 'amazing').length;


  // Conceptual: Functions to manage steps within the "Create New Survey" dialog
  const addStepToNewSurvey = (type: SurveyStep['type']) => {
    const newStep: SurveyStep = {
      id: `step-${newSurveySteps.length + 1}`,
      type: type,
      text: type === 'botMessage' ? 'New Bot Message' : 'New Question',
      variableName: `var${newSurveySteps.length + 1}`,
      nextStepId: `step-${newSurveySteps.length + 2}`, // conceptual next
    };
    if (type === 'userOptions') newStep.options = [{ text: 'Option 1', value: 'opt1' }];
    if (type === 'userDropdown') newStep.dropdownOptions = [{ label: 'Option 1', value: 'opt1' }];
    setNewSurveySteps(prev => [...prev, newStep]);
  };
  // Further functions to edit/remove steps in dialog would be needed for full UI

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <BotMessageSquare className="h-8 w-8" /> Messenger & Survey Management
      </h1>
      <CardDescription>Oversee automated messenger interactions, manage surveys, and analyze user feedback.</CardDescription>

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
                <CardTitle className="text-sm font-medium">Surveys Available</CardTitle>
                <ListFilter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalSurveysDeployed}</div>
                <p className="text-xs text-muted-foreground">Defined surveys</p>
            </CardContent>
        </Card>
         <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Positive Feedback (Initial)</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{positiveFeedbackCount}</div>
                <p className="text-xs text-muted-foreground">Reported 'amazing' experience</p>
            </CardContent>
        </Card>
        <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profile Nudges (Initial)</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{usersFlaggedForIncompleteProfile}</div>
                <p className="text-xs text-muted-foreground">Based on 'needs improvement'</p>
            </CardContent>
        </Card>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-lg lg:col-span-1">
          <CardHeader>
            <CardTitle>Survey Configuration</CardTitle>
            <CardDescription>Manage and deploy surveys via the floating messenger.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="active-survey">Active Survey for Floating Messenger</Label>
              <Select value={activeSurveyId} onValueChange={setActiveSurveyId}>
                <SelectTrigger id="active-survey">
                  <SelectValue placeholder="Select a survey to activate" />
                </SelectTrigger>
                <SelectContent>
                  {surveyDefinitionsState.map(survey => (
                    <SelectItem key={survey.id} value={survey.id}>{survey.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">The selected survey will be presented by the floating messenger.</p>
            </div>
            <Dialog open={isCreateSurveyOpen} onOpenChange={setIsCreateSurveyOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" /> Create New Survey
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl"> {/* Increased width */}
                <DialogHeader>
                  <DialogTitle className="text-xl">Create New Survey</DialogTitle>
                  <CardDescription>Define a new survey with its steps.</CardDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] p-1">
                <div className="space-y-4 py-4 pr-4">
                  <div>
                    <Label htmlFor="new-survey-name">Survey Name</Label>
                    <Input id="new-survey-name" value={newSurveyName} onChange={(e) => setNewSurveyName(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="new-survey-desc">Survey Description (Optional)</Label>
                    <Textarea id="new-survey-desc" value={newSurveyDescription} onChange={(e) => setNewSurveyDescription(e.target.value)} />
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-lg font-medium mb-2">Survey Steps (Conceptual)</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      This section demonstrates how survey steps would be defined. For a full implementation, you'd add UI controls to dynamically add, edit, and reorder steps, choosing types like 'Bot Message', 'User Options', 'User Input', or 'Dropdown', and configuring their respective properties (text, options, variable names, next steps, etc.). The 'Profile Completion Survey' provides a comprehensive example of such a structure.
                    </p>
                    <Card className="bg-secondary/50 p-4">
                      <CardTitle className="text-md mb-2 flex items-center gap-2"><FileText className="h-4 w-4"/>Example Step Structure:</CardTitle>
                      <pre className="text-xs bg-muted p-2 rounded-sm overflow-x-auto">
                        {`
{ 
  id: 'unique_step_id', 
  type: 'botMessage' | 'userOptions' | 'userInput' | 'userDropdown',
  text: 'Your question or bot message here', 
  // For userOptions:
  options: [{ text: 'Option Text', value: 'option_value', nextStepId: 'next_id' }],
  // For userDropdown:
  dropdownOptions: [{ label: 'Option Label', value: 'option_value' }],
  // For userInput:
  placeholder: 'Placeholder text',
  inputType: 'text' | 'textarea' | 'date' | ...,
  variableName: 'data_key_for_answer',
  nextStepId: 'default_next_step_id_after_input_or_dropdown',
  isLastStep: false 
}`}
                      </pre>
                    </Card>
                    <div className="mt-4">
                        <Button type="button" variant="outline" onClick={() => addStepToNewSurvey('botMessage')} className="mr-2"><PlusCircle className="mr-1 h-4 w-4"/> Add Bot Message</Button>
                        <Button type="button" variant="outline" onClick={() => addStepToNewSurvey('userInput')}><PlusCircle className="mr-1 h-4 w-4"/> Add User Input</Button>
                        {/* Add more buttons for other step types */}
                    </div>
                    {newSurveySteps.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <h4 className="font-medium">Current Steps:</h4>
                            {newSurveySteps.map((step, index) => (
                                <div key={index} className="p-2 border rounded-md text-xs">
                                    <p><strong>ID:</strong> {step.id}, <strong>Type:</strong> {step.type}</p>
                                    <p><strong>Text:</strong> {step.text?.substring(0,50)}...</p>
                                </div>
                            ))}
                        </div>
                    )}
                  </div>
                </div>
                </ScrollArea>
                <DialogFooter>
                  <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                  <Button onClick={handleCreateNewSurvey}>Create Survey Entry</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ListFilter className="h-5 w-5"/>Profile Completion Insights (Conceptual)</CardTitle>
                <CardDescription>Analysis of responses from the 'Profile Completion Survey' would go here. (Currently shows mock data based on initial feedback survey).</CardDescription>
            </CardHeader>
            <CardContent>
                {incompleteProfileUsers.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No users flagged from *initial* surveys for incomplete profiles.</p>
                ) : (
                    <ul className="space-y-2">
                        {incompleteProfileUsers.map(user => (
                            <li key={user.id} className="flex justify-between items-center p-2 border rounded-md">
                                <div>
                                    <p className="font-medium">{user.name} <span className="text-xs text-muted-foreground">({user.id})</span></p>
                                    <p className="text-xs text-muted-foreground">Reason: {user.reason} (from initial feedback)</p>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/admin/user-management?userId=${user.id}`}>View User</Link>
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
                 <p className="text-sm text-muted-foreground mt-4">Further development needed to process and display insights from the detailed 'Profile Completion Survey'.</p>
            </CardContent>
        </Card>
      </div>

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
                    <TableCell>{surveyDefinitionsState.find(sds => sds.id === response.surveyId)?.name || response.surveyName}</TableCell>
                    <TableCell>{format(new Date(response.responseDate), 'PPp')}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {Object.entries(response.data)
                             .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`)
                             .slice(0,2) 
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

      <Dialog open={isResponseDetailOpen} onOpenChange={setIsResponseDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Survey Response Details</DialogTitle>
            {selectedResponse && (
              <CardDescription>
                From: {selectedResponse.userName} ({selectedResponse.userId}) <br/>
                Survey: {surveyDefinitionsState.find(sds => sds.id === selectedResponse.surveyId)?.name || selectedResponse.surveyName} <br/>
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

