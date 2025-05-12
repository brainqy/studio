
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, Flame, Star, CheckCircle } from "lucide-react";
import { sampleUserProfile, sampleBadges } from "@/lib/sample-data";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import * as React from "react";
import * as LucideIcons from "lucide-react"; // Import all icons

type IconName = keyof typeof LucideIcons;

function DynamicIcon({ name, ...props }: { name: IconName } & LucideIcons.LucideProps) {
  const IconComponent = LucideIcons[name] as React.ElementType;

  if (!IconComponent) {
    // Return a default icon or null if the name is invalid
    return <LucideIcons.HelpCircle {...props} />;
  }

  return <IconComponent {...props} />;
}


export default function GamificationPage() {
  const user = sampleUserProfile;
  const badges = sampleBadges; // Use all sample badges

  // Determine which badges the user has earned
  const earnedBadges = badges.filter(badge => user.earnedBadges?.includes(badge.id));
  const notEarnedBadges = badges.filter(badge => !user.earnedBadges?.includes(badge.id));

  const xpLevel = Math.floor((user.xpPoints || 0) / 1000) + 1; // Example: 1000 XP per level
  const xpProgress = ((user.xpPoints || 0) % 1000) / 10; // Example: Progress within the current level (percentage)

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <Award className="h-8 w-8" /> Rewards & Progress
      </h1>
      <CardDescription>Track your achievements and engagement within the platform.</CardDescription>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-primary"/>XP & Level</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-4xl font-bold text-primary">{user.xpPoints || 0} XP</p>
            <p className="text-lg text-muted-foreground mb-2">Level {xpLevel}</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                   <Progress value={xpProgress} className="w-full h-3 [&>div]:bg-primary" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{(user.xpPoints || 0) % 1000} / 1000 XP to next level</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Flame className="h-5 w-5 text-primary"/>Daily Streak</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-4xl font-bold text-primary">{user.dailyStreak || 0}</p>
            <p className="text-lg text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
         <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-primary"/>Badges Earned</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-4xl font-bold text-primary">{earnedBadges.length}</p>
            <p className="text-lg text-muted-foreground">Total Badges</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Your Badges</CardTitle>
          <CardDescription>Collect badges by engaging with the platform and community.</CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {/* Earned Badges First */}
              {earnedBadges.map((badge) => (
                <Tooltip key={badge.id}>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center p-3 border rounded-lg bg-primary/10 text-center transition-transform hover:scale-105">
                      <DynamicIcon name={badge.icon as IconName} className="h-10 w-10 text-primary mb-2" />
                      <p className="text-xs font-medium text-foreground">{badge.name}</p>
                      <CheckCircle className="h-4 w-4 text-green-500 absolute top-1 right-1" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
               {/* Not Earned Badges (Grayed Out) */}
              {notEarnedBadges.map((badge) => (
                 <Tooltip key={badge.id}>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center p-3 border rounded-lg bg-secondary/50 text-center opacity-50 cursor-help">
                      <DynamicIcon name={badge.icon as IconName} className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-xs font-medium text-muted-foreground">{badge.name}</p>
                    </div>
                  </TooltipTrigger>
                   <TooltipContent>
                    <p className="font-semibold">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                     <p className="text-xs text-red-500 mt-1">(Not Yet Earned)</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

       {/* Leaderboard Placeholder */}
       <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Leaderboard (Coming Soon)</CardTitle>
                <CardDescription>See how you rank among fellow alumni based on XP points.</CardDescription>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground py-8">
                <p>Leaderboard feature is under development. Stay tuned!</p>
            </CardContent>
        </Card>
    </div>
  );
}
