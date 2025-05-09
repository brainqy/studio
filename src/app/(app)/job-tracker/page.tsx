"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit3, Trash2, Briefcase, BarChart3, Eye, CalendarDays } from "lucide-react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, PieChart, Pie, Cell } from 'recharts';
import { sampleJobApplications } from "@/lib/sample-data";
import type { JobApplication } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const jobApplicationSchema = z.object({
  id: z.string().optional(),
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  status: z.enum(['Applied', 'Interviewing', 'Offer', 'Rejected', 'Saved']),
  dateApplied: z.string().min(1, "Date applied is required"),
  notes: z.string().optional(),
  jobDescription: z.string().optional(),
});

type JobApplicationFormData = z.infer<typeof jobApplicationSchema>;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function JobTrackerPage() {
  const [applications, setApplications] = useState<JobApplication[]>(sampleJobApplications);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);
  const { toast } = useToast();
  const { control, handleSubmit, reset, formState: { errors } } = useForm<JobApplicationFormData>({
    resolver: zodResolver(jobApplicationSchema),
    defaultValues: { status: 'Applied' }
  });

  const onSubmit = (data: JobApplicationFormData) => {
    if (editingApplication) {
      setApplications(apps => apps.map(app => app.id === editingApplication.id ? { ...app, ...data } : app));
      toast({ title: "Application Updated", description: `${data.jobTitle} at ${data.companyName} updated.` });
    } else {
      const newApp = { ...data, id: String(Date.now()) };
      setApplications(apps => [newApp, ...apps]);
      toast({ title: "Application Added", description: `${data.jobTitle} at ${data.companyName} added.` });
    }
    setIsDialogOpen(false);
    reset({ companyName: '', jobTitle: '', status: 'Applied', dateApplied: '', notes: '', jobDescription: '' });
    setEditingApplication(null);
  };

  const handleEdit = (app: JobApplication) => {
    setEditingApplication(app);
    reset(app); // Populate form with app data
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setApplications(apps => apps.filter(app => app.id !== id));
    toast({ title: "Application Deleted", description: "Job application removed." });
  };
  
  const openNewApplicationDialog = () => {
    setEditingApplication(null);
    reset({ companyName: '', jobTitle: '', status: 'Applied', dateApplied: new Date().toISOString().split('T')[0], notes: '', jobDescription: '' });
    setIsDialogOpen(true);
  };

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<JobApplication['status'], number>);

  const chartData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Job Application Tracker</h1>
        <Button onClick={openNewApplicationDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" /> Add Application
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart3 className="h-6 w-6 text-primary"/>Application Status Overview</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{editingApplication ? "Edit" : "Add New"} Job Application</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Controller name="companyName" control={control} render={({ field }) => <Input id="companyName" {...field} />} />
              {errors.companyName && <p className="text-sm text-destructive mt-1">{errors.companyName.message}</p>}
            </div>
            <div>
              <Label htmlFor="jobTitle">Job Title</Label>
              <Controller name="jobTitle" control={control} render={({ field }) => <Input id="jobTitle" {...field} />} />
              {errors.jobTitle && <p className="text-sm text-destructive mt-1">{errors.jobTitle.message}</p>}
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      {['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
               {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message}</p>}
            </div>
            <div>
              <Label htmlFor="dateApplied">Date Applied</Label>
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

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Briefcase className="h-6 w-6 text-primary"/>Tracked Applications</CardTitle>
          <CardDescription>Manage your job applications efficiently.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead className="hidden md:table-cell">Date Applied</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.companyName}</TableCell>
                  <TableCell>{app.jobTitle}</TableCell>
                  <TableCell className="hidden md:table-cell">{new Date(app.dateApplied).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      app.status === 'Offer' ? 'bg-green-100 text-green-700' :
                      app.status === 'Interviewing' ? 'bg-blue-100 text-blue-700' :
                      app.status === 'Applied' ? 'bg-yellow-100 text-yellow-700' :
                      app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {app.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(app)} title="Edit">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(app.id)} title="Delete">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {applications.length === 0 && <p className="text-center text-muted-foreground py-4">No applications tracked yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
