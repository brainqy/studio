"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, PieChart, LineChart as RechartsLineChart, Bar, Pie, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Sector } from 'recharts';
import { Activity, Briefcase, Users, Zap, FileText, CheckCircle, Clock, Target, CalendarClock } from "lucide-react"; // Added CalendarClock
import { sampleJobApplications, sampleActivities, sampleAlumni, sampleUserProfile } from "@/lib/sample-data";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
import { useState, useCallback, useEffect, useMemo } from "react";
import { format, parseISO, isFuture, differenceInDays } from "date-fns"; // Added date-fns functions
import Link from "next/link";
import { Button } from "@/components/ui/button";


const jobApplicationStatusData = sampleJobApplications.reduce((acc, curr) => {
  const status = curr.status;
  const existing = acc.find(item => item.name === status);
  if (existing) {
    existing.value += 1;
  } else {
    acc.push({ name: status, value: 1 });
  }
  return acc;
}, [] as { name: string, value: number }[]);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']; // These are specific colors, might want to use theme variables

const renderActiveShape = (props: PieSectorDataItem) => {
  const RADIAN = Math.PI / 180;
  const { cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, startAngle, endAngle, fill, payload, percent = 0, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-semibold text-lg">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="hsl(var(--foreground))">{`${value} Applications`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="hsl(var(--muted-foreground))">
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

export default function UserDashboard() {
  const [totalResumesAnalyzed, setTotalResumesAnalyzed] = useState(0);
  const [averageMatchScore, setAverageMatchScore] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const user = sampleUserProfile;

  useEffect(() => {
    // Simulate fetching data
    setTotalResumesAnalyzed(125); // Mock data
    setAverageMatchScore(78); // Mock data
  }, []);

  const onPieEnter = useCallback((_: any, index: number) => {
    setActiveIndex(index);
  }, []);

  const matchScoreData = [
    { date: 'Jan', score: 70 },
    { date: 'Feb', score: 75 },
    { date: 'Mar', score: 80 },
    { date: 'Apr', score: 72 },
    { date: 'May', score: 85 },
    { date: 'Jun', score: 78 },
  ];

  const upcomingReminders = useMemo(() => {
    const today = new Date();
    return sampleJobApplications
      .filter(app => app.userId === user.id && app.reminderDate && isFuture(parseISO(app.reminderDate)))
      .sort((a, b) => new Date(a.reminderDate!).getTime() - new Date(b.reminderDate!).getTime())
      .slice(0, 5); // Show top 5 upcoming
  }, [user.id]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">User Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resumes Analyzed</CardTitle>
            <Zap className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResumesAnalyzed}</div>
            <p className="text-xs text-muted-foreground">+10% from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Match Score</CardTitle>
            <Target className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageMatchScore}%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Applications</CardTitle>
            <Briefcase className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleJobApplications.filter(app => app.userId === user.id).length}</div>
            <p className="text-xs text-muted-foreground">{sampleJobApplications.filter(app => app.userId === user.id && app.status === 'Interviewing').length} interviewing</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alumni Connections</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleAlumni.length}</div> {/* This should be user specific connections count */}
            <p className="text-xs text-muted-foreground">+5 new connections this week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Job Application Status</CardTitle>
            <CardDescription>Overview of your current application statuses.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={jobApplicationStatusData.filter(j => sampleJobApplications.find(sja => sja.userId === user.id && sja.status === j.name))}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                  stroke="hsl(var(--background))"
                  className="focus:outline-none"
                >
                  {jobApplicationStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Average Match Score Over Time</CardTitle>
            <CardDescription>Track your resume match score improvement.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={matchScoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8, style: { fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))' } }} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5 text-primary"/>Upcoming Reminders</CardTitle>
            <CardDescription>Follow-ups and deadlines for your job applications.</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingReminders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming reminders set.</p>
            ) : (
              <ul className="space-y-3">
                {upcomingReminders.map(app => (
                  <li key={app.id} className="p-3 bg-secondary/50 rounded-md hover:bg-secondary/70 transition-colors">
                    <Link href="/job-tracker" className="block">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-foreground">{app.jobTitle} at {app.companyName}</p>
                          <p className="text-xs text-amber-700 dark:text-amber-500">
                            Reminder: {format(parseISO(app.reminderDate!), 'MMM dd, yyyy')}
                            {differenceInDays(parseISO(app.reminderDate!), new Date()) === 0 && " (Today!)"}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs text-primary">View</Button>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
             <CardDescription>Your latest interactions on the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {sampleActivities.filter(act => act.userId === user.id).slice(0, 5).map(activity => (
                <li key={activity.id} className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-md">
                  <Activity className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{new Date(activity.timestamp).toLocaleString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}