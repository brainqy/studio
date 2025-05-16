
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, Flame, Star, CheckCircle, Trophy, UserCircle } from "lucide-react"; 
import { sampleUserProfile, sampleBadges, samplePlatformUsers } from "@/lib/sample-data"; 
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import * as React from "react";
import * as LucideIcons from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect, useMemo } from "react"; 

type IconName = keyof typeof LucideIcons;

function DynamicIcon({ name, ...props }: { name: IconName } & LucideIcons.LucideProps) {
  const IconComponent = LucideIcons[name] as React.ElementType;

  if (!IconComponent) {
    return <LucideIcons.HelpCircle {...props} />;
  }

  return <IconComponent {...props} />;
}


export default function GamificationPage() {
  const user = sampleUserProfile;
  const badges = sampleBadges;

  const earnedBadges = badges.filter(badge => user.earnedBadges?.includes(badge.id));
  const notEarnedBadges = badges.filter(badge => !user.earnedBadges?.includes(badge.id));

  const xpLevel = Math.floor((user.xpPoints || 0) / 1000) + 1;
  const xpProgress = ((user.xpPoints || 0) % 1000) / 10;

  const [leaderboardUsers, setLeaderboardUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const sortedUsers = [...samplePlatformUsers]
      .filter(u => typeof u.xpPoints === 'number' && u.xpPoints > 0)
      .sort((a, b) => (b.xpPoints || 0) - (a.xpPoints || 0));
    setLeaderboardUsers(sortedUsers.slice(0, 10)); // Show top 10
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Award className="h-5 w-5 text-gray-400" />; 
    if (rank === 3) return <Star className="h-5 w-5 text-orange-400" />; 
    return <span className="text-sm font-medium w-5 text-center">{rank}</span>;
  };

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
                    {badge.xpReward && <p className="text-xs text-yellow-500">+{badge.xpReward} XP</p>}
                  </TooltipContent>
                </Tooltip>
              ))}
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
                    {badge.xpReward && <p className="text-xs text-yellow-500">+{badge.xpReward} XP</p>}
                     <p className="text-xs text-red-500 mt-1">(Not Yet Earned)</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

       <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Trophy className="h-6 w-6 text-primary"/>Leaderboard</CardTitle>
                <CardDescription>See how you rank among fellow alumni based on XP points (Top 10 shown).</CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboardUsers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Leaderboard data is currently being calculated. Check back soon!</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px] text-center">Rank</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead className="text-right">XP Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboardUsers.map((lbUser, index) => (
                      <TableRow key={lbUser.id} className={cn(index < 3 && "bg-secondary/50 font-semibold", lbUser.id === user.id && "bg-primary/10 border-l-2 border-primary")}>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center h-full">
                            {getRankIcon(index + 1)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={lbUser.profilePictureUrl} alt={lbUser.name} data-ai-hint="person face"/>
                              <AvatarFallback>
                                {lbUser.name ? lbUser.name.substring(0, 1).toUpperCase() : <UserCircle />}
                              </AvatarFallback>
                            </Avatar>
                            <span className={cn("font-medium", index < 3 && "text-primary")}>{lbUser.name} {lbUser.id === user.id && "(You)"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg">
                          {lbUser.xpPoints?.toLocaleString() || 0}
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

