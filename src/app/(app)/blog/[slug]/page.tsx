
"use client";

import { useParams } from 'next/navigation';
import { sampleBlogPosts } from '@/lib/sample-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarDays, User, Tag } from 'lucide-react';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;

  // Find the blog post by slug from sample data
  const post = sampleBlogPosts.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Post Not Found</h1>
        <p className="text-muted-foreground">The blog post you are looking for does not exist.</p>
        <Button asChild variant="link" className="mt-4">
            <Link href="/blog"><ArrowLeft className="mr-2 h-4 w-4"/>Back to Blog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 py-8">
        <Button asChild variant="outline" size="sm" className="mb-4">
            <Link href="/blog"><ArrowLeft className="mr-2 h-4 w-4"/>Back to Blog</Link>
        </Button>

      {post.imageUrl && (
        <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden shadow-lg">
          <Image
            src={post.imageUrl}
            alt={post.title}
            layout="fill"
            objectFit="cover"
            data-ai-hint="blog post image"
            priority // Prioritize loading the main image
          />
        </div>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl font-extrabold tracking-tight">{post.title}</CardTitle>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground pt-2">
            <span className="flex items-center gap-1"><User className="h-4 w-4"/> {post.author}</span>
            <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4"/> {format(parseISO(post.date), 'PPP')}</span>
             {post.tags && post.tags.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                    <Tag className="h-4 w-4"/>
                    {post.tags.map(tag => (
                         <span key={tag} className="px-2 py-0.5 text-xs bg-secondary text-secondary-foreground rounded-full">{tag}</span>
                    ))}
                </div>
             )}
          </div>
        </CardHeader>
        <Separator className="my-4" />
        <CardContent>
          {/* Basic rendering of content. For Markdown/HTML, use a library like 'react-markdown' or 'dangerouslySetInnerHTML' (with caution) */}
          <article className="prose prose-lg dark:prose-invert max-w-none text-foreground">
            {/* Example for plain text content */}
             <p className="whitespace-pre-line">{post.content}</p>

             {/* Example for Markdown (requires installing and importing react-markdown) */}
             {/* <ReactMarkdown>{post.content}</ReactMarkdown> */}
          </article>
        </CardContent>
      </Card>
    </div>
  );
}
