"use client";

import { useState, type FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GitFork, Lightbulb, Loader2, UserCheck, MessageSquare } from "lucide-react";
import { personalizedConnectionRecommendations, type PersonalizedConnectionRecommendationsOutput } from '@/ai/flows/personalized-connection-recommendations';
import { useToast } from '@/hooks/use-toast';
import { sampleUserProfile, sampleAlumni } from '@/lib/sample-data'; // Using sample data for profile and alumni pool

export default function AlumniRecommendationsPage() {
  const [userProfileText, setUserProfileText] = useState(sampleUserProfile.resumeText || ''); // Pre-fill with sample user profile
  const [careerInterests, setCareerInterests] = useState(sampleUserProfile.careerInterests || ''); // Pre-fill
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<PersonalizedConnectionRecommendationsOutput | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!userProfileText) {
      toast({ title: "Error", description: "Please provide your profile information.", variant: "destructive" });
      return;
    }
    if (!careerInterests) {
      toast({ title: "Error", description: "Please specify your career interests.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setRecommendations(null);

    try {
      const result = await personalizedConnectionRecommendations({ 
        userProfile: userProfileText, 
        careerInterests: careerInterests 
      });
      setRecommendations(result);
      toast({ title: "Recommendations Ready", description: "AI has generated connection suggestions." });
    } catch (error) {
      console.error("Recommendation error:", error);
      toast({ title: "Recommendation Failed", description: "An error occurred while generating recommendations.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendMessage = (alumniName: string) => {
    toast({
      title: "Message Sent (Mock)",
      description: `Your message to ${alumniName} has been sent. This is a mocked feature.`,
    });
  };

  // Helper to find full alumni profile from sample data based on name
  const findAlumniByName = (name: string) => {
    return sampleAlumni.find(a => a.name.toLowerCase() === name.toLowerCase());
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <GitFork className="h-8 w-8 text-primary" /> Personalized Alumni Recommendations
          </CardTitle>
          <CardDescription>Tell us about yourself and your career goals to get AI-driven connection suggestions.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="user-profile" className="text-lg font-medium">Your Profile / Resume Snippet</Label>
              <Textarea
                id="user-profile"
                placeholder="Paste a summary of your skills, experience, or your resume text..."
                value={userProfileText}
                onChange={(e) => setUserProfileText(e.target.value)}
                rows={8}
                className="border-input focus:ring-primary"
              />
            </div>
            <div>
              <Label htmlFor="career-interests" className="text-lg font-medium">Your Career Interests</Label>
              <Input
                id="career-interests"
                placeholder="e.g., Software Engineering, AI in Healthcare, Product Management"
                value={careerInterests}
                onChange={(e) => setCareerInterests(e.target.value)}
                className="border-input focus:ring-primary"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                "Get Recommendations"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {isLoading && (
        <div className="text-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-muted-foreground">Finding the best connections for you...</p>
        </div>
      )}

      {recommendations && !isLoading && (
        <Card className="shadow-xl mt-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <UserCheck className="h-7 w-7 text-primary" /> Suggested Connections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {recommendations.suggestedConnections.length === 0 ? (
              <p className="text-muted-foreground">No specific recommendations found based on your input. Try refining your profile or interests.</p>
            ) : (
              <>
                <div className="p-4 bg-accent/30 rounded-md">
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary"/>AI Reasoning:</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{recommendations.reasoning}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendations.suggestedConnections.map((name, index) => {
                    const alumniDetails = findAlumniByName(name); // Get full details
                    return (
                      <Card key={index} className="shadow-md">
                         <CardContent className="pt-6">
                          {alumniDetails ? (
                            <>
                            <div className="flex items-center space-x-4 mb-3">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={alumniDetails.profilePictureUrl} alt={alumniDetails.name} data-ai-hint="person face"/>
                                <AvatarFallback>{alumniDetails.name.substring(0,1).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="text-md font-semibold text-foreground">{alumniDetails.name}</h3>
                                <p className="text-xs text-primary">{alumniDetails.currentJobTitle}</p>
                                <p className="text-xs text-muted-foreground">{alumniDetails.company}</p>
                              </div>
                            </div>
                             <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{alumniDetails.shortBio}</p>
                             <Button size="sm" onClick={() => handleSendMessage(alumniDetails.name)} className="w-full">
                               <MessageSquare className="mr-2 h-4 w-4" /> Connect
                             </Button>
                            </>
                          ) : (
                             <div className="flex items-center space-x-4">
                                <Avatar className="h-12 w-12">
                                  <AvatarFallback>{name.substring(0,1).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="text-md font-semibold text-foreground">{name}</h3>
                                  <p className="text-xs text-muted-foreground">Details not found in sample data.</p>
                                </div>
                              </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
