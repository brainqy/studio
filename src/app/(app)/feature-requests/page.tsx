"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, ShieldQuestion, Lightbulb, Send, CheckCircle, Zap } from "lucide-react";
import { sampleFeatureRequests, sampleUserProfile } from "@/lib/sample-data";
import type { FeatureRequest } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const featureRequestSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type FeatureRequestFormData = z.infer<typeof featureRequestSchema>;

export default function FeatureRequestsPage() {
  const [requests, setRequests] = useState<FeatureRequest[]>(sampleFeatureRequests);
  const [isSuggestDialogOpen, setIsSuggestDialogOpen] = useState(false);
  const { toast } = useToast();
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FeatureRequestFormData>({
    resolver: zodResolver(featureRequestSchema)
  });

  const onSubmitSuggestion = (data: FeatureRequestFormData) => {
    const newRequest: FeatureRequest = {
      id: String(Date.now()),
      userId: sampleUserProfile.id, // Assuming a logged-in user
      userName: sampleUserProfile.name,
      timestamp: new Date().toISOString(),
      title: data.title,
      description: data.description,
      status: 'Pending',
    };
    setRequests(prevRequests => [newRequest, ...prevRequests]);
    toast({ title: "Suggestion Submitted", description: "Thank you for your feedback!" });
    setIsSuggestDialogOpen(false);
    reset();
  };

  const getStatusColor = (status: FeatureRequest['status']) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  const openNewRequestDialog = () => {
    reset({ title: '', description: '' });
    setIsSuggestDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Feature Requests</h1>
        <Button onClick={openNewRequestDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" /> Suggest New Feature
        </Button>
      </div>

      <Dialog open={isSuggestDialogOpen} onOpenChange={setIsSuggestDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2"><Lightbulb className="h-6 w-6 text-primary"/>Suggest a New Feature</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitSuggestion)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="request-title">Feature Title</Label>
              <Controller name="title" control={control} render={({ field }) => <Input id="request-title" placeholder="e.g., Dark Mode for Dashboard" {...field} />} />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="request-description">Detailed Description</Label>
              <Controller name="description" control={control} render={({ field }) => (
                <Textarea 
                  id="request-description" 
                  rows={5} 
                  placeholder="Explain your feature idea, its benefits, and how it might work."
                  {...field}
                />
              )} />
              {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Send className="mr-2 h-4 w-4"/> Submit Suggestion
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {requests.length === 0 ? (
         <Card className="text-center py-12 shadow-lg">
          <CardHeader>
            <ShieldQuestion className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="text-2xl">No Feature Requests Yet</CardTitle>
            <CardDescription>
              Have an idea to improve ResumeMatch AI? Be the first to suggest it!
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {requests.map(request => (
            <Card key={request.id} className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{request.title}</CardTitle>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
                <CardDescription className="text-xs">
                  Suggested by {request.userName} • {formatDistanceToNow(new Date(request.timestamp), { addSuffix: true })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{request.description}</p>
              </CardContent>
              <CardFooter>
                 <Button variant="link" size="sm" className="p-0 h-auto text-primary hover:underline">View Details</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
