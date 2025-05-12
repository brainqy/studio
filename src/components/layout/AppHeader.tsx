
"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, LogOut, UserCircle, Settings as SettingsIcon, History, Briefcase, Bookmark, Award, WalletCards, Layers3, BookOpen, Activity as ActivityIcon, Flame, Star, Coins } from "lucide-react"; // Added icons
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Added Tooltip
import { useToast } from "@/hooks/use-toast"; // Added for mock logout
import { sampleUserProfile, sampleWalletBalance } from "@/lib/sample-data"; // Added sample data

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
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 shadow-sm">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex-1">
        {/* Optionally, add a search bar or breadcrumbs here */}
      </div>
      <TooltipProvider>
        <div className="flex items-center gap-4">
          {/* Gamification Stats */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="hidden sm:flex items-center gap-1 text-sm font-medium text-muted-foreground cursor-default">
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
              <div className="hidden sm:flex items-center gap-1 text-sm font-medium text-muted-foreground cursor-default">
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

          {/* Separator for visual clarity */}
           <div className="hidden sm:block h-6 w-px bg-border mx-2"></div>

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
              {/* Link to Job Tracker page for both scan history and bookmarks */}
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
      </TooltipProvider>
    </header>
  );
}
