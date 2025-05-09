export interface JobApplication {
  id: string;
  companyName: string;
  jobTitle: string;
  status: 'Applied' | 'Interviewing' | 'Offer' | 'Rejected' | 'Saved';
  dateApplied: string;
  notes?: string;
  jobDescription?: string;
  resumeUsed?: string; // or a reference to a resume profile
}

export interface AlumniProfile {
  id: string;
  name: string;
  profilePictureUrl?: string;
  currentJobTitle: string;
  company: string;
  shortBio: string;
  university: string;
  skills: string[];
  location: { lat: number; lng: number };
  email: string;
}

export interface Activity {
  id: string;
  timestamp: string;
  description: string;
  userId?: string; // Optional: if tracking specific user activity
}

export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: string;
  content: string;
  type: 'text' | 'poll' | 'event' | 'request'; // Simplified poll/event to text for now
  tags?: string[];
  // For polls (future)
  // pollOptions?: { option: string, votes: number }[];
  // For events (future)
  // eventDate?: string;
  // eventLocation?: string;
}

export interface FeatureRequest {
  id: string;
  userId: string;
  userName: string;
  timestamp: string;
  title: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Rejected';
}

export interface GalleryEvent {
  id: string;
  title: string;
  date: string;
  imageUrl: string;
  description?: string;
  dataAiHint?: string;
}

export interface JobOpening {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  datePosted: string;
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract' | 'Mentorship';
  postedByAlumniId: string;
  alumniName: string; // Denormalized for easy display
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  skills?: string[];
  profilePictureUrl?: string;
  resumeText?: string; // Store the main resume text
  careerInterests?: string;
}

export interface ResumeProfile {
  id: string;
  name: string; // e.g., "Resume for Tech Roles", "Creative Portfolio Resume"
  resumeText: string;
  lastAnalyzed?: string;
  // Add more metadata as needed
}

export type Appointment = {
  id: string;
  title: string;
  dateTime: string;
  withUser: string; // User ID or name
  status: 'Pending' | 'Confirmed' | 'Cancelled';
};

export type WalletTransaction = {
  id: string;
  date: string;
  description: string;
  amount: number; // positive for credit, negative for debit
  type: 'credit' | 'debit';
};

export type Wallet = {
  coins: number;
  transactions: WalletTransaction[];
};
