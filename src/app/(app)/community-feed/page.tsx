"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import React from "react"; // Added React import
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter} from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, PlusCircle, ThumbsUp, MessageCircle as MessageIcon, Share2, Send, Filter, Edit3, Calendar, MapPin } from "lucide-react";
import { sampleCommunityPosts, sampleUserProfile } from "@/lib/sample-data";
import type { CommunityPost } from "@/types";
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const postSchema = z.object({
  content: z.string().min(1, "Post content cannot be empty"),
  tags: z.string().optional(),
  type: z.enum(['text', 'poll', 'event', 'request']),
  pollOptions: z.array(z.object({ option: z.string(), votes: z.number() })).optional(),
  eventDate: z.string().optional(),
  eventLocation: z.string().optional(),
  // Fields for 'request' type
  assignedTo: z.string().optional(),
  status: z.enum(['open', 'assigned', 'completed']).optional(),

});

type PostFormData = z.infer<typeof postSchema>;

export default function CommunityFeedPage() {
  const [posts, setPosts] = useState<CommunityPost[]>(sampleCommunityPosts);
  const [filter, setFilter] = useState<'all' | 'text' | 'poll' | 'event' | 'request' | 'my_posts'>('all');
  const { toast } = useToast();

  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<PostFormData>({

    resolver: zodResolver(postSchema),
    defaultValues: {
      content: '',
      tags: '',
      type: 'text',
    }
  });

  const handleFormSubmit = (data: PostFormData) => {
    if (editingPost) {
      // Edit existing post
      // Edit existing post
      setPosts(prevPosts => prevPosts.map(p => p.id === editingPost.id
        ? {
          ...p,
          content: data.content,
          tags: data.tags?.split(',').map(tag => tag.trim()).filter(tag => tag) || [], // TODO: Clean up casting
          type: data.type as any, // TODO: Clean up casting
          pollOptions: data.type === 'poll' ? data.pollOptions : undefined,
          eventDate: data.type === 'event' ? data.eventDate : undefined,
          eventLocation: data.type === 'event' ? data.eventLocation : undefined,
        }
        : p
      ));
      toast({ title: "Post Updated", description: "Your post has been updated." });
    } else {
      // Create new post
      const newPost: CommunityPost = {
        id: String(Date.now()),
        userId: sampleUserProfile.id,
        userName: sampleUserProfile.name,
        userAvatar: sampleUserProfile.profilePictureUrl,
        timestamp: new Date().toISOString(),
        content: data.content,
        type: data.type as any, // TODO: Clean up casting
        pollOptions: data.type === 'poll' ? data.pollOptions : undefined,
        eventDate: data.type === 'event' ? data.eventDate : undefined,
        eventLocation: data.type === 'event' ? data.eventLocation : undefined,
        tags: data.tags?.split(',').map(tag => tag.trim()).filter(tag => tag) || [],
      };
      setPosts(prevPosts => [newPost, ...prevPosts]);
      toast({ title: "Post Created", description: "Your post has been added to the feed." });
    }
    setIsPostDialogOpen(false);
    reset();
    setEditingPost(null);
  };

  const handleVote = (postId: string, optionIndex: number) => {
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId && post.type === 'poll' && post.pollOptions) {
        const newPollOptions = [...post.pollOptions];
        // Find the option and increment votes
        if (newPollOptions[optionIndex]) {
          newPollOptions[optionIndex].votes += 1;
          return { ...post, pollOptions: newPollOptions };
        }
      }
      return post;
    }));
    toast({ title: "Vote Recorded", description: "Your vote has been cast." });
  };

  const handleAssign = (postId: string, userName: string) => {
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId && post.type === 'request') {
        // Check if the request is already assigned
        if (post.assignedTo) {
          toast({ title: "Already Assigned", description: "This request is already assigned to someone." });
          return post;
        }
        return { ...post, assignedTo: userName };
      }
      return post;
    }));
    toast({ title: "Request Assigned", description: "You have been assigned to this request." });
  };

  const openNewPostDialog = () => {
    setEditingPost(null);
    reset({ content: '', tags: '', type: 'text' });
    setIsPostDialogOpen(true);
  };

  const openEditPostDialog = (post: CommunityPost) => {
    setEditingPost(post);
    setValue('content', post.content || '');
    setValue('tags', post.tags?.join(', ') || '');
    setValue('type', post.type);
    if (post.type === 'poll') setValue('pollOptions', post.pollOptions);
    if (post.type === 'event') setValue('eventDate', post.eventDate);
    if (post.type === 'event') setValue('eventLocation', post.eventLocation);
    setIsPostDialogOpen(true);
  };


  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    if (filter === 'my_posts') return post.userId === sampleUserProfile.id;
    return post.type === filter;
  });

  return (
    <React.Fragment>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Community Feed</h1>
         <Button onClick={openNewPostDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" /> Create New Post
        </Button>
      </div>

      <Dialog open={isPostDialogOpen} onOpenChange={(isOpen) => {
        setIsPostDialogOpen(isOpen);
        if (!isOpen) {
          reset();
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
            {/* Dynamic Fields Based on Type */}
             <Controller
                name="type"
                control={control}
                render={({ field }) => {
                  if (field.value === 'poll') {
                    return (
                      <div>
                         {/* TODO: Implement better dynamic poll option UI */}
                        <Label>Poll Options</Label>
                        <Input placeholder="Option 1" className="mb-2"/>
                        <Input placeholder="Option 2" className="mb-2"/>
                        <Button type="button" variant="outline" size="sm" className="mt-2">
                          <PlusCircle className="mr-2 h-4 w-4"/> Add Option
                        </Button>
                      </div>
                    );
                  } else if (field.value === 'event') {
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <Label htmlFor="event-date">Event Date</Label>
                           <Controller
                            name="eventDate"
                            control={control}
                             render={({ field: eventDateField }) => (
                              <Input id="event-date" {...eventDateField} type="datetime-local" />
                             )}
                          />
                         </div>
                        <div>
                           <Label htmlFor="event-location">Event Location</Label>
                           <Controller
                             name="eventLocation"
                            control={control}
                            render={({ field: eventLocationField }) => (
                               <Input id="event-location" {...eventLocationField} placeholder="e.g., Zoom, Community Hall" />
                             )}
                           />
                        </div>
                      </div>
                    );
                  } else if (field.value === 'request') {
                     // No specific extra fields for request type in this simple version
                    return null;
                  }
                  return null;
                }}
               />
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={!!errors.content}>
                <Send className="mr-2 h-4 w-4" /> {editingPost ? "Save Changes" : "Post"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>


      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Recent Posts</h2>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <Select value={filter} onValueChange={(value: 'all' | 'text' | 'poll' | 'event' | 'request' | 'my_posts') => setFilter(value)}>
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
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredPosts.length === 0 ? (
         <Card className="text-center py-12 shadow-md">
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
            <Card key={post.id} className="shadow-md">
              <CardHeader className="flex flex-row items-start space-x-3 pb-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.userAvatar} alt={post.userName} data-ai-hint="person face"/>
                  <AvatarFallback>{post.userName.substring(0,1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{post.userName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
                    {post.type === 'poll' && <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">Poll</span>}
                    {post.type === 'request' && <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">Request</span>}
                     {post.type === 'event' && <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">Event</span>}
                  </p>
                </div>
                {post.userId === sampleUserProfile.id && (
                  <Button variant="ghost" size="icon" onClick={() => openEditPostDialog(post)}>
                    <Edit3 className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {post.type === 'text' && (
                  <p className="text-sm text-foreground whitespace-pre-line">{post.content}</p>
                )}
                {post.type === 'poll' && post.content && (
                 <div>
                  <p className="text-sm font-semibold text-foreground mb-2">{post.content}</p>
                   {/* TODO: Implement poll voting UI */}
                   {post.pollOptions?.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-1">
                        <Input type="radio" id={`poll-option-${post.id}-${index}`} name={`poll-${post.id}`} value={option.option} className="h-4 w-4 text-primary focus:ring-primary" onClick={() => handleVote(post.id, index)} />
                        <Label htmlFor={`poll-option-${post.id}-${index}`} className="text-sm text-foreground">{option.option} ({option.votes})</Label>
                      </div>
                    ))}
                 </div>
                )}
                {post.type === 'event' && post.content && (
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-2">{post.content}</p>
                    <div className="border rounded-md p-3 space-y-1">
                      <p className="text-sm font-medium">{post.eventTitle || 'Event Details'}</p> {/* Assuming eventTitle exists or use a default */}
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3"/> {post.eventDate ? new Date(post.eventDate).toLocaleString() : 'Date TBD'}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3"/> {post.eventLocation || 'Location TBD'}</p>
                    </div>
                 </div>
                )}
                {post.type === 'request' && post.content && (
                  <div>
                    <p className="text-sm text-foreground whitespace-pre-line mb-2">{post.content}</p>
                    {!post.assignedTo && (
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => handleAssign(post.id, sampleUserProfile.name)}> {/* Using sampleUserProfile.name as placeholder */}
                       Assign to Me
                      </Button>
                     )}
                   {post.assignedTo && <p className="text-xs text-muted-foreground">Assigned to: {post.assignedTo}</p>}
                 </div>
                )}
                 {post.tags && post.tags.length > 0 && (
                   <div className="mt-3 flex flex-wrap gap-2">
                     {post.tags.map(tag => (
                       <span key={tag} className="px-2 py-0.5 text-xs bg-accent text-accent-foreground rounded-full">#{tag}</span>
                     ))}
                   </div>
                 )}
              </CardContent>
              <CardFooter className="border-t pt-3 flex items-center justify-start space-x-4">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  <ThumbsUp className="mr-1 h-4 w-4" /> Like
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  <MessageIcon className="mr-1 h-4 w-4" /> Comment
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  <Share2 className="mr-1 h-4 w-4" /> Share
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
       )}
     </React.Fragment>
  );
}
