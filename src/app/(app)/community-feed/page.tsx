
"use client";

import { useState, useMemo, useEffect } from "react"; 
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter} from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, PlusCircle, ThumbsUp, MessageCircle as MessageIcon, Share2, Send, Filter, Edit3, Calendar, MapPin, Flag, ShieldCheck, Trash2, User as UserIcon, TrendingUp, Star, Ticket, Users as UsersIcon, CheckCircle as CheckCircleIcon, XCircle as XCircleIcon, Brain as BrainIcon, ListChecks, Mic, Video, Settings2, Puzzle, Lightbulb, Code as CodeIcon, Eye } from "lucide-react";
import { sampleCommunityPosts, sampleUserProfile, samplePlatformUsers } from "@/lib/sample-data"; 
import type { CommunityPost, CommunityComment, UserProfile } from "@/types"; 
import { formatDistanceToNow, parseISO, isFuture as dateIsFuture } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Badge } from '@/components/ui/badge'; 
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';


const postSchema = z.object({
  content: z.string().min(1, "Post content cannot be empty"),
  tags: z.string().optional(),
  type: z.enum(['text', 'poll', 'event', 'request']),
  pollOptions: z.array(z.object({ option: z.string().min(1, "Option cannot be empty"), votes: z.number().default(0) })).optional()
    .refine(options => !options || options.length === 0 || options.length >= 2, {
      message: "Polls must have at least two options if options are provided.",
    }),
  eventDate: z.string().optional(),
  eventLocation: z.string().optional(),
  eventTitle: z.string().optional(),
  attendees: z.coerce.number().min(0).optional().default(0), 
  capacity: z.coerce.number().min(0).optional().default(0), 
  assignedTo: z.string().optional(),
  status: z.enum(['open', 'assigned', 'completed']).optional(),
}).refine(data => {
  if (data.type === 'event') {
    return !!data.eventTitle && !!data.eventDate && !!data.eventLocation;
  }
  return true;
}, {
  message: "Event title, date, and location are required for event posts.",
  path: ["eventTitle"], // Path can be any of the event fields
});


type PostFormData = z.infer<typeof postSchema>;

const commentSchema = z.object({
  commentText: z.string().min(1, "Comment cannot be empty").max(500, "Comment too long"),
});
type CommentFormData = z.infer<typeof commentSchema>;

