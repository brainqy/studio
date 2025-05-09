"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Users, Settings, Activity } from "lucide-react";
// import { ResponsiveContainer, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts'; // Example chart import

// Sample data for charts (replace with actual data fetching)
const sampleUserActivityData = [
  { name: 'Jan', activeUsers: 400, newSignups: 240 },
  { name: 'Feb', activeUsers: 300, newSignups: 139 },
  { name: 'Mar', activeUsers: 200, newSignups: 980 },
  { name: 'Apr', activeUsers: 278, newSignups: 390 },
  { name: 'May', activeUsers: 189, newSignups: 480 },
  { name: 'Jun', activeUsers: 239, newSignups: 380 },
];

export default function AdminDashboard() {
  return (
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
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+50 from last week</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Activity</CardTitle>
            <Activity className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">567 Active</div>
            <p className="text-xs text-muted-foreground">In the last 24 hours</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feature Requests</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25 Pending</div>
            <p className="text-xs text-muted-foreground">3 new this week</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Settings className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Optimal</div>
            <p className="text-xs text-muted-foreground">All services running</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>User Activity Overview</CardTitle>
          <CardDescription>Monthly active users and new signups.</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px]">
          {/* 
          // Example of how a chart could be added. 
          // For this placeholder, we'll just show a message.
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={sampleUserActivityData}>
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
              <Legend />
              <Bar dataKey="activeUsers" fill="hsl(var(--chart-1))" name="Active Users" radius={[4, 4, 0, 0]} />
              <Bar dataKey="newSignups" fill="hsl(var(--chart-2))" name="New Signups" radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer> 
          */}
           <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">User activity chart would be displayed here.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex space-x-4">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">Manage Users</button>
          <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80">System Settings</button>
          <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90">View Error Logs</button>
        </CardContent>
      </Card>
    </div>
  );
}
