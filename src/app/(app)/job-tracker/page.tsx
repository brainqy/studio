"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Edit3, Trash2, GripVertical, Search, FileText, Clock } from "lucide-react";
import { sampleJobApplications, sampleResumeScanHistory } from "@/lib/sample-data";
import type { JobApplication, JobApplicationStatus, ResumeScanHistoryItem, KanbanColumnId } from "@/types";
import { JOB_APPLICATION_STATUSES } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

const jobApplicationSchema = z.object({
  id: z.string().optional(),
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  status: z.enum(JOB_APPLICATION_STATUSES as [JobApplicationStatus, ...JobApplicationStatus[]]),
  dateApplied: z.string().min(1, "Date applied is required").refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date"}),
  notes: z.string().optional(),
  jobDescription: z.string().optional(),
  location: z.string().optional(),
});

type JobApplicationFormData = z.infer<typeof jobApplicationSchema>;

const KANBAN_COLUMNS_CONFIG: { id: KanbanColumnId; title: string; description: string; acceptedStatuses: JobApplicationStatus[] }[] = [
  { id: 'Saved', title: 'Saved', description: 'Jobs saved from our chrome extension or the scan report will appear here.', acceptedStatuses: ['Saved'] },
  { id: 'Applied', title: 'Applied', description: 'Application completed. Awaiting response from employer or recruiter.', acceptedStatuses: ['Applied'] },
  { id: 'Interview', title: 'Interview', description: 'Invited to interview? Record the interview details and notes here.', acceptedStatuses: ['Interviewing'] },
  { id: 'Offer', title: 'Offer', description: 'Interviews completed. Negotiating offer, or waiting for employer response.', acceptedStatuses: ['Offer'] },
];


function JobSearchSidebar() {
  return (
    <Card className="w-full md:w-72 flex-shrink-0 shadow-lg">
      <CardHeader>
        <CardTitle>Jobs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="search-job">Search job</Label>
          <Input id="search-job" placeholder="Keywords, title..." />
        </div>
        <div>
          <Label htmlFor="search-location">Location</Label>
          <Input id="search-location" placeholder="City, state, or remote" />
        </div>
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <Search className="mr-2 h-4 w-4" /> Search
        </Button>
        <div className="border-2 border-dashed border-border rounded-md p-6 text-center text-muted-foreground h-24 flex items-center justify-center">
          Drag here
        </div>
        <Button variant="outline" className="w-full">Find more jobs</Button>
      </CardContent>
    </Card>
  );
}

function JobCard({ application, onEdit, onDelete, onMove }: { application: JobApplication, onEdit: (app: JobApplication) => void, onDelete: (id: string) => void, onMove: (appId: string, newStatus: JobApplicationStatus) => void }) {
  const { toast } = useToast();
  return (
    <Card className="mb-3 shadow-md bg-card hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold text-sm text-foreground">{application.jobTitle}</h4>
            <p className="text-xs text-muted-foreground">{application.companyName}</p>
            {application.location && <p className="text-xs text-muted-foreground">{application.location}</p>}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <GripVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(application)}>
                <Edit3 className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Move to</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {KANBAN_COLUMNS_CONFIG.map(col => (
                       col.acceptedStatuses[0] !== application.status && // Don't show option to move to current status
                        <DropdownMenuItem key={col.id} onClick={() => onMove(application.id, col.acceptedStatuses[0])}>
                          {col.title}
                        </DropdownMenuItem>
                    ))}
                    {application.status !== 'Rejected' && 
                        <DropdownMenuItem onClick={() => onMove(application.id, 'Rejected')}>Rejected</DropdownMenuItem>
                    }
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(application.id)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function KanbanColumn({ column, applications, onEdit, onDelete, onMove }: { column: typeof KANBAN_COLUMNS_CONFIG[0], applications: JobApplication[], onEdit: (app: JobApplication) => void, onDelete: (id: string) => void, onMove: (appId: string, newStatus: JobApplicationStatus) => void }) {
  return (
    <Card className="w-full md:w-72 lg:w-80 flex-shrink-0 bg-secondary/50 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-md font-semibold">{column.title} ({applications.length})</CardTitle>
        <CardDescription className="text-xs">{column.description}</CardDescription>
      </CardHeader>
      <ScrollArea className="flex-grow p-4 pt-0">
        {applications.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-md p-6 text-center text-muted-foreground h-24 flex items-center justify-center mt-4">
            Drag here
          </div>
        ) : (
          applications.map(app => (
            <JobCard key={app.id} application={app} onEdit={onEdit} onDelete={onDelete} onMove={onMove} />
          ))
        )}
      </ScrollArea>
       {applications.length > 0 && (
         <div className="p-4 pt-0">
          <div className="border-2 border-dashed border-border rounded-md p-6 text-center text-muted-foreground h-24 flex items-center justify-center">
            Drag here
          </div>
         </div>
        )}
    </Card>
  );
}


