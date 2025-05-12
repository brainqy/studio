"use client";

import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, Users, Briefcase, GraduationCap, MessageSquare, Eye, CalendarDays, Coins, User as UserIcon, Mail, CalendarPlus, Brain } from "lucide-react";
import { sampleAlumni, sampleUserProfile } from "@/lib/sample-data";
import type { AlumniProfile, PreferredTimeSlot, UserProfile } from "@/types";
import { PreferredTimeSlots } from "@/types";
import { useToast } from '@/hooks/use-toast';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { personalizedConnectionRecommendations, type PersonalizedConnectionRecommendationsInput, type PersonalizedConnectionRecommendationsOutput } from '@/ai/flows/personalized-connection-recommendations';

const recommendationRequestSchema = z.object({
  careerInterests: z.string().min(10, "Please describe your career interests in at least 10 characters."),
});
type RecommendationRequestFormData = z.infer<typeof recommendationRequestSchema>;

const bookingSchema = z.object({
  purpose: z.string().min(10, "Purpose must be at least 10 characters."),
  preferredDate: z.date({ required_error: "Preferred date is required." }),
  preferredTimeSlot: z.string().min(1, "Preferred time slot is required."),
  message: z.string().optional(),
});
type BookingFormData = z.infer<typeof bookingSchema>;

