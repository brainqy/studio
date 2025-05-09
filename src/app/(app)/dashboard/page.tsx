"use client";

import { useEffect, useState } from "react";
import { sampleUserProfile } from "@/lib/sample-data";
import type { UserRole } from "@/types";

import AdminDashboard from "@/components/dashboards/AdminDashboard";
import ManagerDashboard from "@/components/dashboards/ManagerDashboard";
import UserDashboard from "@/components/dashboards/UserDashboard";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching user role
    // In a real app, this would come from an auth context or API call
    const role = sampleUserProfile.role; 
    setUserRole(role);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-1/4" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  switch (userRole) {
    case 'admin':
      return <AdminDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    case 'user':
    default:
      return <UserDashboard />;
  }
}
