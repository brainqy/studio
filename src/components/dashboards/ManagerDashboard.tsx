
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Users, Briefcase, CheckSquare } from "lucide-react";
import { useEffect, useState } from "react";
import WelcomeTourDialog from '@/components/features/WelcomeTourDialog';
import { managerDashboardTourSteps } from "@/lib/sample-data";
// import { ResponsiveContainer, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';

// Sample data for charts (replace with actual data fetching)
const sampleTeamPerformanceData = [
  { name: 'Q1', tasksCompleted: 120, projectsManaged: 5 },
  { name: 'Q2', tasksCompleted: 150, projectsManaged: 6 },
  { name: 'Q3', tasksCompleted: 130, projectsManaged: 5 },
  { name: 'Q4', tasksCompleted: 160, projectsManaged: 7 },
];

export default function ManagerDashboard() {
  const [showManagerTour, setShowManagerTour] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tourSeen = localStorage.getItem('managerDashboardTourSeen');
      if (!tourSeen) {
        setShowManagerTour(true);
      }
    }
  }, []);

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
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Manager Dashboard</h1>
        <p className="text-muted-foreground">Oversee team performance, manage alumni engagement initiatives, and track key metrics.</p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Briefcase className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">3 new this month</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Managed by you</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mentorship Programs</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5 Active</div>
              <p className="text-xs text-muted-foreground">25 Mentees</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <CheckSquare className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Event requests</p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
            <CardDescription>Quarterly tasks completed and projects managed.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {/* 
            // Example of how a chart could be added.
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={sampleTeamPerformanceData}>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--chart-1))" />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--chart-2))" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}/>
                <Legend />
                <Bar yAxisId="left" dataKey="tasksCompleted" fill="hsl(var(--chart-1))" name="Tasks Completed" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="projectsManaged" fill="hsl(var(--chart-2))" name="Projects Managed" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer> 
            */}
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Team performance chart would be displayed here.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Managerial Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex space-x-4">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">Review Event Submissions</button>
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80">Assign Mentors</button>
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80">Generate Reports</button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
