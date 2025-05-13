
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Edit3, Trash2, Megaphone, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Announcement, AnnouncementStatus, AnnouncementAudience } from "@/types";
import { sampleAnnouncements, sampleUserProfile, sampleTenants } from "@/lib/sample-data";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import Link from "next/link";

const announcementSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  startDate: z.date({ required_error: "Start date is required." }),
  endDate: z.date().optional(),
  audience: z.enum(['All Users', 'Specific Tenant', 'Specific Role']),
  audienceTarget: z.string().optional(),
  status: z.enum(['Draft', 'Published', 'Archived']),
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

export default function AnnouncementManagementPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(sampleAnnouncements);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const { toast } = useToast();
  const currentUser = sampleUserProfile;

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: { status: 'Draft', audience: 'All Users' }
  });

  const watchedAudience = watch("audience");

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

  const onSubmitForm = (data: AnnouncementFormData) => {
    const announcementData: Announcement = {
      title: data.title,
      content: data.content,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate?.toISOString(),
      audience: data.audience as AnnouncementAudience,
      audienceTarget: data.audience === 'Specific Tenant' ? data.audienceTarget : data.audience === 'Specific Role' ? data.audienceTarget : undefined,
      status: data.status as AnnouncementStatus,
      id: editingAnnouncement ? editingAnnouncement.id : `announce-${Date.now()}`,
      createdAt: editingAnnouncement ? editingAnnouncement.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser.id,
    };

    if (editingAnnouncement) {
      setAnnouncements(prev => prev.map(a => a.id === editingAnnouncement.id ? announcementData : a));
      toast({ title: "Announcement Updated", description: `Announcement "${data.title}" has been updated.` });
    } else {
      setAnnouncements(prev => [announcementData, ...prev]);
      toast({ title: "Announcement Created", description: `Announcement "${data.title}" has been added.` });
    }
    setIsFormDialogOpen(false);
    reset({ title: '', content: '', audience: 'All Users', audienceTarget: '', status: 'Draft' });
    setEditingAnnouncement(null);
  };

  const openNewAnnouncementDialog = () => {
    setEditingAnnouncement(null);
    reset({ title: '', content: '', startDate: new Date(), audience: 'All Users', audienceTarget: '', status: 'Draft' });
    setIsFormDialogOpen(true);
  };

  const openEditAnnouncementDialog = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setValue('title', announcement.title);
    setValue('content', announcement.content);
    setValue('startDate', parseISO(announcement.startDate));
    if (announcement.endDate) setValue('endDate', parseISO(announcement.endDate));
    setValue('audience', announcement.audience);
    setValue('audienceTarget', announcement.audienceTarget || '');
    setValue('status', announcement.status);
    setIsFormDialogOpen(true);
  };

  const handleDeleteAnnouncement = (announcementId: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
    toast({ title: "Announcement Deleted", description: "Announcement removed.", variant: "destructive" });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Megaphone className="h-8 w-8" /> Announcement Management
        </h1>
        <Button onClick={openNewAnnouncementDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" /> Create New Announcement
        </Button>
      </div>
      <CardDescription>Manage platform-wide or targeted announcements.</CardDescription>

      <Dialog open={isFormDialogOpen} onOpenChange={(isOpen) => {
        if (!isOpen) {
          setEditingAnnouncement(null);
          reset();
        }
        setIsFormDialogOpen(isOpen);
      }}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingAnnouncement ? "Edit Announcement" : "Create New Announcement"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="announcement-title">Title</Label>
              <Controller name="title" control={control} render={({ field }) => <Input id="announcement-title" {...field} />} />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="announcement-content">Content</Label>
              <Controller name="content" control={control} render={({ field }) => <Textarea id="announcement-content" rows={5} {...field} placeholder="Enter announcement details. Supports Markdown." />} />
              {errors.content && <p className="text-sm text-destructive mt-1">{errors.content.message}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="announcement-startDate">Start Date</Label>
                <Controller name="startDate" control={control} render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />} />
                {errors.startDate && <p className="text-sm text-destructive mt-1">{errors.startDate.message}</p>}
              </div>
              <div>
                <Label htmlFor="announcement-endDate">End Date (Optional)</Label>
                <Controller name="endDate" control={control} render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="announcement-audience">Audience</Label>
                <Controller name="audience" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="announcement-audience"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Users">All Users</SelectItem>
                      <SelectItem value="Specific Tenant">Specific Tenant</SelectItem>
                      <SelectItem value="Specific Role">Specific Role (mocked)</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>
              {watchedAudience === 'Specific Tenant' && (
                <div>
                  <Label htmlFor="announcement-audienceTarget">Target Tenant</Label>
                  <Controller name="audienceTarget" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="announcement-audienceTarget"><SelectValue placeholder="Select Tenant" /></SelectTrigger>
                      <SelectContent>
                        {sampleTenants.map(tenant => (
                           <SelectItem key={tenant.id} value={tenant.id}>{tenant.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )} />
                </div>
              )}
              {watchedAudience === 'Specific Role' && (
                 <div>
                  <Label htmlFor="announcement-audienceTarget">Target Role</Label>
                  <Controller name="audienceTarget" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="announcement-audienceTarget"><SelectValue placeholder="Select Role" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        {/* Add other roles if needed */}
                      </SelectContent>
                    </Select>
                  )} />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="announcement-status">Status</Label>
              <Controller name="status" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="announcement-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {editingAnnouncement ? "Save Changes" : "Create Announcement"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Current Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No announcements created yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell className="font-medium max-w-xs truncate" title={announcement.title}>{announcement.title}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${
                        announcement.status === 'Published' ? 'bg-green-100 text-green-700' :
                        announcement.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {announcement.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {announcement.audience}
                      {announcement.audienceTarget && ` (${announcement.audience === 'Specific Tenant' ? sampleTenants.find(t=>t.id === announcement.audienceTarget)?.name || announcement.audienceTarget : announcement.audienceTarget})`}
                    </TableCell>
                    <TableCell>{format(parseISO(announcement.startDate), "MMM dd, yyyy")}</TableCell>
                    <TableCell>{announcement.endDate ? format(parseISO(announcement.endDate), "MMM dd, yyyy") : 'Ongoing'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openEditAnnouncementDialog(announcement)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteAnnouncement(announcement.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
