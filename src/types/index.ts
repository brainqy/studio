















export type UserRole = 'admin' | 'manager' | 'user';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';


export const Genders = ['Male', 'Female', 'Prefer not to say'] as const;
export type Gender = typeof Genders[number];


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

export type JobApplicationStatus = 'Saved' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';

export interface JobApplication {
  id: string;
  tenantId: string;
  userId: string; // User who owns this application tracker entry
  companyName: string;
  jobTitle: string;
  status: JobApplicationStatus;
  dateApplied: string;
  notes?: string;
  jobDescription?: string;
  resumeUsed?: string; // Reference to a ResumeProfile id
  location?: string;
}

export interface AlumniProfile {
  id: string;
  tenantId: string; // Tenant this alumni belongs to (e.g., which university/org)
  name: string;
  profilePictureUrl?: string;
  currentJobTitle: string;
  company: string;
  shortBio: string;
  university: string;
  skills: string[];
  email: string;
  role?: UserRole; // Role within the platform for THIS tenant
  status?: UserStatus; // Status of the user account
  lastLogin?: string; // ISO string for last login date
  interests?: string[];
  offersHelpWith?: SupportArea[];
  appointmentCoinCost?: number;
}

export interface Activity {
  id: string;
  tenantId: string;
  timestamp: string;
  description: string;
  userId?: string; // User who performed the activity
}

export type CommunityPostModerationStatus = 'visible' | 'flagged' | 'removed';

export interface CommunityPost {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: string;
  content?: string;
  type: 'text' | 'poll' | 'event' | 'request';
  tags?: string[];
  pollOptions?: { option: string, votes: number }[];
  eventDate?: string;
  eventLocation?: string;
  eventTitle?: string; // Added for event type
  assignedTo?: string; // Added for request type
  status?: 'open' | 'assigned' | 'completed'; // Added for request type
  moderationStatus: CommunityPostModerationStatus;
  flagCount: number;
}

export interface FeatureRequest {
  id: string;
  tenantId: string; // Which tenant made the request (or 'platform' for global)
  userId: string;
  userName: string;
  timestamp: string;
  title: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Rejected';
}

export interface GalleryEvent {
  id: string;
  tenantId: string;
  title: string;
  date: string;
  imageUrl: string;
  description?: string;
  dataAiHint?: string;
}

export interface JobOpening {
  id: string;
  tenantId: string;
  title: string;
  company: string;
  location: string;
  description: string;
  datePosted: string;
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract' | 'Mentorship';
  postedByAlumniId: string; // User ID of the alumni who posted
  alumniName: string; // Denormalized for easy display
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name or URL
  achieved?: boolean; // Indicates if the current user has achieved this badge (optional here, depends on context)
  xpReward?: number; // XP points awarded for achieving this badge
  triggerCondition?: string; // Description of how the badge is earned
}

export interface BlogPost {
  id: string;
  tenantId?: string | 'platform'; // Optional tenant ID, 'platform' for global posts
  title: string;
  slug: string; // For URL routing
  author: string; // User name or "Platform Team"
  date: string; // ISO String
  imageUrl?: string;
  content: string; // Can be Markdown or HTML
  excerpt: string;
  tags?: string[];
}

export interface UserProfile {
  id: string;
  tenantId: string; // The tenant this user belongs to
  role: UserRole; // Role within the specific tenant context
  name: string;
  email: string; // Used for login, likely globally unique
  status?: UserStatus; // Status of the user account
  lastLogin?: string; // ISO string for last login date
  
  dateOfBirth?: string; // ISO string e.g. "1990-01-01"
  gender?: Gender;
  mobileNumber?: string;
  currentAddress?: string; // Paragraph

  graduationYear?: string; // e.g., "2020"
  degreeProgram?: DegreeProgram;
  department?: string;

  currentJobTitle?: string;
  currentOrganization?: string;
  industry?: Industry;
  workLocation?: string; // City, Country
  linkedInProfile?: string; // URL
  yearsOfExperience?: string; // e.g., "5" or "5+"

  skills?: string[];

  // Tenant-specific engagement settings
  areasOfSupport?: SupportArea[];
  timeCommitment?: TimeCommitment;
  preferredEngagementMode?: EngagementMode;
  otherComments?: string; // Paragraph

  lookingForSupportType?: SupportTypeSought;
  helpNeededDescription?: string; // Paragraph

  shareProfileConsent?: boolean; // Consent within the tenant
  featureInSpotlightConsent?: boolean; // Consent within the tenant

  profilePictureUrl?: string;
  resumeText?: string; // Store the main resume text
  careerInterests?: string;
  bio?: string;

  // Gamification fields
  xpPoints?: number;
  dailyStreak?: number; // Number of consecutive days active
  longestStreak?: number;
  totalActiveDays?: number;
  // Represents activity for the last 7 days, where index 0 is 6 days ago, index 6 is today.
  weeklyActivity?: boolean[];
  referralCode?: string;
  earnedBadges?: string[]; // Array of Badge IDs
  affiliateCode?: string; // User's unique affiliate code
}


export interface ResumeProfile {
  id: string;
  tenantId: string;
  userId: string; // User who owns this resume
  name: string; // e.g., "Resume for Tech Roles"
  resumeText: string;
  lastAnalyzed?: string;
}