export default function CommunityFeedPage() {
  const [posts, setPosts] = useState<CommunityPost[]>(sampleCommunityPosts);
  const [filter, setFilter] = useState<'all' | 'text' | 'poll' | 'event' | 'request' | 'my_posts' | 'flagged'>('all');
  const { toast } = useToast();

  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  
  const [newCommentText, setNewCommentText] = useState(""); 
  const [commentingOnPostId, setCommentingOnPostId] = useState<string | null>(null);

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: '',
      tags: '',
      type: 'text',
      pollOptions: [{ option: '', votes: 0 }, { option: '', votes: 0 }],
      attendees: 0,
      capacity: 0,
    }
  });
  
  const postType = watch("type"); 

  const currentUser = sampleUserProfile; 

  useEffect(() => {
    // Filter posts based on tenantId (only for managers for now)
    // Admins see all, users see their tenant's and platform-wide
    let viewablePosts = sampleCommunityPosts;
    if (currentUser.role === 'manager') {
      viewablePosts = sampleCommunityPosts.filter(p => p.tenantId === currentUser.tenantId || p.tenantId === 'platform');
    } else if (currentUser.role === 'user') {
      viewablePosts = sampleCommunityPosts.filter(p => p.tenantId === currentUser.tenantId || p.tenantId === 'platform');
    }
    setPosts(viewablePosts);
  }, [currentUser.role, currentUser.tenantId]);


  const mostActiveUsers = useMemo(() => {
    return [...samplePlatformUsers] 
      .filter(user => user.xpPoints && user.xpPoints > 0 && user.status === 'active' && (currentUser.role === 'admin' || user.tenantId === currentUser.tenantId || user.tenantId === 'platform'))
      .sort((a, b) => (b.xpPoints || 0) - (a.xpPoints || 0))
      .slice(0, 5); 
  }, [currentUser.role, currentUser.tenantId]); 

  const handleFormSubmit = (data: PostFormData) => {
    let pollOptionsFinal = undefined;
    if (data.type === 'poll' && data.pollOptions) {
        pollOptionsFinal = data.pollOptions.filter(opt => opt.option.trim() !== '').map(opt => ({ option: opt.option.trim(), votes: 0 }));
        if (pollOptionsFinal.length < 2) {
            toast({ title: "Poll Error", description: "Polls must have at least two valid options.", variant: "destructive" });
            return;
        }
    }


    if (editingPost) {
      setPosts(prevPosts => prevPosts.map(p => p.id === editingPost.id
        ? {
          ...p,
          content: data.content,
          tags: data.tags?.split(',').map(tag => tag.trim()).filter(tag => tag) || [],
          type: data.type as any, 
          pollOptions: data.type === 'poll' ? pollOptionsFinal : undefined,
          eventDate: data.type === 'event' ? data.eventDate : undefined,
          eventLocation: data.type === 'event' ? data.eventLocation : undefined,
          eventTitle: data.type === 'event' ? data.eventTitle : undefined,
          attendees: data.type === 'event' ? (data.attendees || 0) : undefined,
          capacity: data.type === 'event' ? (data.capacity || 0) : undefined,
        }
        : p
      ));
      toast({ title: "Post Updated", description: "Your post has been updated." });
    } else {
      const newPost: CommunityPost = {
        id: String(Date.now()),
        tenantId: sampleUserProfile.tenantId || 'platform', // Default to platform if user has no tenantId
        userId: sampleUserProfile.id,
        userName: sampleUserProfile.name,
        userAvatar: sampleUserProfile.profilePictureUrl,
        timestamp: new Date().toISOString(),
        content: data.content,
        type: data.type as any, 
        pollOptions: data.type === 'poll' ? pollOptionsFinal : undefined,
        eventDate: data.type === 'event' ? data.eventDate : undefined,
        eventLocation: data.type === 'event' ? data.eventLocation : undefined,
        eventTitle: data.type === 'event' ? data.eventTitle : undefined,
        attendees: data.type === 'event' ? (data.attendees || 0) : undefined,
        capacity: data.type === 'event' ? (data.capacity || 0) : undefined,
        tags: data.tags?.split(',').map(tag => tag.trim()).filter(tag => tag) || [],
        moderationStatus: 'visible', 
        flagCount: 0,
        comments: [],
        status: data.type === 'request' ? 'open' : undefined,
      };
      setPosts(prevPosts => [newPost, ...prevPosts]);
      // Also add to global sample data for demo persistence
      sampleCommunityPosts.unshift(newPost);
      toast({ title: "Post Created", description: "Your post has been added to the feed." });
    }
    setIsPostDialogOpen(false);
    reset({ content: '', tags: '', type: 'text', pollOptions: [{ option: '', votes: 0 }, { option: '', votes: 0 }], attendees: 0, capacity: 0 });
    setEditingPost(null);
  };

  const handleCommentSubmit = (postId: string) => {
    if (!newCommentText.trim()) {
      toast({ title: "Empty Comment", description: "Cannot submit an empty comment.", variant: "destructive" });
      return;
    }
    const newComment: CommunityComment = {
      id: `comment-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.profilePictureUrl,
      timestamp: new Date().toISOString(),
      text: newCommentText.trim(),
    };
    
    const updateGlobalAndLocal = (updater: (post: CommunityPost) => CommunityPost) => {
        setPosts(prevPosts => prevPosts.map(post => post.id === postId ? updater(post) : post));
        const globalPostIndex = sampleCommunityPosts.findIndex(p => p.id === postId);
        if (globalPostIndex !== -1) {
            sampleCommunityPosts[globalPostIndex] = updater(sampleCommunityPosts[globalPostIndex]);
        }
    };
    updateGlobalAndLocal(post => ({ ...post, comments: [...(post.comments || []), newComment] }));

    toast({ title: "Comment Added", description: "Your comment has been posted." });
    setNewCommentText("");
    setCommentingOnPostId(null); 
  };

  const handleVote = (postId: string, optionIndex: number) => {
     const updateGlobalAndLocal = (updater: (post: CommunityPost) => CommunityPost) => {
        setPosts(prevPosts => prevPosts.map(post => post.id === postId ? updater(post) : post));
        const globalPostIndex = sampleCommunityPosts.findIndex(p => p.id === postId);
        if (globalPostIndex !== -1) {
            sampleCommunityPosts[globalPostIndex] = updater(sampleCommunityPosts[globalPostIndex]);
        }
    };
    updateGlobalAndLocal(post => {
        if (post.type === 'poll' && post.pollOptions) {
            const newPollOptions = [...post.pollOptions];
            if (newPollOptions[optionIndex]) {
                newPollOptions[optionIndex] = { ...newPollOptions[optionIndex], votes: (newPollOptions[optionIndex].votes || 0) + 1 };
                return { ...post, pollOptions: newPollOptions };
            }
        }
        return post;
    });
    toast({ title: "Vote Recorded", description: "Your vote has been cast." });
  };

  const handleAssign = (postId: string, userName: string) => {
     const updateGlobalAndLocal = (updater: (post: CommunityPost) => CommunityPost) => {
        setPosts(prevPosts => prevPosts.map(post => post.id === postId ? updater(post) : post));
        const globalPostIndex = sampleCommunityPosts.findIndex(p => p.id === postId);
        if (globalPostIndex !== -1) {
            sampleCommunityPosts[globalPostIndex] = updater(sampleCommunityPosts[globalPostIndex]);
        }
    };

    let assigned = false;
    updateGlobalAndLocal(post => {
      if (post.type === 'request') {
        if (post.assignedTo) {
          toast({ title: "Already Assigned", description: `This request is already assigned to ${post.assignedTo}.`, variant: "default" });
          return post;
        }
        assigned = true;
        return { ...post, assignedTo: userName, status: 'assigned' };
      }
      return post;
    });

    if (assigned) {
        toast({ title: "Request Assigned", description: `You have been assigned to this request: "${posts.find(p=>p.id === postId)?.content?.substring(0,30)}..."` });
    }
  };
  
  const handleRegisterForEvent = (postId: string, eventTitle?: string) => {
    const updateGlobalAndLocal = (updater: (post: CommunityPost) => CommunityPost | null) => {
        let success = false;
        setPosts(prevPosts => prevPosts.map(post => {
            if (post.id === postId) {
                const updatedPost = updater(post);
                if (updatedPost) {
                    success = true;
                    return updatedPost;
                }
            }
            return post;
        }));
        if (success) {
            const globalPostIndex = sampleCommunityPosts.findIndex(p => p.id === postId);
            if (globalPostIndex !== -1) {
                const updatedGlobalPost = updater(sampleCommunityPosts[globalPostIndex]);
                 if (updatedGlobalPost) sampleCommunityPosts[globalPostIndex] = updatedGlobalPost;
            }
        }
        return success;
    };

    const registered = updateGlobalAndLocal(post => {
      if (post.type === 'event' && post.attendees !== undefined && post.capacity !== undefined && post.attendees < post.capacity) {
        return { ...post, attendees: (post.attendees || 0) + 1 };
      } else if (post.type === 'event') {
         toast({ title: "Registration Failed", description: `Cannot register for "${eventTitle || 'the event'}". It might be full.`, variant: "destructive"});
         return null; // Indicate no change
      }
      return post;
    });
    
    if(registered) {
        toast({ title: "Registered for Event!", description: `You've successfully registered for "${eventTitle || 'the event'}".`});
    }
  };

  const openNewPostDialog = () => {
    setEditingPost(null);
    reset({ content: '', tags: '', type: 'text', pollOptions: [{ option: '', votes: 0 }, { option: '', votes: 0 }], attendees: 0, capacity: 0 });
    setIsPostDialogOpen(true);
  };

  const openEditPostDialog = (post: CommunityPost) => {
    setEditingPost(post);
    setValue('content', post.content || '');
    setValue('tags', post.tags?.join(', ') || '');
    setValue('type', post.type);
    if (post.type === 'poll') setValue('pollOptions', post.pollOptions || [{ option: '', votes: 0 }, { option: '', votes: 0 }]);
    if (post.type === 'event') {
      setValue('eventDate', post.eventDate);
      setValue('eventLocation', post.eventLocation);
      setValue('eventTitle', post.eventTitle);
      setValue('attendees', post.attendees || 0);
      setValue('capacity', post.capacity || 0);
    }
    setIsPostDialogOpen(true);
  };

  const handleFlagPost = (postId: string) => {
    const updateGlobalAndLocal = (updater: (post: CommunityPost) => CommunityPost) => {
        setPosts(prevPosts => prevPosts.map(post => post.id === postId ? updater(post) : post));
        const globalPostIndex = sampleCommunityPosts.findIndex(p => p.id === postId);
        if (globalPostIndex !== -1) {
            sampleCommunityPosts[globalPostIndex] = updater(sampleCommunityPosts[globalPostIndex]);
        }
    };
    updateGlobalAndLocal(post => ({ ...post, moderationStatus: 'flagged', flagCount: (post.flagCount || 0) + 1 }));
    toast({ title: "Post Flagged", description: "The post has been flagged for review." });
  };

  const handleApprovePost = (postId: string) => {
    const updateGlobalAndLocal = (updater: (post: CommunityPost) => CommunityPost) => {
        setPosts(prevPosts => prevPosts.map(post => post.id === postId ? updater(post) : post));
        const globalPostIndex = sampleCommunityPosts.findIndex(p => p.id === postId);
        if (globalPostIndex !== -1) {
            sampleCommunityPosts[globalPostIndex] = updater(sampleCommunityPosts[globalPostIndex]);
        }
    };
    updateGlobalAndLocal(post => ({ ...post, moderationStatus: 'visible', flagCount: 0 }));
    toast({ title: "Post Approved", description: "The post is now visible." });
  };

  const handleRemovePost = (postId: string) => {
    const updateGlobalAndLocal = (updater: (post: CommunityPost) => CommunityPost) => {
        setPosts(prevPosts => prevPosts.map(post => post.id === postId ? updater(post) : post));
        const globalPostIndex = sampleCommunityPosts.findIndex(p => p.id === postId);
        if (globalPostIndex !== -1) {
            sampleCommunityPosts[globalPostIndex] = updater(sampleCommunityPosts[globalPostIndex]);
        }
    };
    updateGlobalAndLocal(post => ({ ...post, moderationStatus: 'removed' }));
    toast({ title: "Post Removed", description: "The post has been removed.", variant: "destructive" });
  };

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const isVisibleForTenant = currentUser.role === 'admin' || post.tenantId === 'platform' || post.tenantId === currentUser.tenantId;
      if (!isVisibleForTenant) return false;
      
      const isVisibleForModeration = post.moderationStatus !== 'removed' || currentUser.role === 'admin' || (currentUser.role === 'manager' && post.tenantId === currentUser.tenantId);
      if (!isVisibleForModeration) return false;

      if (filter === 'all') return true;
      if (filter === 'my_posts') return post.userId === currentUser.id;
      if (filter === 'flagged') {
          if(currentUser.role === 'admin') return post.moderationStatus === 'flagged';
          if(currentUser.role === 'manager') return post.moderationStatus === 'flagged' && post.tenantId === currentUser.tenantId;
          return false;
      }
      return post.type === filter;
    });
  }, [posts, filter, currentUser.id, currentUser.role, currentUser.tenantId]);

  return (
    <React.Fragment>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Community Feed</h1>
         <Button onClick={openNewPostDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" /> Create New Post
        </Button>
      </div>

      <Dialog open={isPostDialogOpen} onOpenChange={(isOpen) => {
        setIsPostDialogOpen(isOpen);
        if (!isOpen) {
          reset({ content: '', tags: '', type: 'text', pollOptions: [{ option: '', votes: 0 }, { option: '', votes: 0 }], attendees: 0, capacity: 0 });
          setEditingPost(null);
        }
      }}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <PlusCircle className="h-6 w-6 text-primary"/>{editingPost ? "Edit Post" : "Create New Post"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="post-content">What's on your mind?</Label>
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="post-content"
                    {...field}
                    placeholder="Share updates, ask questions, or start a discussion..."
                    rows={4}
                  />
                )}
              />
              {errors.content && <p className="text-sm text-destructive mt-1">{errors.content.message}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="post-tags">Tags (comma-separated)</Label>
                 <Controller
                    name="tags"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="post-tags"
                        {...field}
                        placeholder="e.g., jobsearch, frontend, advice"
                      />
                    )}
                  />
              </div>
              <div>
                <Label htmlFor="post-type">Post Type</Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="post-type">
                        <SelectValue placeholder="Select post type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text Post</SelectItem>
                        <SelectItem value="poll">Poll</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="request">Request</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
             {postType === 'poll' && (
                <div className="space-y-2">
                  <Label>Poll Options (at least 2 required)</Label>
                  {(watch("pollOptions") || []).map((_, index) => (
                    <div key={index} className="flex items-center gap-2">
                       <Controller
                         name={`pollOptions.${index}.option` as any}
                         control={control}
                         render={({ field }) => <Input {...field} placeholder={`Option ${index + 1}`} />}
                       />
                       {index > 1 && (
                         <Button type="button" variant="ghost" size="icon" onClick={() => {
                             const currentOptions = watch("pollOptions") || [];
                             setValue("pollOptions", currentOptions.filter((_, i) => i !== index));
                         }}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                       )}
                    </div>
                  ))}
                  {errors.pollOptions && typeof errors.pollOptions === 'object' && !Array.isArray(errors.pollOptions) && (errors.pollOptions as any).message && <p className="text-sm text-destructive mt-1">{(errors.pollOptions as any).message}</p>}
                  {(watch("pollOptions") || []).length < 6 && (
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => {
                        const currentOptions = watch("pollOptions") || [];
                        setValue("pollOptions", [...currentOptions, { option: '', votes: 0 }]);
                    }}>
                        <PlusCircle className="mr-2 h-4 w-4"/> Add Option
                    </Button>
                  )}
                </div>
              )}
              {postType === 'event' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="event-title">Event Title *</Label>
                    <Controller name="eventTitle" control={control} render={({ field }) => <Input id="event-title" {...field} placeholder="e.g., Alumni Networking Night" />} />
                     {errors.eventTitle && <p className="text-sm text-destructive mt-1">{errors.eventTitle.message}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="event-date">Event Date *</Label>
                        <Controller name="eventDate" control={control} render={({ field }) => <Input id="event-date" {...field} type="datetime-local" />} />
                         {errors.eventDate && <p className="text-sm text-destructive mt-1">{errors.eventDate.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="event-location">Event Location *</Label>
                        <Controller name="eventLocation" control={control} render={({ field }) => <Input id="event-location" {...field} placeholder="e.g., Zoom, Community Hall" />} />
                        {errors.eventLocation && <p className="text-sm text-destructive mt-1">{errors.eventLocation.message}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <Label htmlFor="event-attendees">Initial Attendees (Optional)</Label>
                        <Controller name="attendees" control={control} render={({ field }) => <Input id="event-attendees" {...field} type="number" placeholder="e.g., 0" />} />
                    </div>
                    <div>
                        <Label htmlFor="event-capacity">Capacity (Optional, 0 for unlimited)</Label>
                        <Controller name="capacity" control={control} render={({ field }) => <Input id="event-capacity" {...field} type="number" placeholder="e.g., 100" />} />
                    </div>
                  </div>
                </div>
              )}
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Send className="mr-2 h-4 w-4" /> {editingPost ? "Save Changes" : "Post"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Recent Posts</h2>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <Select value={filter} onValueChange={(value: 'all' | 'text' | 'poll' | 'event' | 'request' | 'my_posts' | 'flagged') => setFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter posts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Posts</SelectItem>
                  <SelectItem value="text">Text Posts</SelectItem>
                  <SelectItem value="poll">Polls</SelectItem>
                  <SelectItem value="event">Events</SelectItem>
                  <SelectItem value="request">Requests</SelectItem>
                  <SelectItem value="my_posts">My Posts</SelectItem>
                  {(currentUser.role === 'admin' || currentUser.role === 'manager') && <SelectItem value="flagged">Flagged Posts</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredPosts.length === 0 ? (
            <Card className="text-center py-12 shadow-md lg:col-span-3">
              <CardHeader>
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <CardTitle className="text-2xl">No Posts Yet</CardTitle>
                <CardDescription>
                  {filter === 'all' ? "Be the first to post!" : "No posts match your current filter."}
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredPosts.map(post => (
                <Card key={post.id} id={`post-${post.id}`} className={`shadow-md ${post.moderationStatus === 'flagged' ? 'border-yellow-500 border-2' : post.moderationStatus === 'removed' ? 'opacity-50 bg-secondary' : ''}`}>
                  <CardHeader className="flex flex-row items-start space-x-3 pb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.userAvatar} alt={post.userName} data-ai-hint="person face"/>
                      <AvatarFallback>{post.userName.substring(0,1).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{post.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(parseISO(post.timestamp), { addSuffix: true })}
                        {post.type === 'poll' && <Badge variant="info" className="ml-2">Poll</Badge>}
                        {post.type === 'request' && <Badge variant="warning" className="ml-2">{post.status || 'Request'}</Badge>}
                        {post.type === 'event' && <Badge variant="success" className="ml-2">Event</Badge>}
                        {post.moderationStatus === 'flagged' && <Badge variant="warning" className="ml-2">Flagged ({post.flagCount})</Badge>}
                        {post.moderationStatus === 'removed' && <Badge variant="destructive" className="ml-2">Removed</Badge>}
                      </p>
                    </div>
                    {(post.userId === sampleUserProfile.id || currentUser.role === 'admin' || (currentUser.role === 'manager' && post.tenantId === currentUser.tenantId)) && post.moderationStatus !== 'removed' && (
                      <Button variant="ghost" size="icon" onClick={() => openEditPostDialog(post)} title="Edit Post">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {post.moderationStatus === 'removed' && currentUser.role !== 'admin' && !(currentUser.role === 'manager' && post.tenantId === currentUser.tenantId) ? (
                        <p className="text-sm text-muted-foreground italic">This post has been removed by a moderator.</p>
                    ) : (
                      <>
                        {post.type === 'text' && (
                          <p className="text-sm text-foreground whitespace-pre-line">{post.content}</p>
                        )}
                        {post.type === 'poll' && post.content && (
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-2">{post.content}</p>
                          {post.pollOptions?.map((option, index) => (
                              <div key={index} className="flex items-center space-x-2 mb-1 group cursor-pointer p-1.5 rounded hover:bg-primary/10" onClick={() => handleVote(post.id, index)}>
                                <div className={cn("h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0", "border-primary group-hover:border-primary/70")}>
                                    {/* Potential to show if user voted for this option later */}
                                </div>
                                <Label htmlFor={`poll-option-${post.id}-${index}`} className="text-sm text-foreground cursor-pointer">{option.optionText} ({option.votes})</Label>
                              </div>
                            ))}
                        </div>
                        )}
                        {post.type === 'event' && (
                          <div>
                            {post.content && <p className="text-sm text-foreground whitespace-pre-line mb-2">{post.content}</p>}
                            <div className="border rounded-md p-3 space-y-1 bg-secondary/30">
                              <p className="text-md font-semibold text-primary">{post.eventTitle || 'Event Details'}</p>
                              {post.eventDate && <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3"/> {new Date(post.eventDate).toLocaleString()}</p>}
                              {post.eventLocation && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3"/> {post.eventLocation}</p>}
                              {post.capacity !== undefined && post.capacity > 0 && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <UsersIcon className="h-3 w-3" /> 
                                  {Math.max(0, post.capacity - (post.attendees || 0))} seats available ({post.attendees || 0}/{post.capacity})
                                </p>
                              )}
                               {post.capacity !== undefined && post.capacity === 0 && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1"><UsersIcon className="h-3 w-3" /> Unlimited spots</p>
                               )}
                              {post.eventDate && dateIsFuture(parseISO(post.eventDate)) && ((post.attendees || 0) < (post.capacity || Infinity) || post.capacity === 0) && (
                                <Button variant="outline" size="sm" className="mt-2 text-primary border-primary hover:bg-primary/10" onClick={() => handleRegisterForEvent(post.id, post.eventTitle)}>
                                  <Ticket className="mr-1 h-4 w-4"/> Register Now
                                </Button>
                              )}
                               {post.eventDate && dateIsFuture(parseISO(post.eventDate)) && (post.attendees || 0) >= (post.capacity || 0) && post.capacity !== 0 && (
                                <Badge variant="warning">Event Full</Badge>
                              )}
                            </div>
                        </div>
                        )}
                        {post.type === 'request' && post.content && (
                          <div>
                            <p className="text-sm text-foreground whitespace-pre-line mb-2">{post.content}</p>
                            {!post.assignedTo && post.status !== 'completed' && (
                              <Button variant="outline" size="sm" className="mt-2 text-green-600 border-green-500 hover:bg-green-50" onClick={() => handleAssign(post.id, sampleUserProfile.name)}>
                                <CheckCircleIcon className="mr-1 h-4 w-4"/> Assign to Me
                              </Button>
                            )}
                          {post.assignedTo && <p className="text-xs text-muted-foreground mt-2">Assigned to: <strong>{post.assignedTo}</strong></p>}
                          {post.status && <p className="text-xs text-muted-foreground">Status: <Badge variant={post.status === 'completed' ? 'success' : post.status === 'assigned' ? 'info' : 'default'}>{post.status}</Badge></p>}
                        </div>
                        )}
                        {post.tags && post.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {post.tags.map(tag => (
                              <Badge key={tag} variant="secondary">#{tag}</Badge>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                  {post.moderationStatus !== 'removed' && (
                    <CardFooter className="border-t pt-3 flex flex-col items-start">
                        <div className="flex items-center justify-start space-x-1 w-full">
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary text-xs">
                            <ThumbsUp className="mr-1 h-3.5 w-3.5" /> Like
                            </Button>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary text-xs" onClick={() => setCommentingOnPostId(post.id === commentingOnPostId ? null : post.id)}>
                            <MessageIcon className="mr-1 h-3.5 w-3.5" /> Comment ({post.comments?.length || 0})
                            </Button>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary text-xs">
                            <Share2 className="mr-1 h-3.5 w-3.5" /> Share
                            </Button>

                            {(currentUser.role === 'admin' || (currentUser.role === 'manager' && post.tenantId === currentUser.tenantId)) ? (
                            <>
                                {post.moderationStatus === 'flagged' && (
                                <Button variant="outline" size="xs" onClick={() => handleApprovePost(post.id)} className="text-green-600 border-green-500 hover:bg-green-50 ml-auto h-7 px-2 py-1">
                                    <ShieldCheck className="mr-1 h-3 w-3" /> Approve
                                </Button>
                                )}
                                <Button variant="destructive" size="xs" onClick={() => handleRemovePost(post.id)} className={`${post.moderationStatus === 'flagged' && (currentUser.role === 'admin' || (currentUser.role === 'manager' && post.tenantId === currentUser.tenantId)) ? 'ml-1' : 'ml-auto'} h-7 px-2 py-1`}>
                                    <Trash2 className="mr-1 h-3 w-3" /> Remove
                                </Button>
                            </>
                            ) : (
                            post.userId !== currentUser.id && (
                                <Button variant="ghost" size="xs" onClick={() => handleFlagPost(post.id)} className="text-yellow-600 hover:text-yellow-700 ml-auto h-7 px-2 py-1">
                                    <Flag className="mr-1 h-3 w-3" /> Flag
                                </Button>
                            )
                            )}
                        </div>
                        {commentingOnPostId === post.id && (
                          <div className="w-full mt-3 pt-3 border-t space-y-3">
                            {post.comments && post.comments.length > 0 && (
                              <ScrollArea className="max-h-48 pr-2">
                                <div className="space-y-2.5">
                                {post.comments.map(comment => (
                                  <div key={comment.id} className="flex items-start space-x-2 p-2 bg-secondary/40 rounded-md">
                                    <Avatar className="h-7 w-7">
                                      <AvatarImage src={comment.userAvatar} alt={comment.userName} data-ai-hint="person face"/>
                                      <AvatarFallback><UserIcon className="h-3.5 w-3.5"/></AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-xs font-semibold text-foreground">{comment.userName} <span className="text-muted-foreground/70 text-[10px] ml-1">{formatDistanceToNow(parseISO(comment.timestamp), { addSuffix: true })}</span></p>
                                      <p className="text-sm mt-0.5">{comment.text}</p>
                                    </div>
                                  </div>
                                ))}
                                </div>
                              </ScrollArea>
                            )}
                            {post.comments?.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No comments yet. Be the first!</p>}
                            
                            <div className="flex items-center gap-2 pt-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={currentUser.profilePictureUrl} alt={currentUser.name} data-ai-hint="person face"/>
                                <AvatarFallback>{currentUser.name.substring(0,1)}</AvatarFallback>
                              </Avatar>
                              <Textarea 
                                placeholder="Write a comment..." 
                                value={newCommentText}
                                onChange={(e) => setNewCommentText(e.target.value)}
                                rows={1} 
                                className="flex-1 min-h-[40px] text-sm"
                              />
                              <Button size="sm" onClick={() => handleCommentSubmit(post.id)} disabled={!newCommentText.trim()}>
                                <Send className="h-4 w-4"/>
                              </Button>
                            </div>
                          </div>
                        )}
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
        <aside className="lg:col-span-1 space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary"/>Most Active Users</CardTitle>
              <CardDescription>Top contributors in the community.</CardDescription>
            </CardHeader>
            <CardContent>
              {mostActiveUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center">No active users to display yet.</p>
              ) : (
                <ul className="space-y-3">
                  {mostActiveUsers.map(user => (
                    <li key={user.id} className="flex items-center gap-3 p-2 hover:bg-secondary/30 rounded-md">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.profilePictureUrl} alt={user.name} data-ai-hint="person face"/>
                        <AvatarFallback>{user.name.substring(0,1).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500"/> {user.xpPoints || 0} XP
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
            <CardFooter>
                <Button variant="link" size="sm" asChild className="text-xs p-0">
                    <Link href="/gamification">View Full Leaderboard</Link>
                </Button>
            </CardFooter>
          </Card>
        </aside>
      </div>
    </React.Fragment>
  );
}

