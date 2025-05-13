

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
  sourceJobOpeningId?: string; // Added to link to original job opening
  applicationUrl?: string; // Added to store the application URL
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
  xpPoints?: number; 
}

export interface Activity {
  id: string;
  tenantId: string;
  timestamp: string;
  description: string; // Added description
  userId?: string; 
}

export type CommunityPostModerationStatus = 'visible' | 'flagged' | 'removed';

export interface CommunityComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: string;
  text: string;
}

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
  comments?: CommunityComment[];
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
  isPlatformGlobal?: boolean; 
  location?: string; // Added from events page
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
  userId: string; 
  userName: string; 
  userAvatar?: string; 
  title: string;
  slug: string; 
  author: string; 
  date: string; 
  imageUrl?: string;
  content: string; 
  excerpt: string;
  tags?: string[];
  comments?: CommunityComment[]; 
}

export interface UserProfile extends AlumniProfile { 
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

  currentJobTitle: string; 
  company: string;
  currentOrganization?: string; 
  industry?: Industry;
  workLocation?: string; 
  linkedInProfile?: string; 
  yearsOfExperience?: string; 

  skills: string[]; 

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
  bio: string; 
  interests?: string[];

  offersHelpWith?: SupportArea[]; 

  xpPoints?: number;
  dailyStreak?: number; 
  longestStreak?: number;
  totalActiveDays?: number;
  weeklyActivity?: boolean[];
  referralCode?: string;
  earnedBadges?: string[]; 
  affiliateCode?: string; 
  pastInterviewSessions?: string[]; 
  interviewCredits?: number;
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
  reminderDate?: string; 
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
  resumeTextSnapshot: string; 
  jobDescriptionText: string; 
  scanDate: string; 
  matchScore?: number;
  bookmarked?: boolean; 
}

export type KanbanColumnId = 'Saved' | 'Applied' | 'Interviewing' | 'Offer';
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
  surveyName?: string; 
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
  content: string; 
}

export interface RecentPageItem {
  path: string;
  label: string;
  timestamp: number;
}

export interface TourStep {
  title: string;
  description: string;
  targetId?: string; 
}

export interface ResumeHeaderData {
  fullName: string;
  phone: string;
  email: string;
  linkedin: string;
  portfolio?: string;
  address?: string;
}

export interface ResumeExperienceEntry {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string; 
  endDate: string;   
  isCurrent?: boolean;
  responsibilities: string; 
}

export interface ResumeEducationEntry {
  id: string;
  degree: string;
  major?: string;
  university: string;
  location: string;
  graduationYear: string;
  details?: string; 
}

export interface ResumeBuilderData {
  header: ResumeHeaderData;
  experience: ResumeExperienceEntry[];
  education: ResumeEducationEntry[];
  skills: string[];
  summary: string;
  additionalDetails?: {
    awards?: string;
    certifications?: string;
    languages?: string;
    interests?: string;
  };
  templateId: string; 
}

export type ResumeBuilderStep = 'header' | 'experience' | 'education' | 'skills' | 'summary' | 'additional-details' | 'finalize';

export const RESUME_BUILDER_STEPS: { id: ResumeBuilderStep; title: string; description?: string; mainHeading?: string; }[] = [
  { id: 'header', title: 'Header', description: "Let's start with your contact information.", mainHeading: "Contact Information" },
  { id: 'summary', title: 'Summary', description: "Write a compelling professional summary.", mainHeading: "Professional Summary" },
  { id: 'experience', title: 'Experience', description: "Add details about your work experience.", mainHeading: "Work Experience" },
  { id: 'education', title: 'Education', description: "Tell us about your education.", mainHeading: "Education & Training" },
  { id: 'skills', title: 'Skills', description: "Showcase your skills.", mainHeading: "Skills & Expertise" },
  { id: 'additional-details', title: 'Additional Info', description: "Include any other relevant details like awards or languages.", mainHeading: "Additional Information" },
  { id: 'finalize', title: 'Finalize', description: "Review and finalize your resume.", mainHeading: "Review & Finalize" },
];

export const ALL_CATEGORIES = ['Common', 'Behavioral', 'Technical', 'Coding', 'Role-Specific', 'Analytical', 'HR'] as const;
export type InterviewQuestionCategory = typeof ALL_CATEGORIES[number];

