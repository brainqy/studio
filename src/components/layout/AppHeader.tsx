
"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, LogOut, UserCircle, Settings as SettingsIcon, History, Briefcase, Bookmark, Award, WalletCards, Layers3, BookOpen, Activity as ActivityIcon, Flame, Star, Coins, PanelLeft } from "lucide-react"; // Added PanelLeft for consistency if needed, though SidebarTrigger uses its own
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { sampleUserProfile, sampleWalletBalance } from "@/lib/sample-data";

export function AppHeader() {
  const { toast } = useToast();
  const user = sampleUserProfile;
  const wallet = sampleWalletBalance;

  // Mock logout function
  const handleLogout = () => {
    toast({ title: "Logged Out", description: "You have been logged out." });
    // In a real app, redirect to login: router.push('/auth/login');
  };

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-10 border-b bg-card shadow-sm">
        {/* Top row for main controls */}
        <div className="flex h-16 items-center gap-4 px-4 md:px-6">
          {/* SidebarTrigger is now always visible */}
          <SidebarTrigger />
          
          <div className="flex-1">
            {/* Optionally, add a search bar or breadcrumbs here */}
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="sr-only">Notifications</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profilePictureUrl || "https://picsum.photos/seed/useravatar/100/100"} alt={user.name} data-ai-hint="person portrait" />
                    <AvatarFallback>{user.name?.substring(0,1).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile" passHref>
                  <DropdownMenuItem>
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                </Link>
                <Link href="/job-tracker" passHref>
                  <DropdownMenuItem>
                    <History className="mr-2 h-4 w-4" />
                    Scan History & Bookmarks
                  </DropdownMenuItem>
                </Link>
                <Link href="/job-tracker" passHref>
                  <DropdownMenuItem>
                    <Briefcase className="mr-2 h-4 w-4" />
                    Job Tracker
                  </DropdownMenuItem>
                </Link>
                <Link href="/gamification" passHref>
                  <DropdownMenuItem>
                    <Award className="mr-2 h-4 w-4" />
                    Badges
                  </DropdownMenuItem>
                </Link>
                <Link href="/wallet" passHref>
                  <DropdownMenuItem>
                    <WalletCards className="mr-2 h-4 w-4" />
                    Wallet
                  </DropdownMenuItem>
                </Link>
                <Link href="/my-resumes" passHref>
                  <DropdownMenuItem>
                    <Layers3 className="mr-2 h-4 w-4" />
                    Resume Manager
                  </DropdownMenuItem>
                </Link>
                <Link href="/settings" passHref>
                  <DropdownMenuItem>
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                </Link>
                <Link href="/blog" passHref>
                  <DropdownMenuItem>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Blog
                  </DropdownMenuItem>
                </Link>
                <Link href="/activity-log" passHref>
                  <DropdownMenuItem>
                    <ActivityIcon className="mr-2 h-4 w-4" />
                    Activity
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Bottom row for gamification stats */}
        {/* This div contains the gamification stats, styled as a sub-bar */}
        <div className="hidden sm:flex h-10 items-center justify-end gap-4 border-t bg-secondary/30 px-4 md:px-6">
           <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground cursor-default">
                <Flame className="h-5 w-5 text-orange-500" />
                <span>{user.dailyStreak || 0}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Daily Login Streak</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground cursor-default">
                <Star className="h-5 w-5 text-yellow-500" />
                <span>{user.xpPoints || 0} XP</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total Experience Points</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
             <TooltipTrigger asChild>
                <Link href="/wallet" passHref>
                  <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground cursor-pointer hover:text-primary transition-colors">
                    <Coins className="h-5 w-5 text-green-500" />
                    <span>{wallet.coins || 0}</span>
                  </div>
                 </Link>
            </TooltipTrigger>
             <TooltipContent>
              <p>Coin Balance</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </header>
    </TooltipProvider>
  );
}
