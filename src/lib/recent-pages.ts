
'use client';

import type { RecentPageItem } from '@/types';

const MAX_RECENT_PAGES = 5;
const LOCAL_STORAGE_KEY = 'recentVisitedPages';

export function getRecentPages(): RecentPageItem[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const storedPages = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedPages ? JSON.parse(storedPages) : [];
  } catch (error) {
    console.error("Error reading recent pages from localStorage:", error);
    return [];
  }
}

export function addRecentPage(path: string, label: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  if (path.startsWith('/auth') || path === '/') {
    return;
  }
  try {
    let currentPages = getRecentPages();
    currentPages = currentPages.filter(page => page.path !== path);
    currentPages.unshift({ path, label, timestamp: Date.now() });
    const updatedPages = currentPages.slice(0, MAX_RECENT_PAGES);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPages));
  } catch (error) {
    console.error("Error saving recent page to localStorage:", error);
  }
}

const PATH_LABEL_MAP: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/resume-analyzer': 'Resume Analyzer',
  '/ai-resume-writer': 'AI Resume Writer',
  '/cover-letter-generator': 'Cover Letter Generator',
  '/ai-mock-interview': 'AI Mock Interview',
  '/my-resumes': 'My Resumes',
  '/resume-builder': 'Resume Builder',
  '/resume-templates': 'Resume Templates',
  '/job-tracker': 'Job Tracker',
  '/interview-prep': 'Interview Prep',
  '/alumni-connect': 'Alumni Directory',
  '/job-board': 'Job Board',
  '/community-feed': 'Community Feed',
  '/events': 'Events Registration',
  '/gallery': 'Event Gallery',
  '/activity-log': 'Activity Log',
  '/profile': 'My Profile',
  '/appointments': 'Appointments',
  '/wallet': 'Digital Wallet',
  '/feature-requests': 'Feature Requests',
  '/settings': 'Settings',
  '/documentation': 'Documentation',
  '/gamification': 'Rewards & Badges',
  // '/leaderboard': 'Leaderboard', // Removed
  '/referrals': 'Referrals',
  '/affiliates': 'Affiliates Program',
  '/blog': 'Blog',
  '/admin/tenants': 'Tenant Management',
  '/admin/tenant-onboarding': 'Tenant Onboarding',
  '/admin/user-management': 'User Management',
  '/admin/gamification-rules': 'Gamification Rules',
  '/admin/content-moderation': 'Content Moderation',
  '/admin/messenger-management': 'Messenger Management',
  '/admin/affiliate-management': 'Affiliate Management',
  '/admin/gallery-management': 'Gallery Management',
  '/admin/blog-settings': 'AI Blog Settings',
};

export function getLabelForPath(path: string): string {
  if (path.startsWith('/blog/')) {
    const slug = path.substring('/blog/'.length);
    const title = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return `Blog: ${title}`;
  }
  return PATH_LABEL_MAP[path] || path;
}

