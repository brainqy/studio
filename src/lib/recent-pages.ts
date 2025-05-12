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
  // Do not add auth pages or the landing page to recent history
  if (path.startsWith('/auth') || path === '/') {
    return;
  }
  try {
    let currentPages = getRecentPages();
    // Remove if already exists to move to top
    currentPages = currentPages.filter(page => page.path !== path);
    // Add new page to the beginning
    currentPages.unshift({ path, label, timestamp: Date.now() });
    // Trim to max size
    const updatedPages = currentPages.slice(0, MAX_RECENT_PAGES);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPages));
  } catch (error) {
    console.error("Error saving recent page to localStorage:", error);
  }
}

// This map should ideally be more dynamic, perhaps generated from sidebar navigation items.
// For now, it's a static map.
const PATH_LABEL_MAP: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/resume-analyzer': 'Resume Analyzer',
  '/ai-resume-writer': 'AI Resume Writer',
  '/cover-letter-generator': 'Cover Letter Generator',
  '/my-resumes': 'My Resumes',
  '/resume-templates': 'Resume Templates',
  '/job-tracker': 'Job Tracker',
  '/alumni-connect': 'Alumni Directory',
  '/alumni-connect/recommendations': 'Mentorship Matching',
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
  '/referrals': 'Referrals',
  '/affiliates': 'Affiliates Program',
  '/blog': 'Blog',
  // Admin paths
  '/admin/tenants': 'Tenant Management',
  '/admin/tenant-onboarding': 'Tenant Onboarding',
  '/admin/user-management': 'User Management',
  '/admin/gamification-rules': 'Gamification Rules',
  '/admin/content-moderation': 'Content Moderation',
  '/admin/messenger-management': 'Messenger Management',
  '/admin/affiliate-management': 'Affiliate Management',
};

export function getLabelForPath(path: string): string {
  // Handle dynamic blog post paths
  if (path.startsWith('/blog/')) {
    const slug = path.substring('/blog/'.length);
    // Capitalize first letter of each word in slug for a nicer label
    const title = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return `Blog: ${title}`;
  }
  return PATH_LABEL_MAP[path] || path; // Fallback to path if no label found
}
