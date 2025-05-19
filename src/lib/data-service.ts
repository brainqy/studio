
"use client"; // Can be a client-side or server-side utility depending on usage

import type { JobOpening, UserProfile } from '@/types';
import { sampleJobOpenings, sampleUserProfile } from '@/lib/sample-data';

// This constant will be automatically set by Next.js based on the environment
// It will be 'development' when running `npm run dev`
// It will be 'production' when running `npm run build` and `npm run start`
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

export async function getJobOpenings(): Promise<JobOpening[]> {
  if (IS_DEVELOPMENT) {
    console.log('[DataService] DEV MODE: Using sample job openings.');
    // Simulate API delay for development
    await new Promise(resolve => setTimeout(resolve, 500));
    return Promise.resolve([...sampleJobOpenings]); // Return a copy
  } else {
    // Production: Fetch from Spring Boot backend
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiUrl) {
      console.error('[DataService] PROD MODE: NEXT_PUBLIC_API_BASE_URL is not defined.');
      return Promise.resolve([]);
    }
    try {
      console.log(`[DataService] PROD MODE: Fetching job openings from ${apiUrl}/job-board`);
      const response = await fetch(`${apiUrl}/job-board`);
      if (!response.ok) {
        console.error(`[DataService] PROD MODE: Error fetching job openings: ${response.status} ${response.statusText}`);
        return Promise.resolve([]);
      }
      const data = await response.json();
      console.log('[DataService] PROD MODE: Fetched job openings from API:', data);
      return data as JobOpening[];
    } catch (error) {
      console.error('[DataService] PROD MODE: Exception fetching job openings:', error);
      return Promise.resolve([]);
    }
  }
}

export async function addJobOpening(
  jobData: Omit<JobOpening, 'id' | 'datePosted' | 'postedByAlumniId' | 'alumniName' | 'tenantId'>,
  currentUser: Pick<UserProfile, 'id' | 'name' | 'tenantId'> // Simplified currentUser type
): Promise<JobOpening | null> {
  const newOpening: JobOpening = {
    ...jobData,
    id: String(Date.now()), // Or use a UUID generator
    datePosted: new Date().toISOString().split('T')[0],
    postedByAlumniId: currentUser.id,
    alumniName: currentUser.name,
    tenantId: currentUser.tenantId, // Assuming job postings are tenant-specific
  };

  if (IS_DEVELOPMENT) {
    console.log('[DataService] DEV MODE: Adding job opening to sample data:', newOpening);
    sampleJobOpenings.unshift(newOpening); // Add to the beginning for visibility in dev
    return Promise.resolve(newOpening);
  } else {
    // Production: POST to Spring Boot backend
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiUrl) {
      console.error('[DataService] PROD MODE: NEXT_PUBLIC_API_BASE_URL is not defined for posting job.');
      return Promise.resolve(null);
    }
    try {
      console.log(`[DataService] PROD MODE: Posting job opening to ${apiUrl}/job-board`);
      const response = await fetch(`${apiUrl}/job-board`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add Authorization header if needed:
          // 'Authorization': `Bearer ${your_jwt_token}`
        },
        body: JSON.stringify(newOpening),
      });
      if (!response.ok) {
        console.error(`[DataService] PROD MODE: Error posting job opening: ${response.status} ${response.statusText}`);
        return Promise.resolve(null);
      }
      const savedJob = await response.json();
      console.log('[DataService] PROD MODE: Job opening posted to API:', savedJob);
      return savedJob as JobOpening;
    } catch (error) {
      console.error('[DataService] PROD MODE: Exception posting job opening:', error);
      return Promise.resolve(null);
    }
  }
}
