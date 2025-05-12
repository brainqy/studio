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
  userId: string; 
  companyName: string;
  jobTitle: string;
  status: JobApplicationStatus;
  dateApplied: string;
  notes?: string;
  jobDescription?: string;
  resumeUsed?: string; 
  location?: string;
  reminderDate?: string; 
}

export interface AlumniProfile {
  id: string;
  tenantId: string; 
  name: string;
  profilePictureUrl?: string;
  currentJobTitle: string;
  company: string;
  shortBio: string;
  university: string;
  skills: string[];
  email: string;
  role?: UserRole; 
  status?: UserStatus; 
  lastLogin?: string; 
  interests?: string[];
  offersHelpWith?: SupportArea[];
  appointmentCoinCost?: number;
}

export interface Activity {
  id: string;
  tenantId: string;
  timestamp: string;
  description: string;
  userId?: string; 
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
  eventTitle?: string; 
  assignedTo?: string; 
  status?: 'open' | 'assigned' | 'completed'; 
  moderationStatus: CommunityPostModerationStatus;
  flagCount: number;
}

export interface FeatureRequest {
  id: string;
  tenantId: string; 
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
  postedByAlumniId: string; 
  alumniName: string; 
  applicationLink?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; 
  achieved?: boolean; 
  xpReward?: number; 
  triggerCondition?: string; 
}

export interface BlogPost {
  id: string;
  tenantId?: string | 'platform'; 
  title: string;
  slug: string; 
  author: string; 
  date: string; 
  imageUrl?: string;
  content: string; 
  excerpt: string;
  tags?: string[];
}

export interface UserProfile {
  id: string;
  tenantId: string; 
  role: UserRole; 
  name: string;
  email: string; 
  status?: UserStatus; 
  lastLogin?: string; 
  
  dateOfBirth?: string; 
  gender?: Gender;
  mobileNumber?: string;
  currentAddress?: string; 

  graduationYear?: string; 
  degreeProgram?: DegreeProgram;
  department?: string;

  currentJobTitle?: string;
  currentOrganization?: string;
  industry?: Industry;
  workLocation?: string; 
  linkedInProfile?: string; 
  yearsOfExperience?: string; 

  skills?: string[];

  areasOfSupport?: SupportArea[];
  timeCommitment?: TimeCommitment;
  preferredEngagementMode?: EngagementMode;
  otherComments?: string; 

  lookingForSupportType?: SupportTypeSought;
  helpNeededDescription?: string; 

  shareProfileConsent?: boolean; 
  featureInSpotlightConsent?: boolean; 

  profilePictureUrl?: string;
  resumeText?: string; 
  careerInterests?: string;
  bio?: string;

  xpPoints?: number;
  dailyStreak?: number; 
  longestStreak?: number;
  totalActiveDays?: number;
  weeklyActivity?: boolean[];
  referralCode?: string;
  earnedBadges?: string[]; 
  affiliateCode?: string; 
}


export interface ResumeProfile {
  id: string;
  tenantId: string;
  userId: string; 
  name: string; 
  resumeText: string;
  lastAnalyzed?: string;
}

export const AppointmentStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed'] as const;
export type AppointmentStatus = typeof AppointmentStatuses[number];

export type Appointment = {
  id: string;
  tenantId: string;
  requesterUserId: string; 
  alumniUserId: string; 
  title: string; 
  dateTime: string; 
  status: AppointmentStatus;
  meetingLink?: string; 
  location?: string; 
  notes?: string; 
  costInCoins?: number; 
  withUser: string; 
  reminderDate?: string; // ISO string for reminder
};

export type WalletTransaction = {
  id: string;
  tenantId: string;
  userId: string;
  date: string;
  description: string;
  amount: number; 
  type: 'credit' | 'debit';
};

export type Wallet = {
  tenantId: string;
  userId: string;
  coins: number;
  transactions: WalletTransaction[];
};

export const PreferredTimeSlots = ["Morning (9AM-12PM)", "Afternoon (1PM-4PM)", "Evening (5PM-7PM)"] as const;
export type PreferredTimeSlot = typeof PreferredTimeSlots[number];

export interface ResumeScanHistoryItem {
  id: string;
  tenantId: string;
  userId: string;
  resumeId: string; 
  resumeName: string; 
  jobTitle: string;
  companyName: string;
  jobDescriptionText?: string; 
  scanDate: string; 
  matchScore?: number;
  reportUrl?: string; 
  bookmarked?: boolean; 
}

export type KanbanColumnId = 'Saved' | 'Applied' | 'Interview' | 'Offer';
export const JOB_APPLICATION_STATUSES: JobApplicationStatus[] = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

export interface TenantSettings {
  allowPublicSignup: boolean;
  customLogoUrl?: string;
  primaryColor?: string; 
  accentColor?: string; 
  features?: {
    communityFeedEnabled?: boolean;
    jobBoardEnabled?: boolean;
    gamificationEnabled?: boolean;
    walletEnabled?: boolean;
    eventRegistrationEnabled?: boolean;
  };
  emailTemplates?: {
    welcomeEmail?: string; 
  };
}

export interface Tenant {
  id: string;
  name: string;
  domain?: string; 
  settings?: TenantSettings;
  createdAt: string;
}

export type ReferralStatus = 'Pending' | 'Signed Up' | 'Reward Earned' | 'Expired';
export interface ReferralHistoryItem {
    id: string;
    referrerUserId: string;
    referredEmailOrName: string; 
    referralDate: string; 
    status: ReferralStatus;
    rewardAmount?: number; 
}

export interface GamificationRule {
    actionId: string; 
    description: string; 
    xpPoints: number;
}

export interface SurveyOption {
  text: string;
  value: string;
  nextStepId?: string;
}

export interface SurveyStep {
  id: string;
  type: 'botMessage' | 'userOptions' | 'userInput' | 'userDropdown';
  text?: string; 
  options?: SurveyOption[]; 
  dropdownOptions?: { label: string; value: string }[]; 
  placeholder?: string; 
  inputType?: 'text' | 'textarea' | 'email' | 'tel' | 'url' | 'date'; 
  nextStepId?: string; 
  variableName?: string; 
  isLastStep?: boolean;
}

export interface SurveyResponse {
  id: string;
  userId: string;
  userName: string;
  surveyId: string;
  surveyName: string;
  responseDate: string; 
  data: Record<string, any>; 
}

export type AffiliateStatus = 'pending' | 'approved' | 'rejected';
export interface Affiliate {
  id: string; 
  userId: string;
  name: string; 
  email: string; 
  status: AffiliateStatus;
  affiliateCode: string;
  commissionRate: number; 
  totalEarned: number; 
  createdAt: string;
}

export interface AffiliateClick {
  id: string;
  affiliateId: string; 
  timestamp: string;
  ipAddress?: string; 
  convertedToSignup: boolean;
}

export interface AffiliateSignup {
  id: string;
  affiliateId: string; 
  newUserId: string;
  signupDate: string;
  commissionEarned?: number;
}

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  previewImageUrl: string;
  category: string; 
  dataAiHint?: string;
}

export interface RecentPageItem {
  path: string;
  label: string;
  timestamp: number;
}