export const ALL_DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
export type InterviewQuestionDifficulty = typeof ALL_DIFFICULTIES[number];

export interface InterviewQuestionUserComment {
  id: string;
  userId: string;
  userName: string;
  comment: string;
  timestamp: string;
}

export interface InterviewQuestionUserRating {
  userId: string;
  rating: number; // 1-5
}

export interface InterviewQuestion {
  id: string;
  category: InterviewQuestionCategory;
  question: string;
  answerOrTip: string; 
  tags?: string[];
  isMCQ?: boolean; 
  mcqOptions?: string[]; 
  correctAnswer?: string; 
  difficulty?: InterviewQuestionDifficulty;
  rating?: number; // Average rating
  ratingsCount?: number; // Number of users who rated
  userRatings?: InterviewQuestionUserRating[]; // Individual user ratings
  comments?: string; // Admin comments
  userComments?: InterviewQuestionUserComment[]; // User-submitted comments
  createdBy?: string; 
  approved?: boolean; 
}

export interface BlogGenerationSettings {
  generationIntervalHours: number;
  topics: string[]; 
  style?: 'informative' | 'casual' | 'formal' | 'technical' | 'storytelling'; 
  lastGenerated?: string; 
}

export interface MockInterviewQuestion { 
  id: string; 
  questionText: string;
  category?: InterviewQuestionCategory; 
  difficulty?: InterviewQuestionDifficulty;
}

export interface MockInterviewAnswer {
  questionId: string;
  questionText: string;
  userAnswer: string; 
  aiFeedback?: string;
  aiScore?: number; 
  strengths?: string[];
  areasForImprovement?: string[];
  suggestedImprovements?: string[];
  isRecording?: boolean; 
}

export interface GenerateOverallInterviewFeedbackOutput {
  overallSummary: string;
  keyStrengths: string[];
  keyAreasForImprovement: string[];
  finalTips: string[];
  overallScore: number; 
}
export interface MockInterviewSession { // Also used for Quizzes
  id: string;
  userId: string;
  topic: string; // For AI mock interview topic, or Quiz name
  description?: string; // For Quiz description
  jobDescription?: string; // For AI mock interview context
  questions: MockInterviewQuestion[]; // or QuizQuestion[] if made distinct
  answers: MockInterviewAnswer[]; // For AI mock interview
  overallFeedback?: GenerateOverallInterviewFeedbackOutput; // For AI mock interview
  overallScore?: number; // For AI mock interview
  status: 'pending' | 'in-progress' | 'completed'; // 'pending' can be for quiz templates
  createdAt: string;
  timerPerQuestion?: number; // For AI mock interview / Quiz
  questionCategories?: InterviewQuestionCategory[]; // For AI mock interview / Quiz
  difficulty?: InterviewQuestionDifficulty; // For AI mock interview / Quiz
  // Quiz specific fields, if MockInterviewSession is used for Quizzes:
  userQuizAnswers?: Record<string, string>; // questionId: selectedOptionValue for quiz
  quizScore?: number;
  quizPercentage?: number;
  quizTimeTaken?: number; // Time in seconds
  quizTotalTime?: number; // Total allotted time in seconds
  quizCategoryStats?: Record<string, { correct: number; total: number; accuracy: number }>; // Added for sectional analysis
  quizAnsweredCount?: number;
  quizMarkedForReviewCount?: number;
}


export interface GenerateMockInterviewQuestionsInput {
  topic: string;
  jobDescription?: string;
  numQuestions?: number; 
  difficulty?: 'easy' | 'medium' | 'hard'; 
  timerPerQuestion?: number; 
  questionCategories?: InterviewQuestionCategory[]; 
}
export interface GenerateMockInterviewQuestionsOutput {
  questions: MockInterviewQuestion[]; 
}

export interface EvaluateInterviewAnswerInput {
  questionText: string;
  userAnswer: string;
  topic?: string; 
  jobDescription?: string; 
}
export interface EvaluateInterviewAnswerOutput {
  feedback: string; 
  strengths?: string[];
  areasForImprovement?: string[];
  score: number; 
  suggestedImprovements?: string[]; 
}

