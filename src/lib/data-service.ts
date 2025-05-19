
"use client"; // Can be a client-side or server-side utility depending on usage

import type { JobOpening } from '@/types';
import { sampleJobOpenings } from '@/lib/sample-data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getJobOpenings(): Promise<JobOpening[]> {
  if (process.env.NODE_ENV === 'development') {
    console.log('[DataService] Using sample job openings for development.');
    // Simulate API delay for development
    await new Promise(resolve => setTimeout(resolve, 500));
    return Promise.resolve([...sampleJobOpenings]); // Return a copy to prevent direct mutation if needed
  } else {
    // Production: Fetch from Spring Boot backend
    if (!API_BASE_URL) {
      console.error('[DataService] NEXT_PUBLIC_API_BASE_URL is not defined for production.');
      return Promise.resolve([]); // Or throw an error
    }
    try {
      console.log(`[DataService] Fetching job openings from ${API_BASE_URL}/job-board`);
      const response = await fetch(`${API_BASE_URL}/job-board`); // Adjust endpoint as needed
      if (!response.ok) {
        console.error(`[DataService] Error fetching job openings: ${response.status} ${response.statusText}`);
        // You might want to parse the error response body if available
        // const errorBody = await response.text();
        // console.error(`[DataService] Error body: ${errorBody}`);
        return Promise.resolve([]); // Or throw new Error(`Failed to fetch job openings: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('[DataService] Fetched job openings from API:', data);
      return data as JobOpening[];
    } catch (error) {
      console.error('[DataService] Exception fetching job openings:', error);
      return Promise.resolve([]); // Or throw error;
    }
  }
}

// For adding jobs - in dev, updates sample data. In prod, would POST to API.
export async function addJobOpening(jobData: Omit<JobOpening, 'id' | 'datePosted' | 'postedByAlumniId' | 'alumniName' | 'tenantId'>, currentUser: { id: string; name: string; tenantId: string }): Promise<JobOpening | null> {
  const newOpening: JobOpening = {
    ...jobData,
    id: String(Date.now()),
    datePosted: new Date().toISOString().split('T')[0],
    postedByAlumniId: currentUser.id,
    alumniName: currentUser.name,
    tenantId: currentUser.tenantId,
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('[DataService] Adding job opening to sample data (development):', newOpening);
    sampleJobOpenings.unshift(newOpening); // Add to the beginning for visibility
    return Promise.resolve(newOpening);
  } else {
    // Production: POST to Spring Boot backend
    if (!API_BASE_URL) {
      console.error('[DataService] NEXT_PUBLIC_API_BASE_URL is not defined for production.');
      return Promise.resolve(null);
    }
    try {
      console.log(`[DataService] Posting job opening to ${API_BASE_URL}/job-board`);
      const response = await fetch(`${API_BASE_URL}/job-board`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add Authorization header if needed:
          // 'Authorization': `Bearer ${your_jwt_token}`
        },
        body: JSON.stringify(newOpening), // Send the fully constructed newOpening
      });
      if (!response.ok) {
        console.error(`[DataService] Error posting job opening: ${response.status} ${response.statusText}`);
        // const errorBody = await response.text();
        // console.error(`[DataService] Error body: ${errorBody}`);
        return Promise.resolve(null);
      }
      const savedJob = await response.json();
      console.log('[DataService] Job opening posted to API:', savedJob);
      return savedJob as JobOpening;
    } catch (error) {
      console.error('[DataService] Exception posting job opening:', error);
      return Promise.resolve(null);
    }
  }
}
