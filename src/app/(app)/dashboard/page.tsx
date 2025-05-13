
"use client";

import { useEffect, useState } from "react";
import { sampleUserProfile } from "@/lib/sample-data";
import type { UserRole } from "@/types";
// import { useTranslations } from 'next-intl'; // Example for next-intl

import AdminDashboard from "@/components/dashboards/AdminDashboard";
import ManagerDashboard from "@/components/dashboards/ManagerDashboard";
import UserDashboard from "@/components/dashboards/UserDashboard";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import DailyStreakPopup from "@/components/features/DailyStreakPopup"; 
import WelcomeTourDialog from '@/components/features/WelcomeTourDialog';
import { userDashboardTourSteps, adminDashboardTourSteps, managerDashboardTourSteps } from "@/lib/sample-data";

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStreakPopup, setShowStreakPopup] = useState(false);
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);
  const [tourSteps, setTourSteps] = useState<any[]>([]);
  const [tourKey, setTourKey] = useState('');
  const [tourTitle, setTourTitle] = useState('');
  // const t = useTranslations('Dashboard'); // Example for next-intl

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
        currentTourTitle = "Welcome Admin!"; // This would be t('greeting_admin_tour')
      } else if (role === 'manager') {
        currentTourKey = 'managerDashboardTourSeen';
        currentTourSteps = managerDashboardTourSteps;
        currentTourTitle = "Welcome Manager!"; // This would be t('greeting_manager_tour')
      } else { // user
        currentTourKey = 'userDashboardTourSeen';
        currentTourSteps = userDashboardTourSteps;
        currentTourTitle = "Welcome to Your Dashboard!"; // This would be t('greeting_user_tour')
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
        {/* i18n-comment: "Loading..." */}
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
        // Pass t function or translated strings as props if AdminDashboard needs them
        return <AdminDashboard /* title={t('title')} description={t('description_admin')} */ />;
      case 'manager':
        return <ManagerDashboard /* title={t('title')} description={t('description_manager')} */ />;
      case 'user':
      default:
        return <UserDashboard /* title={t('title')} description={t('description_user')} */ />;
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
          title={tourTitle} // This title would be translated
        />
      )}
    </>
  );
}
