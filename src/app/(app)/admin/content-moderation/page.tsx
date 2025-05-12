
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShieldAlert, CheckCircle, Trash2, Eye } from "lucide-react";
import { sampleCommunityPosts, sampleUserProfile } from "@/lib/sample-data";
import type { CommunityPost } from "@/types";
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function ContentModerationPage() {
  // In a real app, posts state would be managed globally or fetched.
  // For this example, we use a local state derived from sample data.
  // Actions here are mocked with toasts; actual state changes should occur on CommunityFeedPage or via a shared service.
  const [posts, setPosts] = useState<CommunityPost[]>(sampleCommunityPosts);
  const { toast } = useToast();

  const flaggedPosts = useMemo(() => {
    return posts.filter(post => post.moderationStatus === 'flagged');
  }, [posts]);

  // Mock actions for this page as direct state manipulation is complex without global state
  const handleApprove = (postId: string) => {
    // This would ideally update the central posts state.
    // For now, we filter it out from this view and show a toast.
    setPosts(prev => prev.map(p => p.id === postId ? {...p, moderationStatus: 'visible', flagCount: 0} : p));
    toast({ title: "Post Approved (Mock)", description: "Post marked as visible. Refresh Community Feed to see changes." });
  };

  const handleRemove = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? {...p, moderationStatus: 'removed'} : p));
    toast({ title: "Post Removed (Mock)", description: "Post marked as removed. Refresh Community Feed to see changes.", variant: "destructive" });
  };


  if (sampleUserProfile.role !== 'admin') {
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

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <ShieldAlert className="h-8 w-8" /> Content Moderation
      </h1>
      <CardDescription>Review and manage posts flagged by users or AI.</CardDescription>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Flagged Posts for Review</CardTitle>
        </CardHeader>
        <CardContent>
          {flaggedPosts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No posts are currently flagged for review.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Author</TableHead>
                  <TableHead>Content Snippet</TableHead>
                  <TableHead>Flag Count</TableHead>
                  <TableHead>Date Flagged</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flaggedPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={post.userAvatar} alt={post.userName} data-ai-hint="person face"/>
                          <AvatarFallback>{post.userName.substring(0,1)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{post.userName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{post.content?.substring(0,100) || "N/A"}...</TableCell>
                    <TableCell className="text-center">{post.flagCount}</TableCell>
                    <TableCell>{formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/community-feed#post-${post.id}`} title="View on Feed (feature in development)">
                           <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleApprove(post.id)} className="text-green-600 border-green-600 hover:bg-green-50">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleRemove(post.id)}>
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
