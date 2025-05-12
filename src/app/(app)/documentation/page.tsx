
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookText, Code2, Share2 } from "lucide-react";

export default function DocumentationPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <BookText className="h-8 w-8" /> Documentation
      </h1>
      <CardDescription>
        Welcome to the ResumeMatch AI documentation. Here you'll find details about our platform's features and API.
      </CardDescription>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Share2 className="h-6 w-6 text-primary"/>Platform Features</CardTitle>
          <CardDescription>Overview of key features and how to use them.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="feature-resume-analyzer">
              <AccordionTrigger className="text-lg">Resume Analyzer</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>The Resume Analyzer uses AI to compare your resume against a job description. It provides a match score, highlights matching and missing skills, and offers suggestions for improvement.</p>
                <p><strong>How to use:</strong> Navigate to the "Resume Analyzer" page, upload or select your resume, paste the job description, and click "Analyze".</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="feature-job-tracker">
              <AccordionTrigger className="text-lg">Job Tracker</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>The Job Tracker helps you manage your job applications in a Kanban-style board. You can track applications through stages like "Saved", "Applied", "Interview", and "Offer".</p>
                <p><strong>How to use:</strong> Add new job applications, move them between columns as your status changes, and add notes or relevant documents.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="feature-alumni-connect">
              <AccordionTrigger className="text-lg">Alumni Connect</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>Connect with fellow alumni for networking, mentorship, or collaboration. Search the directory, view profiles, and request appointments.</p>
                <p><strong>How to use:</strong> Use filters to find alumni by skills, company, or interests. View profiles and use coins to book appointments.</p>
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="feature-community-feed">
              <AccordionTrigger className="text-lg">Community Feed</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>Engage with the community by sharing updates, asking questions, creating polls, or posting events and requests.</p>
                <p><strong>How to use:</strong> Create new posts, interact with existing ones by liking or commenting. Admins can moderate content.</p>
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="feature-gamification">
              <AccordionTrigger className="text-lg">Gamification (XP, Badges, Wallet)</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>Earn XP points and badges by engaging with platform features. Your daily login streak also contributes to your progress.</p>
                <p>Use your digital wallet (coins) to book appointments or access premium features. Coins can be earned through referrals or specific achievements.</p>
                <p><strong>How to use:</strong> Participate actively on the platform to earn rewards. Check the "Rewards & Progress" and "Digital Wallet" pages for your status.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Code2 className="h-6 w-6 text-primary"/>API Documentation (Placeholder)</CardTitle>
          <CardDescription>Information for developers looking to integrate with ResumeMatch AI.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Our API documentation is currently under development. Please check back soon for details on available endpoints, authentication, and usage guidelines.
          </p>
          <div className="mt-4 space-y-2">
            <h4 className="font-semibold">Anticipated API Features:</h4>
            <ul className="list-disc list-inside text-muted-foreground text-sm">
              <li>User Authentication API</li>
              <li>Resume Submission & Analysis API</li>
              <li>Job Posting API</li>
              <li>Community Feed Interaction API</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