export const AppointmentStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed'] as const;
export type AppointmentStatus = typeof AppointmentStatuses[number];

export type Appointment = {
  id: string;
  tenantId: string;
  requesterUserId: string; // User who requested the appointment
  alumniUserId: string; // Alumni being booked
  title: string; // Purpose of meeting
  dateTime: string; // ISO String
  status: AppointmentStatus;
  meetingLink?: string; // For confirmed online meetings
  location?: string; // For in-person meetings
  notes?: string; // From requester or alumni
  costInCoins?: number; // Coins deducted upon confirmation
  withUser: string; // Name of the other person in the appointment
};

export type WalletTransaction = {
  id: string;
  tenantId: string;
  userId: string;
  date: string;
  description: string;
  amount: number; // positive for credit, negative for debit
  type: 'credit' | 'debit';
};

export type Wallet = {
  tenantId: string;
  userId: string;
  coins: number;
  transactions: WalletTransaction[];
};

// For booking appointment form
export const PreferredTimeSlots = ["Morning (9AM-12PM)", "Afternoon (1PM-4PM)", "Evening (5PM-7PM)"] as const;
export type PreferredTimeSlot = typeof PreferredTimeSlots[number];

export interface ResumeScanHistoryItem {
  id: string;
  tenantId: string;
  userId: string;
  resumeId: string; // Link to the ResumeProfile used
  resumeName: string; // Denormalized
  jobTitle: string;
  companyName: string;
  jobDescriptionText?: string; // Store the JD used for the scan
  scanDate: string; // ISO string
  matchScore?: number;
  reportUrl?: string; // Link to analysis report if available
  bookmarked?: boolean; // New field for bookmarking
}

// Kanban column IDs for Job Tracker
export type KanbanColumnId = 'Saved' | 'Applied' | 'Interview' | 'Offer';
export const JOB_APPLICATION_STATUSES: JobApplicationStatus[] = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

// Tenant Information
export interface TenantSettings {
  allowPublicSignup: boolean;
  customLogoUrl?: string;
  primaryColor?: string; // HSL or HEX
  accentColor?: string; // HSL or HEX
  features?: {
    communityFeedEnabled?: boolean;
    jobBoardEnabled?: boolean;
    gamificationEnabled?: boolean;
    walletEnabled?: boolean;
    eventRegistrationEnabled?: boolean;
    // ... other features
  };
  // ... other tenant-specific settings like email templates stored as strings or IDs
  emailTemplates?: {
    welcomeEmail?: string; // template ID or content
    // ... other templates
  };
}

export interface Tenant {
  id: string;
  name: string;
  domain?: string; // Optional: for subdomain-based tenancy
  settings?: TenantSettings;
  createdAt: string;
}

// Referral History Item
export type ReferralStatus = 'Pending' | 'Signed Up' | 'Reward Earned' | 'Expired';
export interface ReferralHistoryItem {
    id: string;
    referrerUserId: string;
    referredEmailOrName: string; // Use email initially, update to name upon signup
    referralDate: string; // ISO String
    status: ReferralStatus;
    rewardAmount?: number; // Optional: Coins/XP earned
}

// Gamification XP Rule
export interface GamificationRule {
    actionId: string; // Unique identifier for the action e.g., 'profile_complete', 'resume_scan'
    description: string; // User-friendly description e.g., "Complete Your Profile", "Analyze a Resume"
    xpPoints: number;
}

// Survey types for Floating Messenger
export interface SurveyOption {
  text: string;
  value: string;
  nextStepId?: string;
}

export interface SurveyStep {
  id: string;
  type: 'botMessage' | 'userOptions' | 'userInput' | 'userDropdown';
  text?: string; // Bot message or question prompt
  options?: SurveyOption[]; // For userOptions
  dropdownOptions?: { label: string; value: string }[]; // For userDropdown
  placeholder?: string; // For userInput
  inputType?: 'text' | 'textarea' | 'email' | 'tel' | 'url' | 'date'; // Added inputType for userInput
  nextStepId?: string; // Default next step if not specified by option or after input/dropdown
  variableName?: string; // Key to store the user's answer
  isLastStep?: boolean;
}

// For Messenger Management page
export interface SurveyResponse {
  id: string;
  userId: string;
  userName: string;
  surveyId: string;
  surveyName: string;
  responseDate: string; // ISO string
  data: Record<string, any>; // The collected survey data (e.g., { loved_feature: 'Analyzer', referral_likelihood: 'very_likely' })
}

// Affiliate types
export type AffiliateStatus = 'pending' | 'approved' | 'rejected';
export interface Affiliate {
  id: string; // Usually same as userId
  userId: string;
  name: string; // User's full name
  email: string; // User's email
  status: AffiliateStatus;
  affiliateCode: string;
  commissionRate: number; // e.g., 0.10 for 10%
  totalEarned: number; // This might be better calculated dynamically or stored as a sum of their signups' commissions
  createdAt: string;
}

export interface AffiliateClick {
  id: string;
  affiliateId: string; // Corresponds to Affiliate.id (which is userId)
  timestamp: string;
  ipAddress?: string; // For tracking, consider privacy
  convertedToSignup: boolean;
}

export interface AffiliateSignup {
  id: string;
  affiliateId: string; // Corresponds to Affiliate.id (which is userId)
  newUserId: string;
  signupDate: string;
  commissionEarned?: number;
}
