




"use client";

import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarSeparator, SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { Aperture, Award, BarChart2, BookOpen, Briefcase, Building2, CalendarDays, FileText, GalleryVerticalEnd, GitFork, Gift, Handshake, History, Home, Layers3, ListChecks, MessageSquare, Settings, ShieldAlert, ShieldQuestion, User, Users, Wallet, Zap, UserCog, BotMessageSquare, Target } from "lucide-react"; // Added Target for Affiliates
import Link from "next/link";
import { usePathname } from "next/navigation";
import { sampleUserProfile } from "@/lib/sample-data"; // Import user profile to get role and tenant

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/resume-analyzer", label: "Resume Analyzer", icon: Zap },
  { href: "/my-resumes", label: "My Resumes", icon: Layers3 },
  { href: "/resume-history", label: "Resume History", icon: History }, // Added Resume History
  { href: "/job-tracker", label: "Job Tracker", icon: Briefcase },
  {
    label: "Alumni Network",
    icon: Users,
    subItems: [
      { href: "/alumni-connect", label: "Search Alumni", icon: Users },
      { href: "/alumni-connect/recommendations", label: "Recommendations", icon: GitFork },
    ]
  },
  { href: "/job-board", label: "Job Board", icon: Aperture },
  { href: "/community-feed", label: "Community Feed", icon: MessageSquare },
  { href: "/events", label: "Events Registration", icon: CalendarDays },
  { href: "/gallery", label: "Event Gallery", icon: GalleryVerticalEnd },
  { href: "/activity-log", label: "Activity Log", icon: BarChart2 },
  { href: "/profile", label: "My Profile", icon: User },
];

const utilityItems = [
  { href: "/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/wallet", label: "Digital Wallet", icon: Wallet },
  { href: "/feature-requests", label: "Feature Requests", icon: ShieldQuestion },
  { href: "/settings", label: "Settings", icon: Settings },
];

// New Gamification Section
const gamificationItems = [
  { href: "/gamification", label: "Rewards & Badges", icon: Award },
  { href: "/referrals", label: "Referrals", icon: Gift },
  { href: "/affiliates", label: "Affiliates Program", icon: Target }, // New Affiliates link
];

// New Blog Section
const blogItems = [
  { href: "/blog", label: "Blog", icon: BookOpen },
];


const adminItems = [
   { href: "/admin/tenants", label: "Tenant Management", icon: Building2 },
   { href: "/admin/tenant-onboarding", label: "Tenant Onboarding", icon: Layers3 }, // New Tenant Onboarding link
   { href: "/admin/user-management", label: "User Management", icon: UserCog },
   { href: "/admin/gamification-rules", label: "Gamification Rules", icon: ListChecks },
   { href: "/admin/content-moderation", label: "Content Moderation", icon: ShieldAlert },
   { href: "/admin/messenger-management", label: "Messenger Mgt.", icon: BotMessageSquare },
];


export function AppSidebar() {
  const pathname = usePathname();
  const currentUser = sampleUserProfile; // Get current user details

  const renderMenuItem = (item: any, isSubItem = false) => {
    const isActive = pathname === item.href || (item.href && item.href !== "/dashboard" && pathname.startsWith(item.href));
    return (
      <SidebarMenuItem key={item.href || item.label}>
         {item.href ? (
           <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton isActive={isActive} size={isSubItem ? "sm" : "default"} className="w-full justify-start">
              <item.icon className={`h-5 w-5 ${isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/80"}`} />
              <span className={`${isActive ? "text-sidebar-primary-foreground" : ""} group-data-[collapsible=icon]:hidden`}>{item.label}</span>
            </SidebarMenuButton>
           </Link>
         ) : (
           // Handle group headers without links
           <SidebarMenuButton size={isSubItem ? "sm" : "default"} className="w-full justify-start cursor-default hover:bg-transparent">
              <item.icon className="h-5 w-5 text-sidebar-foreground/80" />
              <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
           </SidebarMenuButton>
         )}
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <FileText className="h-7 w-7 text-primary" />
          <span className="font-semibold text-lg text-sidebar-foreground group-data-[collapsible=icon]:hidden">ResumeMatch</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) =>
            item.subItems ? (
              <SidebarGroup key={item.label} className="p-0">
                {/* Render the group header itself */}
                 <SidebarMenuButton size="default" className="w-full justify-start cursor-default hover:bg-transparent">
                   <item.icon className="h-5 w-5 text-sidebar-foreground/80" />
                   <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                 </SidebarMenuButton>
                {/* Render sub-items indented */}
                <div className="pl-4 group-data-[collapsible=icon]:hidden">
                  {item.subItems.map(subItem => renderMenuItem(subItem, true))}
                </div>
              </SidebarGroup>
            ) : (
              renderMenuItem(item)
            )
          )}
        </SidebarMenu>

         {/* Gamification Section */}
        <SidebarSeparator className="my-4" />
         <SidebarGroup className="p-0">
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-xs text-sidebar-foreground/60 px-2">Engagement</SidebarGroupLabel>
          <SidebarMenu>
            {gamificationItems.map(item => renderMenuItem(item))}
            {blogItems.map(item => renderMenuItem(item))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator className="my-4" />
         <SidebarGroup className="p-0">
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-xs text-sidebar-foreground/60 px-2">Utilities</SidebarGroupLabel>
          <SidebarMenu>
            {utilityItems.map(item => renderMenuItem(item))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Admin Section */}
        {currentUser.role === 'admin' && (
          <>
            <SidebarSeparator className="my-4" />
            <SidebarGroup className="p-0">
              <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-xs text-sidebar-foreground/60 px-2">Admin Panel</SidebarGroupLabel>
              <SidebarMenu>
                {adminItems.map(item => renderMenuItem(item))}
              </SidebarMenu>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border group-data-[collapsible=icon]:justify-center">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
          <img src={currentUser.profilePictureUrl || `https://avatar.vercel.sh/${currentUser.email}.png`} alt={currentUser.name} className="w-8 h-8 rounded-full" data-ai-hint="person face" />
          <div>
            <p className="text-sm font-medium text-sidebar-foreground">{currentUser.name}</p>
            {/* Display Tenant ID or Name */}
            <p className="text-xs text-sidebar-foreground/70 flex items-center gap-1">
              <Building2 className="h-3 w-3"/> Tenant: {currentUser.tenantId}
            </p>
          </div>
        </div>
         {/* Icon-only view for footer */}
         <div className="hidden items-center gap-2 group-data-[collapsible=icon]:flex">
           <img src={currentUser.profilePictureUrl || `https://avatar.vercel.sh/${currentUser.email}.png`} alt={currentUser.name} className="w-8 h-8 rounded-full" data-ai-hint="person face" />
         </div>
      </SidebarFooter>
    </Sidebar>
  );
}
