export type UserRole = 'admin' | 'manager' | 'user';

export type Gender = 'Male' | 'Female' | 'Prefer not to say';

export const DegreePrograms = [
  "Bachelor of Technology (B.Tech)",
  "Master of Technology (M.Tech)",
  "Bachelor of Science (B.Sc)",
  "Master of Science (M.Sc)",
  "Bachelor of Arts (B.A)",
  "Master of Arts (M.A)",
  "MBA",
  "PhD",
  "Diploma",
  "Other"
] as const;
export type DegreeProgram = typeof DegreePrograms[number];

export const Industries = [
  "IT/Software",
  "Finance/Banking",
  "Consulting",
  "Education",
  "Healthcare",
  "Manufacturing",
  "Government/Public Sector",
  "Retail/E-commerce",
  "Media/Entertainment",
  "Real Estate",
  "Automotive",
  "Other"
] as const;
export type Industry = typeof Industries[number];

export const AreasOfSupport = [
  "Mentoring Students",
  "Providing Internship Opportunities",
  "Sharing Job Referrals",
  "Guest Lecturing",
  "Startup/Business Mentorship",
  "Sponsorship or Donations",
  "Relocation Help",
  "Curriculum Feedback",
  "Organizing Alumni Events",
  "Volunteering for Campus Activities",
] as const;
export type SupportArea = typeof AreasOfSupport[number];


export const TimeCommitments = [
  "1-2 hours",
  "3-5 hours",
  "5+ hours",
  "Occasionally, when needed",
] as const;
export type TimeCommitment = typeof TimeCommitments[number];

export const EngagementModes = [
  "Online",
  "In-person",
  "Telecall",
] as const;
export type EngagementMode = typeof EngagementModes[number];

export const SupportTypesSought = [
  "Career Mentoring",
  "Job Referrals",
  "Higher Education Guidance",
  "Startup Advice",
  "Relocation Help",
  "General Networking",
] as const;
export type SupportTypeSought = typeof SupportTypesSought[number];


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
  // Consider adding role here if alumni can also be admins/managers
  role?: UserRole; 
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
  role: UserRole;
  name: string;
  dateOfBirth?: string; // ISO string e.g. "1990-01-01"
  gender?: Gender;
  email: string;
  mobileNumber?: string;
  currentAddress?: string; // Paragraph
  
  graduationYear?: string; // e.g., "2020"
  degreeProgram?: DegreeProgram;
  department?: string;
  
  currentJobTitle?: string; // already exists in sample data, ensure type consistency
  currentOrganization?: string;
  industry?: Industry;
  workLocation?: string; // City, Country
  linkedInProfile?: string; // URL
  yearsOfExperience?: string; // e.g., "5" or "5+"
  
  skills?: string[]; // Kept as string array, good for checkboxes/tags
  
  areasOfSupport?: SupportArea[];
  timeCommitment?: TimeCommitment;
  preferredEngagementMode?: EngagementMode;
  otherComments?: string; // Paragraph
  
  lookingForSupportType?: SupportTypeSought;
  helpNeededDescription?: string; // Paragraph
  
  shareProfileConsent?: boolean;
  featureInSpotlightConsent?: boolean;

  // Existing fields, ensure they fit or are adapted
  profilePictureUrl?: string;
  resumeText?: string; // Store the main resume text
  careerInterests?: string;
  bio?: string; // already exists
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