export interface GenerateOverallInterviewFeedbackInput {
  topic: string;
  jobDescription?: string;
  evaluatedAnswers: { questionText: string; userAnswer: string; feedback: string; score: number }[];
}

export type MockInterviewStepId = 'setup' | 'interview' | 'feedback';
export const MOCK_INTERVIEW_STEPS: { id: MockInterviewStepId; title: string; description: string }[] = [
  { id: 'setup', title: 'Setup Interview', description: 'Configure your mock interview session.' },
  { id: 'interview', title: 'Interview Session', description: 'Answer the questions one by one.' },
  { id: 'feedback', title: 'Get Feedback', description: 'Review your performance and AI suggestions.' },
];

// Quiz Mode Specific Types
export interface QuizSession {
  id: string;
  userId: string;
  questions: InterviewQuestion[]; // The actual questions used in this quiz
  userAnswers: Record<string, string>; // questionId: selectedOptionValue
  score?: number; // Number of correct answers
  percentage?: number; // Percentage score
  startTime: string; // ISO DateTime string
  endTime?: string; // ISO DateTime string
  status: 'in-progress' | 'completed';
  title?: string; // e.g., "Java Basics Quiz"
  categoryStats?: Record<string, { correct: number; total: number; accuracy: number }>; // Added for sectional analysis
  timeTaken?: number; // Time in seconds
  totalQuizTime?: number; // Total allotted time in seconds
  answeredCount?: number;
  markedForReviewCount?: number;
}

// Practice Session Type (for the new practice hub)
export type PracticeSessionStatus = 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
export type PracticeSessionType = "friends" | "experts" | "ai"; 

export type DialogStep = 
  | 'selectType' 
  | 'selectTopics' // For experts/friends OR AI Question Categories (if not distinct)
  | 'selectTimeSlot' // For experts/friends
  | 'aiSetupBasic'   // New: AI Topic/Role & JD
  | 'aiSetupAdvanced'// New: AI NumQ, Difficulty, Timer
  | 'aiSetupCategories'; // New: AI Question Categories (can reuse selectTopics UI logic)


export interface PracticeSessionConfig {
  type: PracticeSessionType | null;
  
  // For expert/friends
  topics: string[]; // General topics for session with expert/friend
  dateTime: Date | null;
  friendEmail?: string;
  expertId?: string;
  
  // For AI Mock Interview configuration
  aiTopicOrRole?: string; // Specific topic/role for AI interview
  aiJobDescription?: string;
  aiNumQuestions?: number;
  aiDifficulty?: 'easy' | 'medium' | 'hard';
  aiTimerPerQuestion?: number; // Time in seconds, 0 for no timer
  aiQuestionCategories?: InterviewQuestionCategory[]; // Specific categories for AI questions
}


export interface PracticeSession {
  id: string;
  userId: string;
  date: string; 
  category: "Practice with Friends" | "Practice with Experts" | "Practice with AI";
  type: string; // This would be the specific topic/role for AI, or topics for expert/friend
  language: string; 
  status: PracticeSessionStatus;
  notes?: string; 
  // AI Specific details if booked session is AI
  aiNumQuestions?: number;
  aiDifficulty?: 'easy' | 'medium' | 'hard';
  aiTimerPerQuestion?: number;
  aiQuestionCategories?: InterviewQuestionCategory[];
}

export const PREDEFINED_INTERVIEW_TOPICS: string[] = ["Java", "Python", "DSA", "Angular", "Javascript", "Microservices", "System Design", "Behavioral", "Product Management", "Data Science", ...ALL_CATEGORIES];
// Using string[] for PREDEFINED_INTERVIEW_TOPICS to allow flexibility for expert/friend sessions.
// For AI Question Categories, we will use ALL_CATEGORIES (which is InterviewQuestionCategory[]).

// New constant for specific practice focus areas/topics
export const PRACTICE_FOCUS_AREAS = ["Java", "Python", "DSA", "Angular", "Javascript", "Microservices", "System Design", "Behavioral", "Product Management", "Data Science"] as const;
export type PracticeFocusArea = typeof PRACTICE_FOCUS_AREAS[number];