function ResumeScanHistoryCard({ historyItems }: { historyItems: ResumeScanHistoryItem[] }) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><FileText className="h-6 w-6 text-primary"/>Resume Scan History</CardTitle>
        <CardDescription>A log of your past resume scans and analyses.</CardDescription>
      </CardHeader>
      <CardContent>
        {historyItems.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No resume scans recorded yet.</p>
        ) : (
          <ScrollArea className="h-[300px]">
            <ul className="space-y-3">
              {historyItems.map(item => (
                <li key={item.id} className="p-3 border rounded-md bg-card hover:bg-secondary/30 transition-colors">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-sm text-foreground">{item.jobTitle} at {item.companyName}</h4>
                    {item.matchScore && (
                       <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${item.matchScore >= 80 ? 'bg-green-100 text-green-700' : item.matchScore >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {item.matchScore}% Match
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Scanned: {item.resumeName}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3"/> {format(new Date(item.scanDate), "PPp")}
                  </p>
                  {item.reportUrl && <Button variant="link" size="sm" className="p-0 h-auto text-xs mt-1">View Report</Button>}
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}


export default function JobTrackerPage() {
  const [applications, setApplications] = useState<JobApplication[]>(sampleJobApplications);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);
  const { toast } = useToast();
  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<JobApplicationFormData>({
    resolver: zodResolver(jobApplicationSchema),
    defaultValues: { status: 'Saved', dateApplied: new Date().toISOString().split('T')[0] }
  });

  const onSubmit = (data: JobApplicationFormData) => {
    if (editingApplication) {
      setApplications(apps => apps.map(app => app.id === editingApplication.id ? { ...app, ...data, status: data.status as JobApplicationStatus } : app));
      toast({ title: "Application Updated", description: `${data.jobTitle} at ${data.companyName} updated.` });
    } else {
      const newApp: JobApplication = { ...data, id: String(Date.now()), status: data.status as JobApplicationStatus };
      setApplications(apps => [newApp, ...apps]);
      toast({ title: "Application Added", description: `${data.jobTitle} at ${data.companyName} added to 'Saved'.` });
    }
    setIsDialogOpen(false);
    reset({ companyName: '', jobTitle: '', status: 'Saved', dateApplied: new Date().toISOString().split('T')[0], notes: '', jobDescription: '', location: '' });
    setEditingApplication(null);
  };

  const handleEdit = (app: JobApplication) => {
    setEditingApplication(app);
    setValue('companyName', app.companyName);
    setValue('jobTitle', app.jobTitle);
    setValue('status', app.status);
    setValue('dateApplied', app.dateApplied);
    setValue('notes', app.notes || '');
    setValue('jobDescription', app.jobDescription || '');
    setValue('location', app.location || '');
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setApplications(apps => apps.filter(app => app.id !== id));
    toast({ title: "Application Deleted", description: "Job application removed." });
  };

  const handleMoveApplication = (appId: string, newStatus: JobApplicationStatus) => {
    setApplications(prevApps => prevApps.map(app => app.id === appId ? { ...app, status: newStatus } : app));
    const app = applications.find(a => a.id === appId);
    if (app) {
      toast({ title: "Application Moved", description: `${app.jobTitle} moved to ${newStatus === 'Interviewing' ? 'Interview' : newStatus}.` });
    }
  };
  
  const openNewApplicationDialog = () => {
    setEditingApplication(null);
    reset({ companyName: '', jobTitle: '', status: 'Saved', dateApplied: new Date().toISOString().split('T')[0], notes: '', jobDescription: '', location: '' });
    setIsDialogOpen(true);
  };
  
  const getAppsForColumn = (column: typeof KANBAN_COLUMNS_CONFIG[0]): JobApplication[] => {
    return applications.filter(app => column.acceptedStatuses.includes(app.status));
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-0 -m-4 sm:-m-6 lg:-m-8"> {/* Adjusted padding */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Job Application Tracker</h1>
        <Button onClick={openNewApplicationDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" /> Add Job
        </Button>
      </div>

      <div className="flex flex-1 gap-4 overflow-x-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
        <JobSearchSidebar />
        <div className="flex flex-1 gap-4 h-full"> {/* Kanban columns container */}
          {KANBAN_COLUMNS_CONFIG.map((colConfig) => (
            <KanbanColumn
              key={colConfig.id}
              column={colConfig}
              applications={getAppsForColumn(colConfig)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onMove={handleMoveApplication}
            />
          ))}
        </div>
      </div>
      
      <div className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
        <ResumeScanHistoryCard historyItems={sampleResumeScanHistory} />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
        setIsDialogOpen(isOpen);
        if (!isOpen) {
            setEditingApplication(null);
            reset({ companyName: '', jobTitle: '', status: 'Saved', dateApplied: new Date().toISOString().split('T')[0], notes: '', jobDescription: '', location: '' });
        }
      }}>
        <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{editingApplication ? "Edit" : "Add New"} Job Application</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="jobTitle">Job Title</Label>
              <Controller name="jobTitle" control={control} render={({ field }) => <Input id="jobTitle" {...field} />} />
              {errors.jobTitle && <p className="text-sm text-destructive mt-1">{errors.jobTitle.message}</p>}
            </div>
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Controller name="companyName" control={control} render={({ field }) => <Input id="companyName" {...field} />} />
              {errors.companyName && <p className="text-sm text-destructive mt-1">{errors.companyName.message}</p>}
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Controller name="location" control={control} render={({ field }) => <Input id="location" placeholder="e.g., Remote, New York, NY" {...field} />} />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      {JOB_APPLICATION_STATUSES.map(s => (
                        <SelectItem key={s} value={s}>{s === 'Interviewing' ? 'Interview' : s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
               {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message}</p>}
            </div>
            <div>
              <Label htmlFor="dateApplied">Date Applied / Saved</Label>
              <Controller name="dateApplied" control={control} render={({ field }) => <Input id="dateApplied" type="date" {...field} />} />
              {errors.dateApplied && <p className="text-sm text-destructive mt-1">{errors.dateApplied.message}</p>}
            </div>
            <div>
              <Label htmlFor="jobDescription">Job Description (Optional)</Label>
              <Controller name="jobDescription" control={control} render={({ field }) => <Textarea id="jobDescription" placeholder="Paste job description here..." rows={4} {...field} />} />
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Controller name="notes" control={control} render={({ field }) => <Textarea id="notes" placeholder="Any relevant notes..." rows={3} {...field} />} />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">{editingApplication ? "Save Changes" : "Add Application"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
