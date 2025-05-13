
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Users, Briefcase, CheckSquare, MessageSquare, Zap, Activity, Edit3, CalendarCheck2 } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import WelcomeTourDialog from '@/components/features/WelcomeTourDialog';
import { 
    managerDashboardTourSteps, 
    sampleUserProfile, 
    samplePlatformUsers, 
    sampleResumeScanHistory, 
    sampleCommunityPosts,
    sampleAppointments, // For pending approvals example
    sampleEvents, // Changed from sampleGalleryEvents
} from "@/lib/sample-data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ResponsiveContainer, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, Legend, Bar as RechartsBar, CartesianGrid } from 'recharts';

export default function ManagerDashboard() {
  const [showManagerTour, setShowManagerTour] = useState(false);
  const currentUser = sampleUserProfile; // Assuming this is the logged-in manager
  const tenantId = currentUser.tenantId;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tourSeen = localStorage.getItem('managerDashboardTourSeen');
      if (!tourSeen) {
        setShowManagerTour(true);
      }
    }
  }, []);

  const tenantStats = useMemo(() => {
    const usersInTenant = samplePlatformUsers.filter(u => u.tenantId === tenantId);
    const resumesAnalyzedInTenant = sampleResumeScanHistory.filter(s => s.tenantId === tenantId);
    const communityPostsInTenant = sampleCommunityPosts.filter(p => p.tenantId === tenantId);
    const activeAppointments = sampleAppointments.filter(a => a.tenantId === tenantId && a.status === 'Confirmed'); // Mock logic
    const pendingEventApprovals = sampleEvents.filter(e => e.tenantId === tenantId && !(e as any).approved).length; // Mock logic, assuming 'approved' field

    return {
      activeUsers: usersInTenant.filter(u => u.lastLogin && new Date(u.lastLogin) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
      totalUsers: usersInTenant.length,
      resumesAnalyzed: resumesAnalyzedInTenant.length,
      communityPosts: communityPostsInTenant.length,
      activeAppointments: activeAppointments.length,
      pendingEventApprovals,
    };
  }, [tenantId]);
  
  const engagementChartData = [
    { name: 'Posts', count: tenantStats.communityPosts },
    { name: 'Resumes Analyzed', count: tenantStats.resumesAnalyzed },
    { name: 'Appointments', count: tenantStats.activeAppointments },
  ];


  return (
    <>
      <WelcomeTourDialog
        isOpen={showManagerTour}
        onClose={() => setShowManagerTour(false)}
        tourKey="managerDashboardTourSeen"
        steps={managerDashboardTourSteps}
        title="Welcome Manager!"
      />
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Manager Dashboard ({currentUser.currentOrganization || `Tenant ${tenantId}`})</h1>
        <p className="text-muted-foreground">Oversee your tenant's engagement, manage specific features, and track key metrics.</p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users (Tenant)</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tenantStats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">Out of {tenantStats.totalUsers} total</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resumes Analyzed (Tenant)</CardTitle>
              <Zap className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tenantStats.resumesAnalyzed}</div>
              <p className="text-xs text-muted-foreground">Total within tenant</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Community Posts (Tenant)</CardTitle>
              <MessageSquare className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tenantStats.communityPosts}</div>
              <p className="text-xs text-muted-foreground">Engagement in feed</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <CheckSquare className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tenantStats.pendingEventApprovals}</div>
              <p className="text-xs text-muted-foreground">Event requests</p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Tenant Engagement Overview</CardTitle>
            <CardDescription>Activity within your tenant.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
             <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={engagementChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={120} tick={{fontSize: 12}}/>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}/>
                    <RechartsBar dataKey="count" fill="hsl(var(--primary))" name="Activity Count" radius={[0, 4, 4, 0]} barSize={30}/>
                </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Tenant Management Actions</CardTitle>
            <CardDescription>Access tools to manage your tenant's specific settings and content.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Button asChild variant="outline">
                <Link href="/admin/user-management"> {/* This would need to be tenant-scoped in a real app */}
                    <Users className="mr-2 h-4 w-4"/> Manage Tenant Users
                </Link>
            </Button>
            <Button asChild variant="outline">
                <Link href="/admin/content-moderation"> {/* Tenant-scoped moderation */}
                    <MessageSquare className="mr-2 h-4 w-4"/>Moderate Tenant Feed
                </Link>
            </Button>
             <Button asChild variant="outline">
                <Link href="/admin/gallery-management"> {/* Tenant-scoped gallery */}
                    <Edit3 className="mr-2 h-4 w-4"/>Manage Event Gallery
                </Link>
            </Button>
             <Button asChild variant="outline">
                 {/* Link to a future tenant-specific event approval page */}
                <Link href="/events"> 
                    <CalendarCheck2 className="mr-2 h-4 w-4"/>Review Event Submissions
                </Link>
            </Button>
            {/* Add more manager-specific actions here */}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
