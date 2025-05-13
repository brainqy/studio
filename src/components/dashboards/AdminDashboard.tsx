
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Users, Settings, Activity, Building2, FileText, MessageSquare, Zap as ZapIcon, ShieldQuestion, UserPlus, Briefcase, Handshake, Mic, ListChecks, Clock, TrendingUp, Megaphone } from "lucide-react"; 
import { useEffect, useState, useMemo } from "react";
import WelcomeTourDialog from '@/components/features/WelcomeTourDialog';
import { 
  adminDashboardTourSteps, 
  sampleTenants, 
  sampleCommunityPosts, 
  sampleJobApplications, 
  sampleAlumni, 
  sampleMockInterviewSessions, 
  sampleUserProfile,
  sampleResumeScanHistory,
  samplePlatformUsers
} from "@/lib/sample-data"; 
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Tenant } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, Legend, Bar as RechartsBar, CartesianGrid, LineChart, Line } from 'recharts';

interface TenantActivityStats extends Tenant {
  userCount: number;
  resumesAnalyzed: number;
  communityPostsCount: number;
  jobApplicationsCount: number;
}

// Mock data for time spent stats
const mockTimeSpentData = {
  averageSessionDuration: 25.5, // minutes
  topFeaturesByTime: [
    { name: "Resume Analyzer", time: 1200 }, // minutes
    { name: "Community Feed", time: 950 },
    { name: "Job Tracker", time: 800 },
    { name: "Alumni Connect", time: 700 },
    { name: "Profile Editing", time: 600 },
  ],
  // Unified platformUsageData, labels will change based on period selection
  platformUsageData: {
    weekly: [
      { periodLabel: "Week 1", hours: 150 },
      { periodLabel: "Week 2", hours: 180 },
      { periodLabel: "Week 3", hours: 165 },
      { periodLabel: "Week 4", hours: 200 },
    ],
    monthly: [
      { periodLabel: "Jan", hours: 650 },
      { periodLabel: "Feb", hours: 700 },
      { periodLabel: "Mar", hours: 680 },
      { periodLabel: "Apr", hours: 720 },
    ],
  },
  topUsersByTime: samplePlatformUsers.slice(0,5).map((user, idx) => ({
    name: user.name,
    time: Math.floor(Math.random() * 20) + 5, // Random hours between 5 and 25
  })).sort((a,b) => b.time - a.time),
};


