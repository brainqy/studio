
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Users, Settings, Activity, Building2, FileText, MessageSquare, Zap as ZapIcon, ShieldQuestion, UserPlus, Briefcase, Handshake, Mic, ListChecks } from "lucide-react"; 
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
import { ResponsiveContainer, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, Legend, Bar as RechartsBar, CartesianGrid } from 'recharts';

interface TenantActivityStats extends Tenant {
  userCount: number;
  resumesAnalyzed: number;
  communityPostsCount: number;
  jobApplicationsCount: number;
}

export default function AdminDashboard() {
  const [showAdminTour, setShowAdminTour] = useState(false);

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
      name: tenant.name.substring(0,15) + (tenant.name.length > 15 ? "..." : ""), // Shorten name for chart
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
          </CardContent>
        </Card>
      </div>
    </>
  );
}
