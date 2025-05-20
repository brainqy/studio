"use client";

import { useEffect, useState } from "react";
import { sampleUserProfile } from "@/lib/sample-data";
import type { UserRole } from "@/types";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import ManagerDashboard from "@/components/dashboards/ManagerDashboard";
import UserDashboard from "@/components/dashboards/UserDashboard";
import { Skeleton } from "@/components/ui/skeleton"; 
import DailyStreakPopup from "@/components/features/DailyStreakPopup"; 
import WelcomeTourDialog from '@/components/features/WelcomeTourDialog';
import { userDashboardTourSteps, adminDashboardTourSteps, managerDashboardTourSteps } from "@/lib/sample-data";
// Removed useTranslations

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStreakPopup, setShowStreakPopup] = useState(false);
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);
  const [tourSteps, setTourSteps] = useState<any[]>([]);
  const [tourKey, setTourKey] = useState('');
  const [tourTitle, setTourTitle] = useState('');

  useEffect(() => {
    const role = sampleUserProfile.role; 
    setUserRole(role);
    setIsLoading(false);

    const today = new Date().toISOString().split('T')[0];
    if (typeof window !== 'undefined') {
      if (role === 'user') {
        const popupShownKey = `dailyStreakPopupShown_${today}`;
        if (!localStorage.getItem(popupShownKey)) {
          setShowStreakPopup(true);
          localStorage.setItem(popupShownKey, 'true');
        }
      }
      
      let currentTourKey = '';
      let currentTourSteps: any[] = [];
      let currentTourTitle = '';

      if (role === 'admin') {
        currentTourKey = 'adminDashboardTourSeen';
        currentTourSteps = adminDashboardTourSteps;
        currentTourTitle = "Welcome Admin!";
      } else if (role === 'manager') {
        currentTourKey = 'managerDashboardTourSeen';
        currentTourSteps = managerDashboardTourSteps;
        currentTourTitle = "Welcome Manager!";
      } else { // user
        currentTourKey = 'userDashboardTourSeen';
        currentTourSteps = userDashboardTourSteps;
        currentTourTitle = "Welcome to Your Dashboard!";
      }
      
      setTourKey(currentTourKey);
      setTourSteps(currentTourSteps);
      setTourTitle(currentTourTitle);

      const tourSeen = localStorage.getItem(currentTourKey);
      if (!tourSeen) {
        setShowWelcomeTour(true);
      }
    }
  }, []);

  const handleCloseStreakPopup = () => {
    setShowStreakPopup(false);
  };
  
  const handleCloseWelcomeTour = () => {
    setShowWelcomeTour(false);
    if (typeof window !== 'undefined' && tourKey) {
      localStorage.setItem(tourKey, 'true');
    }
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
      {userRole === 'user' && sampleUserProfile && (
         <DailyStreakPopup 
          isOpen={showStreakPopup} 
          onClose={handleCloseStreakPopup} 
          userProfile={sampleUserProfile} 
        />
      )}
      {tourSteps.length > 0 && tourKey && (
         <WelcomeTourDialog
          isOpen={showWelcomeTour}
          onClose={handleCloseWelcomeTour}
          tourKey={tourKey}
          steps={tourSteps}
          title={tourTitle}
        />
      )}
    </>
  );
}
