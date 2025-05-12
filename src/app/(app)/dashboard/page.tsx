
"use client";

import { useEffect, useState } from "react";
import { sampleUserProfile } from "@/lib/sample-data";
import type { UserRole } from "@/types";

import AdminDashboard from "@/components/dashboards/AdminDashboard";
import ManagerDashboard from "@/components/dashboards/ManagerDashboard";
import UserDashboard from "@/components/dashboards/UserDashboard";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import DailyStreakPopup from "@/components/features/DailyStreakPopup"; // Import the new popup

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStreakPopup, setShowStreakPopup] = useState(false);

  useEffect(() => {
    // Simulate fetching user role
    const role = sampleUserProfile.role; 
    setUserRole(role);
    setIsLoading(false);

    // Logic to show streak popup once per day
    const today = new Date().toISOString().split('T')[0];
    const popupShownKey = `dailyStreakPopupShown_${today}`;
    if (!localStorage.getItem(popupShownKey)) {
      setShowStreakPopup(true);
      localStorage.setItem(popupShownKey, 'true');
    }
  }, []);

  const handleCloseStreakPopup = () => {
    setShowStreakPopup(false);
  };

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

  const renderDashboard = () => {
    switch (userRole) {
      case 'admin':
        return <AdminDashboard />;
      case 'manager':
        return <ManagerDashboard />;
      case 'user':
      default:
        return <UserDashboard />;
    }
  };

  return (
    <>
      {renderDashboard()}
      <DailyStreakPopup 
        isOpen={showStreakPopup} 
        onClose={handleCloseStreakPopup} 
        userProfile={sampleUserProfile} 
      />
    </>
  );
}

