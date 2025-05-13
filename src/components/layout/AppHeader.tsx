

"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, LogOut, UserCircle, Settings as SettingsIcon, Briefcase, Award, WalletCards, Layers3, BookOpen, Activity as ActivityIcon, Flame, Star, Coins, PanelLeft, History as HistoryIcon, Globe } from "lucide-react"; 
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub, 
  DropdownMenuSubTrigger, 
  DropdownMenuSubContent, 
  DropdownMenuPortal, 
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { sampleUserProfile, sampleWalletBalance } from "@/lib/sample-data";
import { useState, useEffect } from 'react'; 
import { getRecentPages } from '@/lib/recent-pages'; 
import type { RecentPageItem } from '@/types'; 
import { usePathname } from "next/navigation"; 
import AnnouncementBanner from '@/components/features/AnnouncementBanner';

export function AppHeader() {
  const { toast } = useToast();
  const user = sampleUserProfile;
  const wallet = sampleWalletBalance;
  const [recentPages, setRecentPages] = useState<RecentPageItem[]>([]);
  const pathname = usePathname(); 
  // const { t } = useTranslations('AppHeader'); // Example for next-intl

  // Mock logout function
  const handleLogout = () => {
    toast({ title: "Logged Out", description: "You have been logged out." });
    // In a real app, redirect to login: router.push('/auth/login');
  };

  useEffect(() => {
    // Load recent pages on component mount and when pathname changes
    setRecentPages(getRecentPages());
  }, [pathname]); // Depend on pathname to re-fetch when navigation occurs

  const handleLanguageChange = (lang: string) => {
    // In a real app, this would set the locale and redirect or update context
    toast({ title: "Language Switched (Mock)", description: `Language set to ${lang}. Page would reload.` });
    // Example: router.push(pathname, { locale: lang });
  };

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-10 border-b bg-card shadow-sm">
        <AnnouncementBanner /> {/* Display announcements at the very top */}
        {/* Top row for main controls */}
        <div className="flex h-16 items-center gap-4 px-4 md:px-6">
          <SidebarTrigger />
          
          <div className="flex-1">
            {/* Optionally, add a search bar or breadcrumbs here */}
          </div>
          <div className="flex items-center gap-2 sm:gap-4"> {/* Adjusted gap for smaller screens */}
            {/* Language Switcher Placeholder */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <span className="sr-only">{"AppHeader.languageSwitcherLabel"}</span> {/* Placeholder for t('languageSwitcherLabel') */}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleLanguageChange('en')}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange('es')}>Español</DropdownMenuItem>
                {/* Add more languages as needed */}
              </DropdownMenuContent>
            </DropdownMenu>

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
              <DropdownMenuContent align="end" className="w-64"> 
                <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile" passHref>
                  <DropdownMenuItem>
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                </Link>

                {/* Recent Visited Pages Sub-Menu */}
                {recentPages.length > 0 && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <HistoryIcon className="mr-2 h-4 w-4" />
                      Recent Pages
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        {recentPages.map(page => (
                          <Link href={page.path} key={page.path} passHref>
                            <DropdownMenuItem className="text-xs">
                              {page.label}
                            </DropdownMenuItem>
                          </Link>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                )}

                <DropdownMenuSeparator /> 
                
                <Link href="/job-tracker" passHref>
                  <DropdownMenuItem>
                    <Briefcase className="mr-2 h-4 w-4" />
                    Job Tracker
                  </DropdownMenuItem>
                </Link>
                <Link href="/gamification" passHref>
                  <DropdownMenuItem>
                    <Award className="mr-2 h-4 w-4" />
                    Rewards & Badges
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
