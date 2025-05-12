"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Crown, Medal, Star, UserCircle, Trophy } from "lucide-react";
import { samplePlatformUsers } from "@/lib/sample-data";
import type { UserProfile } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button"; // For potential pagination

export default function LeaderboardPage() {
  const [leaderboardUsers, setLeaderboardUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    // Sort users by XP points in descending order
    // Filter out users with no XP or undefined XP for cleaner display
    const sortedUsers = [...samplePlatformUsers]
      .filter(user => typeof user.xpPoints === 'number' && user.xpPoints > 0)
      .sort((a, b) => (b.xpPoints || 0) - (a.xpPoints || 0));
    setLeaderboardUsers(sortedUsers);
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Star className="h-5 w-5 text-orange-400" />;
    return <span className="text-sm font-medium w-5 text-center">{rank}</span>;
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Trophy className="h-16 w-16 text-primary mx-auto mb-3" />
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Leaderboard</h1>
        <p className="text-xl text-muted-foreground mt-2">See who's leading the charge in engagement and achievements!</p>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>Ranking based on XP (Experience Points) earned.</CardDescription>
        </CardHeader>
        <CardContent>
          {leaderboardUsers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Leaderboard data is currently unavailable. Check back soon!</p>
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
                {leaderboardUsers.slice(0, 20).map((user, index) => ( // Display top 20 for example
                  <TableRow key={user.id} className={cn(index < 3 && "bg-secondary/50 font-semibold")}>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center h-full">
                        {getRankIcon(index + 1)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.profilePictureUrl} alt={user.name} data-ai-hint="person face"/>
                          <AvatarFallback>
                            {user.name ? user.name.substring(0, 1).toUpperCase() : <UserCircle />}
                          </AvatarFallback>
                        </Avatar>
                        <span className={cn("font-medium", index < 3 && "text-primary")}>{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-lg">
                      {user.xpPoints?.toLocaleString() || 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {leaderboardUsers.length > 20 && (
            <div className="mt-6 text-center">
              <Button variant="outline">View More (Coming Soon)</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