export default function AlumniRecommendationsPage() {
  const { toast } = useToast();
  const currentUser = sampleUserProfile;

  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<PersonalizedConnectionRecommendationsOutput | null>(null);
  const [recommendedAlumniProfiles, setRecommendedAlumniProfiles] = useState<AlumniProfile[]>([]);
  
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [alumniToBook, setAlumniToBook] = useState<AlumniProfile | null>(null);

  const { control: recommendationFormControl, handleSubmit: handleRecommendationRequestSubmit, formState: { errors: recommendationErrors } } = useForm<RecommendationRequestFormData>({
    resolver: zodResolver(recommendationRequestSchema),
  });

  const { control: bookingControl, handleSubmit: handleBookingSubmit, reset: resetBookingForm, formState: { errors: bookingErrors } } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { purpose: '', preferredTimeSlot: PreferredTimeSlots[0], message: '' }
  });

  const constructUserProfileSummary = (profile: UserProfile): string => {
    return `
      Name: ${profile.name}
      Current Role: ${profile.currentJobTitle || 'N/A'} at ${profile.currentOrganization || 'N/A'}
      Skills: ${(profile.skills || []).join(', ') || 'N/A'}
      Bio: ${profile.bio || 'N/A'}
      Years of Experience: ${profile.yearsOfExperience || 'N/A'}
      Industry: ${profile.industry || 'N/A'}
    `.trim();
  };

  const onRecommendationRequest = async (data: RecommendationRequestFormData) => {
    setIsLoading(true);
    setRecommendations(null);
    setRecommendedAlumniProfiles([]);

    try {
      const userProfileSummary = constructUserProfileSummary(currentUser);
      const input: PersonalizedConnectionRecommendationsInput = {
        userProfile: userProfileSummary,
        careerInterests: data.careerInterests,
      };
      const result = await personalizedConnectionRecommendations(input);
      setRecommendations(result);

      if (result.suggestedConnections && result.suggestedConnections.length > 0) {
        const profiles = result.suggestedConnections
          .map(nameOrId => sampleAlumni.find(alumni => alumni.name === nameOrId || alumni.id === nameOrId))
          .filter(profile => profile !== undefined) as AlumniProfile[];
        setRecommendedAlumniProfiles(profiles);
      }
      toast({ title: "Recommendations Ready", description: "AI has suggested some connections for you." });
    } catch (error) {
      console.error("Recommendation error:", error);
      toast({ title: "Recommendation Failed", description: "Could not fetch recommendations.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const openBookingDialog = (alumni: AlumniProfile) => {
    setAlumniToBook(alumni);
    resetBookingForm({ purpose: '', preferredDate: new Date(), preferredTimeSlot: PreferredTimeSlots[0], message: '' });
    setIsBookingDialogOpen(true);
  };

  const onBookAppointmentSubmit = (data: BookingFormData) => {
    if (!alumniToBook) return;
    toast({ title: "Coins Deducted (Mock)", description: `${alumniToBook.appointmentCoinCost || 10} coins deducted.` });
    toast({ title: "Mentorship Request Sent (Mock)", description: `Request sent to ${alumniToBook.name}.` });
    setIsBookingDialogOpen(false);
  };
  
  const renderTags = (tags: string[] | undefined, maxVisible: number = 3) => {
    if (!tags || tags.length === 0) return <p className="text-xs text-muted-foreground">N/A</p>;
    const visibleTags = tags.slice(0, maxVisible);
    const remainingCount = tags.length - maxVisible;
    return (
      <div className="flex flex-wrap gap-1">
        {visibleTags.map(tag => (
          <span key={tag} className="px-2 py-0.5 text-xs bg-accent text-accent-foreground rounded-full">{tag}</span>
        ))}
        {remainingCount > 0 && (
          <span className="px-2 py-0.5 text-xs bg-accent text-accent-foreground rounded-full">+{remainingCount} more</span>
        )}
      </div>
    );
  };


  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" /> AI Mentorship Matching
          </CardTitle>
          <CardDescription>
            Tell us about your career interests, and our AI will suggest relevant alumni who might be great mentors for you.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRecommendationRequestSubmit(onRecommendationRequest)}>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="careerInterests">My Career Interests & Goals</Label>
              <Controller
                name="careerInterests"
                control={recommendationFormControl}
                render={({ field }) => (
                  <Textarea
                    id="careerInterests"
                    rows={4}
                    placeholder="e.g., Transitioning into product management, looking for guidance on scaling a startup, interested in AI ethics..."
                    {...field}
                  />
                )}
              />
              {recommendationErrors.careerInterests && <p className="text-sm text-destructive mt-1">{recommendationErrors.careerInterests.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Finding Mentors...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" /> Get Recommendations</>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {isLoading && (
        <div className="text-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-muted-foreground">AI is searching for suitable mentors...</p>
        </div>
      )}

      {recommendations && !isLoading && (
        <div className="space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>AI Reasoning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground italic">{recommendations.reasoning || "No specific reasoning provided by AI."}</p>
            </CardContent>
          </Card>

          {recommendedAlumniProfiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedAlumniProfiles.map(alumni => (
                <Card key={alumni.id} className="shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
                  <CardContent className="pt-6 flex-grow">
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={alumni.profilePictureUrl || `https://avatar.vercel.sh/${alumni.email}.png`} alt={alumni.name} data-ai-hint="person portrait" />
                        <AvatarFallback><UserIcon /></AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{alumni.name}</h3>
                        <p className="text-sm text-primary">{alumni.currentJobTitle} at {alumni.company}</p>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Mail className="h-3 w-3 mr-1" /> {alumni.email}
                        </div>
                      </div>
                    </div>
                     <div className="space-y-3 mb-4">
                        <div><h4 className="text-sm font-semibold mb-1">Skills:</h4>{renderTags(alumni.skills, 5)}</div>
                        <div><h4 className="text-sm font-semibold mb-1">Offers Help With:</h4>{renderTags(alumni.offersHelpWith, 3)}</div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1 line-clamp-2">{alumni.shortBio}</p>
                  </CardContent>
                  <CardFooter className="border-t pt-4 mt-auto flex flex-col space-y-2">
                    <div className="flex w-full justify-between items-center">
                      <Button variant="outline" size="sm" onClick={() => toast({ title: "View Profile (Mock)", description: `Viewing profile of ${alumni.name}.`})}>
                        <Eye className="mr-1 h-4 w-4" /> View Profile
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => toast({ title: "Message (Mock)", description: `Messaging ${alumni.name}.`})}>
                        <MessageSquare className="mr-1 h-4 w-4" /> Message
                      </Button>
                    </div>
                    <Button 
                        variant="default" 
                        size="sm" 
                        className="w-full bg-primary hover:bg-primary/90"
                        onClick={() => openBookingDialog(alumni)}
                      >
                        <CalendarDays className="mr-1 h-4 w-4" /> Request Mentorship ({alumni.appointmentCoinCost || 10} <Coins className="ml-1 -mr-0.5 h-3 w-3" />)
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12 shadow-md col-span-1 md:col-span-2 lg:col-span-3">
                <CardHeader>
                    <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <CardTitle className="text-2xl">No Specific Alumni Profiles Found</CardTitle>
                    <CardDescription>
                    The AI provided general recommendations, but no specific alumni profiles matched directly. Try broadening your interests.
                    </CardDescription>
                </CardHeader>
            </Card>
          )}
        </div>
      )}

      <Dialog open={isBookingDialogOpen} onOpenChange={(isOpen) => {
        setIsBookingDialogOpen(isOpen);
        if (!isOpen) setAlumniToBook(null);
      }}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Request Mentorship with {alumniToBook?.name}</DialogTitle>
            <CardDescription>Complete the form below to request a session.</CardDescription>
          </DialogHeader>
          {alumniToBook && (
            <form onSubmit={handleBookingSubmit(onBookAppointmentSubmit)} className="space-y-4 py-4">
              <div>
                <Label htmlFor="purpose">Purpose of Mentorship</Label>
                <Controller name="purpose" control={bookingControl} render={({ field }) => <Textarea id="purpose" placeholder="e.g., Career advice, Specific skill guidance..." {...field} />} />
                {bookingErrors.purpose && <p className="text-sm text-destructive mt-1">{bookingErrors.purpose.message}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preferredDate">Preferred Date</Label>
                  <Controller name="preferredDate" control={bookingControl} render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />} />
                  {bookingErrors.preferredDate && <p className="text-sm text-destructive mt-1">{bookingErrors.preferredDate.message}</p>}
                </div>
                <div>
                  <Label htmlFor="preferredTimeSlot">Preferred Time Slot</Label>
                  <Controller name="preferredTimeSlot" control={bookingControl} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="preferredTimeSlot"><SelectValue placeholder="Select a time slot" /></SelectTrigger>
                      <SelectContent>
                        {PreferredTimeSlots.map(slot => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )} />
                  {bookingErrors.preferredTimeSlot && <p className="text-sm text-destructive mt-1">{bookingErrors.preferredTimeSlot.message}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="message">Brief Message (Optional)</Label>
                <Controller name="message" control={bookingControl} render={({ field }) => <Textarea id="message" placeholder="Any additional details for your request." rows={3} {...field} />} />
              </div>
              <p className="text-sm text-muted-foreground">
                A fee of <strong className="text-primary">{alumniToBook.appointmentCoinCost || 10} coins</strong> will be deducted upon confirmation.
              </p>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <CalendarPlus className="mr-2 h-4 w-4"/> Request Mentorship
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
