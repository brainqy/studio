"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { User, Mail, Briefcase, Sparkles, Upload, Save } from "lucide-react";
import { sampleUserProfile } from "@/lib/sample-data";
import type { UserProfile } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  bio: z.string().optional(),
  skills: z.string().optional(), // Comma-separated string for simplicity
  profilePictureUrl: z.string().url().optional().or(z.literal('')),
  resumeText: z.string().optional(),
  careerInterests: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile>(sampleUserProfile);
  const { toast } = useToast();

  const { control, handleSubmit, watch, formState: { errors, isDirty } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: userProfile.name,
      email: userProfile.email,
      bio: userProfile.bio || '',
      skills: userProfile.skills?.join(', ') || '',
      profilePictureUrl: userProfile.profilePictureUrl || '',
      resumeText: userProfile.resumeText || '',
      careerInterests: userProfile.careerInterests || '',
    }
  });

  const watchedFields = watch(); // Watch all fields for progress calculation

  const calculateProfileCompletion = () => {
    const fields = [
      watchedFields.name,
      watchedFields.email,
      watchedFields.bio,
      watchedFields.skills,
      watchedFields.profilePictureUrl, // Assuming URL means it's filled
      watchedFields.resumeText,
      watchedFields.careerInterests,
    ];
    const filledFields = fields.filter(field => field && String(field).trim() !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  const onSubmit = (data: ProfileFormData) => {
    const updatedProfile: UserProfile = {
      ...userProfile,
      ...data,
      skills: data.skills ? data.skills.split(',').map(s => s.trim()) : [],
    };
    setUserProfile(updatedProfile);
    // Here you would typically save to a backend
    console.log("Updated Profile Data:", updatedProfile);
    toast({ title: "Profile Updated", description: "Your profile information has been saved." });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">My Profile</h1>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary"/>Profile Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={profileCompletion} className="w-full h-3 [&>div]:bg-primary" />
          <p className="text-sm text-muted-foreground mt-2 text-center">{profileCompletion}% complete. Keep it up!</p>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-2 border-primary">
                  <AvatarImage src={watchedFields.profilePictureUrl || "https://picsum.photos/seed/defaultavatar/200/200"} alt={userProfile.name} data-ai-hint="person portrait"/>
                  <AvatarFallback className="text-3xl">{userProfile.name.substring(0,1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <label htmlFor="avatarUpload" className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                  <Upload className="h-8 w-8" />
                </label>
                {/* Hidden file input for avatar upload - no actual upload logic */}
                <input type="file" id="avatarUpload" className="hidden" accept="image/*" onChange={() => toast({title: "Avatar Upload", description: "Avatar upload functionality is mocked."})}/>
              </div>
              <div>
                <CardTitle className="text-2xl">{userProfile.name}</CardTitle>
                <CardDescription>{userProfile.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <Label htmlFor="name" className="flex items-center gap-1"><User className="h-4 w-4 text-muted-foreground"/>Full Name</Label>
                <Controller name="name" control={control} render={({ field }) => <Input id="name" {...field} />} />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="email" className="flex items-center gap-1"><Mail className="h-4 w-4 text-muted-foreground"/>Email Address</Label>
                <Controller name="email" control={control} render={({ field }) => <Input id="email" type="email" {...field} />} />
                 {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="bio" className="flex items-center gap-1"><Briefcase className="h-4 w-4 text-muted-foreground"/>Bio / Summary</Label>
              <Controller name="bio" control={control} render={({ field }) => <Textarea id="bio" rows={4} placeholder="Tell us about yourself..." {...field} />} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="skills" className="flex items-center gap-1"><Sparkles className="h-4 w-4 text-muted-foreground"/>Skills (comma-separated)</Label>
              <Controller name="skills" control={control} render={({ field }) => <Input id="skills" placeholder="e.g., React, Node.js, Python" {...field} />} />
            </div>
             <div className="space-y-1">
              <Label htmlFor="careerInterests" className="flex items-center gap-1"><User className="h-4 w-4 text-muted-foreground"/>Career Interests</Label>
              <Controller name="careerInterests" control={control} render={({ field }) => <Input id="careerInterests" placeholder="e.g., AI, Fintech, SaaS" {...field} />} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="resumeText" className="flex items-center gap-1"><User className="h-4 w-4 text-muted-foreground"/>Main Resume Text (for AI features)</Label>
              <Controller name="resumeText" control={control} render={({ field }) => <Textarea id="resumeText" rows={8} placeholder="Paste your primary resume text here. This will be used for personalized recommendations." {...field} />} />
            </div>
             <div className="space-y-1">
                <Label htmlFor="profilePictureUrl" className="flex items-center gap-1"><User className="h-4 w-4 text-muted-foreground"/>Profile Picture URL</Label>
                <Controller name="profilePictureUrl" control={control} render={({ field }) => <Input id="profilePictureUrl" placeholder="https://example.com/your-image.png" {...field} />} />
                {errors.profilePictureUrl && <p className="text-sm text-destructive mt-1">{errors.profilePictureUrl.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={!isDirty} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
