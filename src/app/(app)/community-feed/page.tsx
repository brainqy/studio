tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, PlusCircle, ThumbsUp, MessageCircle as MessageIcon, Share2, Send, Filter, Edit3 } from "lucide-react";
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
  type: z.enum(['text', 'request']),
});

type PostFormData = z.infer<typeof postSchema>;

export default function CommunityFeedPage() {
  const [posts, setPosts] = useState<CommunityPost[]>(sampleCommunityPosts);
  const [filter, setFilter] = useState<'all' | 'text' | 'request' | 'my_posts'>('all');
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
      setPosts(prevPosts => prevPosts.map(p => 
        p.id === editingPost.id 
        ? { 
            ...p, 
            content: data.content, 
            tags: data.tags?.split(',').map(tag => tag.trim()).filter(tag => tag) || [],
            type: data.type as 'text' | 'request', // Cast as Form type can be string
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
        type: data.type as 'text' | 'request',
        tags: data.tags?.split(',').map(tag => tag.trim()).filter(tag => tag) || [],
      };
      setPosts(prevPosts => [newPost, ...prevPosts]);
      toast({ title: "Post Created", description: "Your post has been added to the feed." });
    }
    setIsPostDialogOpen(false);
    reset();
    setEditingPost(null);
  };
  
  const openNewPostDialog = () => {
    setEditingPost(null);
    reset({ content: '', tags: '', type: 'text' });
    setIsPostDialogOpen(true);
  };

  const openEditPostDialog = (post: CommunityPost) => {
    setEditingPost(post);
    setValue('content', post.content);
    setValue('tags', post.tags?.join(', ') || '');
    setValue('type', post.type as 'text' | 'request');
    setIsPostDialogOpen(true);
  };


  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    if (filter === 'my_posts') return post.userId === sampleUserProfile.id;
    return post.type === filter;
  });

  return (
    <div className="space-y-8">
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
                        <SelectItem value="text">General Post</SelectItem>
                        <SelectItem value="request">Request for Help/Mentorship</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
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
          <Select value={filter} onValueChange={(value: 'all' | 'text' | 'request' | 'my_posts') => setFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter posts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Posts</SelectItem>
              <SelectItem value="text">General Posts</SelectItem>
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
                    {post.type === 'request' && <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">Request</span>}
                  </p>
                </div>
                {post.userId === sampleUserProfile.id && (
                  <Button variant="ghost" size="icon" onClick={() => openEditPostDialog(post)}>
                    <Edit3 className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground whitespace-pre-line">{post.content}</p>
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
    </div>
  );
}