export default function AdminDashboard() {
  const [showAdminTour, setShowAdminTour] = useState(false);
  const [usagePeriod, setUsagePeriod] = useState<'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tourSeen = localStorage.getItem('adminDashboardTourSeen');
      if (!tourSeen) {
        setShowAdminTour(true);
      }
    }
  }, []);

  const platformStats = useMemo(() => {
    const totalUsers = samplePlatformUsers.length;
    const activeUsersToday = samplePlatformUsers.filter(u => u.lastLogin && new Date(u.lastLogin) >= new Date(Date.now() - 24 * 60 * 60 * 1000)).length;
    const newSignupsThisWeek = samplePlatformUsers.filter(u => u.createdAt && new Date(u.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
    const totalResumesAnalyzed = sampleResumeScanHistory.length;
    const totalJobApplications = sampleJobApplications.length;
    const totalCommunityPosts = sampleCommunityPosts.length;
    const totalAlumniConnections = sampleAlumni.length * 5; // Mock
    const totalMockInterviews = sampleMockInterviewSessions.length;

    return {
      totalUsers,
      activeUsersToday,
      newSignupsThisWeek,
      totalResumesAnalyzed,
      totalJobApplications,
      totalCommunityPosts,
      totalAlumniConnections,
      totalMockInterviews,
    };
  }, []);

  const tenantActivityData = useMemo((): TenantActivityStats[] => {
    return sampleTenants.map(tenant => {
      const usersInTenant = samplePlatformUsers.filter(u => u.tenantId === tenant.id);
      const resumesAnalyzedInTenant = sampleResumeScanHistory.filter(s => s.tenantId === tenant.id);
      const communityPostsInTenant = sampleCommunityPosts.filter(p => p.tenantId === tenant.id);
      const jobApplicationsInTenant = sampleJobApplications.filter(j => j.tenantId === tenant.id);
      return {
        ...tenant,
        userCount: usersInTenant.length,
        resumesAnalyzed: resumesAnalyzedInTenant.length,
        communityPostsCount: communityPostsInTenant.length,
        jobApplicationsCount: jobApplicationsInTenant.length,
      };
    });
  }, []);
  
  const chartData = tenantActivityData.map(tenant => ({
      name: tenant.name.substring(0,15) + (tenant.name.length > 15 ? "..." : ""), 
      Users: tenant.userCount,
      Resumes: tenant.resumesAnalyzed,
      Posts: tenant.communityPostsCount,
  }));


  return (
    <>
      <WelcomeTourDialog
        isOpen={showAdminTour}
        onClose={() => setShowAdminTour(false)}
        tourKey="adminDashboardTourSeen"
        steps={adminDashboardTourSteps}
        title="Welcome Admin!"
      />
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users, system settings, and view overall platform statistics.</p>

        {/* Promotional Spotlight Card */}
        <Card className="shadow-lg md:col-span-2 lg:col-span-4 bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-primary"/>Promotional Spotlight</CardTitle>
            <CardDescription>Feature new updates, offers, or important announcements here.</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-10">
            <p className="text-muted-foreground">Promotional content can be displayed here. This area can highlight new features, upcoming webinars, special offers for tenants, or platform achievements.</p>
            <Button className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">Learn More</Button>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformStats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">+{platformStats.newSignupsThisWeek} new this week</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
              <Building2 className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sampleTenants.length}</div>
              <p className="text-xs text-muted-foreground">Active Tenants</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resumes Analyzed</CardTitle>
              <FileText className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformStats.totalResumesAnalyzed}</div>
              <p className="text-xs text-muted-foreground">+200 this week</p>
            </CardContent>
          </Card>
           <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Community Posts</CardTitle>
              <MessageSquare className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformStats.totalCommunityPosts}</div>
              <p className="text-xs text-muted-foreground">+15 new today</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Activity</CardTitle>
              <Activity className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformStats.activeUsersToday} Active Today</div>
              <p className="text-xs text-muted-foreground">Users active in last 24 hours</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Job Applications</CardTitle>
              <Briefcase className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformStats.totalJobApplications}</div>
              <p className="text-xs text-muted-foreground">Total tracked applications</p>
            </CardContent>
          </Card>
           <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alumni Connections Made</CardTitle>
              <Handshake className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformStats.totalAlumniConnections}</div>
              <p className="text-xs text-muted-foreground">Total platform connections</p>
            </CardContent>
          </Card>
           <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mock Interviews</CardTitle>
              <Mic className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformStats.totalMockInterviews}</div>
              <p className="text-xs text-muted-foreground">Completed AI sessions</p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Tenant Activity Overview</CardTitle>
            <CardDescription>Key engagement metrics per tenant.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
             <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-30} textAnchor="end" height={70} interval={0} tick={{fontSize: 10}}/>
                  <YAxis allowDecimals={false}/>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                  <Legend wrapperStyle={{fontSize: "12px"}}/>
                  <RechartsBar dataKey="Users" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  <RechartsBar dataKey="Resumes" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Resumes Analyzed"/>
                  <RechartsBar dataKey="Posts" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} name="Community Posts"/>
                </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Time Spent Statistics Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary"/>Time Spent Statistics</CardTitle>
            <CardDescription>Insights into user engagement time.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-secondary/30">
                    <CardHeader className="pb-2"><CardTitle className="text-base">Avg. Session Duration</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold text-primary">{mockTimeSpentData.averageSessionDuration} min</p></CardContent>
                </Card>
                 <Card className="bg-secondary/30">
                    <CardHeader className="pb-2">
                        <Tabs value={usagePeriod} onValueChange={(value) => setUsagePeriod(value as 'weekly' | 'monthly')} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-2 h-8">
                                <TabsTrigger value="weekly" className="text-xs py-1">Weekly</TabsTrigger>
                                <TabsTrigger value="monthly" className="text-xs py-1">Monthly</TabsTrigger>
                            </TabsList>
                             <CardTitle className="text-base">Total {usagePeriod.charAt(0).toUpperCase() + usagePeriod.slice(1)} Platform Usage</CardTitle>
                        </Tabs>
                    </CardHeader>
                    <CardContent className="h-[100px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mockTimeSpentData.platformUsageData[usagePeriod]} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5}/>
                                <XAxis dataKey="periodLabel" tick={{fontSize: 10}}/>
                                <YAxis tick={{fontSize: 10}}/>
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: '12px', padding: '4px 8px' }}/>
                                <Line type="monotone" dataKey="hours" stroke="hsl(var(--primary))" strokeWidth={2} dot={{r:3}}/>
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="bg-secondary/30 md:col-span-2 lg:col-span-1">
                    <CardHeader className="pb-2"><CardTitle className="text-base">Top Users (Weekly)</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="space-y-1 text-xs">
                            {mockTimeSpentData.topUsersByTime.map(user => (
                                <li key={user.name} className="flex justify-between">
                                    <span>{user.name}</span>
                                    <span className="font-semibold">{user.time} hrs</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
            <div>
                <h4 className="font-semibold text-md mb-2">Most Used Features (by time)</h4>
                <div className="space-y-2">
                    {mockTimeSpentData.topFeaturesByTime.map(feature => (
                        <div key={feature.name} className="text-sm">
                            <div className="flex justify-between mb-0.5">
                                <span>{feature.name}</span>
                                <span className="text-muted-foreground">{Math.round(feature.time / 60)} hrs</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5">
                                <div className="bg-primary h-1.5 rounded-full" style={{width: `${(feature.time / mockTimeSpentData.topFeaturesByTime[0].time) * 100}%`}}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </CardContent>
        </Card>


        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Admin Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <Button asChild variant="outline"><Link href="/admin/user-management"><Users className="mr-2 h-4 w-4"/>Manage Users</Link></Button>
            <Button asChild variant="outline"><Link href="/admin/platform-settings"><Settings className="mr-2 h-4 w-4"/>Platform Settings</Link></Button>
            <Button asChild variant="outline"><Link href="/admin/tenants"><Building2 className="mr-2 h-4 w-4"/>Manage Tenants</Link></Button>
            <Button asChild variant="outline"><Link href="/admin/content-moderation"><MessageSquare className="mr-2 h-4 w-4"/>Content Moderation</Link></Button>
            <Button asChild variant="outline"><Link href="/admin/gamification-rules"><ListChecks className="mr-2 h-4 w-4"/>Gamification Rules</Link></Button>
            <Button asChild variant="outline"><Link href="/admin/blog-settings"><FileText className="mr-2 h-4 w-4"/>Blog Settings</Link></Button>
            <Button asChild variant="outline"><Link href="/admin/analytics/user-activity"><TrendingUp className="mr-2 h-4 w-4"/>User Activity Analytics</Link></Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

