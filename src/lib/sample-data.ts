import type { JobApplication, AlumniProfile, Activity, CommunityPost, FeatureRequest, GalleryEvent, JobOpening, UserProfile, UserRole, Gender, DegreeProgram, Industry, SupportArea, TimeCommitment, EngagementMode, SupportTypeSought, ResumeScanHistoryItem, Appointment, Wallet, ResumeProfile, Tenant, Badge, BlogPost } from '@/types';
import { AreasOfSupport } from '@/types';

const SAMPLE_TENANT_ID = 'tenant-1'; // Define a default tenant ID for sample data

export const sampleJobApplications: JobApplication[] = [
  { id: '1', tenantId: SAMPLE_TENANT_ID, userId: 'currentUser', companyName: 'Tech Solutions Inc.', jobTitle: 'Software Engineer', status: 'Applied', dateApplied: '2024-07-01', notes: 'Applied via company portal.', location: 'Remote', resumeUsed: 'resume1' },
  { id: '2', tenantId: SAMPLE_TENANT_ID, userId: 'currentUser', companyName: 'Innovate LLC', jobTitle: 'Frontend Developer', status: 'Interviewing', dateApplied: '2024-06-25', notes: 'First interview scheduled for 2024-07-10.', location: 'New York, NY', resumeUsed: 'resume1' },
  { id: '3', tenantId: SAMPLE_TENANT_ID, userId: 'currentUser', companyName: 'Data Corp', jobTitle: 'Data Analyst', status: 'Offer', dateApplied: '2024-06-15', notes: 'Received offer, considering.', location: 'San Francisco, CA', resumeUsed: 'resume3' },
  { id: '4', tenantId: SAMPLE_TENANT_ID, userId: 'currentUser', companyName: 'Web Wizards', jobTitle: 'UX Designer', status: 'Rejected', dateApplied: '2024-06-20', notes: 'Did not proceed after initial screening.', location: 'Austin, TX', resumeUsed: 'resume2' },
  { id: '5', tenantId: SAMPLE_TENANT_ID, userId: 'currentUser', companyName: 'CloudNetics', jobTitle: 'Cloud Engineer', status: 'Saved', dateApplied: '2024-07-05', notes: 'Interested, need to tailor resume.', location: 'Boston, MA', resumeUsed: 'resume3' },
  { id: '6', tenantId: SAMPLE_TENANT_ID, userId: 'currentUser', companyName: 'AI Future', jobTitle: 'Machine Learning Eng.', status: 'Saved', dateApplied: '2024-07-15', notes: 'From scan report, good match.', location: 'Seattle, WA', resumeUsed: 'resume1' },
];

export const sampleAlumni: AlumniProfile[] = [
  {
    id: 'alumni1',
    tenantId: SAMPLE_TENANT_ID,
    name: 'Alice Wonderland',
    profilePictureUrl: 'https://picsum.photos/seed/alice/200/200',
    currentJobTitle: 'Senior Software Engineer',
    company: 'Google',
    shortBio: 'Passionate about AI and cloud computing. Graduated in 2015.',
    university: 'State University',
    skills: ['Java', 'Python', 'Machine Learning', 'Cloud Computing', 'Algorithms'],
    email: "alice.wonderland@example.com",
    role: 'user',
    interests: ['Hiking', 'Photography', 'Open Source'],
    offersHelpWith: [AreasOfSupport[0], AreasOfSupport[2], AreasOfSupport[4]], // Mentoring, Job Referrals, Startup Mentorship
    appointmentCoinCost: 10,
  },
  {
    id: 'alumni2',
    tenantId: SAMPLE_TENANT_ID,
    name: 'Bob The Builder',
    profilePictureUrl: 'https://picsum.photos/seed/bob/200/200',
    currentJobTitle: 'Product Manager',
    company: 'Microsoft',
    shortBio: 'Focused on user-centric product development. Class of 2018.',
    university: 'Tech Institute',
    skills: ['Product Management', 'Agile', 'UX Research', 'Roadmapping'],
    email: "bob.builder@example.com",
    role: 'manager',
    interests: ['Woodworking', 'Community Volunteering', 'Travel'],
    offersHelpWith: [AreasOfSupport[1], AreasOfSupport[3], AreasOfSupport[8]], // Internships, Guest Lecturing, Organizing Events
    appointmentCoinCost: 15,
  },
  {
    id: 'alumni3',
    tenantId: SAMPLE_TENANT_ID,
    name: 'Charlie Brown',
    profilePictureUrl: 'https://picsum.photos/seed/charlie/200/200',
    currentJobTitle: 'Data Scientist',
    company: 'Facebook',
    shortBio: 'Exploring large-scale data and its implications. Alumnus of 2017.',
    university: 'State University',
    skills: ['R', 'Statistics', 'Big Data', 'Python', 'Data Visualization'],
    email: "charlie.brown@example.com",
    role: 'user',
    interests: ['Chess', 'Reading Sci-Fi', 'Data For Good'],
    offersHelpWith: [AreasOfSupport[0], AreasOfSupport[7]], // Mentoring, Curriculum Feedback
    appointmentCoinCost: 10,
  },
  {
    id: 'alumni4',
    tenantId: SAMPLE_TENANT_ID,
    name: 'Diana Prince',
    profilePictureUrl: 'https://picsum.photos/seed/diana/200/200',
    currentJobTitle: 'Marketing Lead',
    company: 'Amazon',
    shortBio: 'Specializing in digital marketing strategies. Graduated 2016.',
    university: 'Commerce College',
    skills: ['SEO', 'Content Marketing', 'Social Media', 'PPC Advertising'],
    email: "diana.prince@example.com",
    role: 'admin', // Example Admin
    interests: ['Yoga', 'Creative Writing', 'Digital Trends'],
    offersHelpWith: [AreasOfSupport[2], AreasOfSupport[5], AreasOfSupport[9]], // Job Referrals, Sponsorship, Volunteering
    appointmentCoinCost: 20,
  },
];

export const sampleActivities: Activity[] = [
  { id: 'act1', tenantId: SAMPLE_TENANT_ID, userId: 'currentUser', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), description: 'Uploaded resume "Software_Engineer_Resume.pdf".' },
  { id: 'act2', tenantId: SAMPLE_TENANT_ID, userId: 'currentUser', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), description: 'Analyzed resume for "Senior Product Manager" role at Innovate LLC.' },
  { id: 'act3', tenantId: SAMPLE_TENANT_ID, userId: 'currentUser', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), description: 'Connected with Alice Wonderland.' },
  { id: 'act4', tenantId: SAMPLE_TENANT_ID, userId: 'currentUser', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), description: 'Tracked new job application for "Data Scientist" at Data Corp.' },
  { id: 'act5', tenantId: SAMPLE_TENANT_ID, userId: 'currentUser', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), description: 'Earned the "Profile Pro" badge.' },
  { id: 'act6', tenantId: SAMPLE_TENANT_ID, userId: 'currentUser', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), description: 'Posted in Community Feed: "Interview Tips?".' },
];

export const sampleCommunityPosts: CommunityPost[] = [
  { id: 'post1', tenantId: SAMPLE_TENANT_ID, userId: 'user123', userName: 'John Doe', userAvatar: 'https://picsum.photos/seed/johndoe/50/50', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), content: 'Anyone have experience with tackling take-home assignments for Senior Eng roles? Tips appreciated!', type: 'text', tags: ['jobsearch', 'interviewtips'] },
  { id: 'post2', tenantId: SAMPLE_TENANT_ID, userId: 'user456', userName: 'Jane Smith', userAvatar: 'https://picsum.photos/seed/janesmith/50/50', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), content: 'Looking for a mentor in the Product Management space. Any alumni willing to connect?', type: 'request', tags: ['mentorship', 'productmanagement'], status: 'open' },
  { id: 'post3', tenantId: SAMPLE_TENANT_ID, userId: 'alumni1', userName: 'Alice Wonderland', userAvatar: 'https://picsum.photos/seed/alice/50/50', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), content: 'Upcoming Workshop: Intro to Cloud Native', type: 'event', eventTitle: 'Intro to Cloud Native', eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), eventLocation: 'Online (Zoom)', tags: ['workshop', 'cloud'] },
];

export const sampleFeatureRequests: FeatureRequest[] = [
  { id: 'fr1', tenantId: SAMPLE_TENANT_ID, userId: 'user789', userName: 'Sam Wilson', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), title: 'Integrate with LinkedIn for profile import', description: 'It would be great to automatically pull resume data from LinkedIn.', status: 'Pending' },
  { id: 'fr2', tenantId: SAMPLE_TENANT_ID, userId: 'user101', userName: 'Maria Hill', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), title: 'Dark mode for the dashboard', description: 'A dark theme option would be easier on the eyes.', status: 'In Progress' },
];

export const sampleGalleryEvents: GalleryEvent[] = [
  { id: 'event1', tenantId: SAMPLE_TENANT_ID, title: 'Annual Alumni Meet 2023', date: '2023-10-15', imageUrl: 'https://picsum.photos/seed/event1/600/400', description: 'A wonderful evening connecting with fellow alumni.' , dataAiHint: 'conference networking'},
  { id: 'event2', tenantId: SAMPLE_TENANT_ID, title: 'Tech Talk Series: AI Today', date: '2024-03-22', imageUrl: 'https://picsum.photos/seed/event2/600/400', description: 'Insightful talks on the future of Artificial Intelligence.' , dataAiHint: 'presentation seminar'},
  { id: 'event3', tenantId: SAMPLE_TENANT_ID, title: 'Campus Job Fair Spring 2024', date: '2024-04-10', imageUrl: 'https://picsum.photos/seed/event3/600/400', description: 'Connecting students with top employers.', dataAiHint: 'job fair students' },
];

export const sampleJobOpenings: JobOpening[] = [
  { id: 'job1', tenantId: SAMPLE_TENANT_ID, title: 'Junior Developer', company: 'Google', postedByAlumniId: 'alumni1', alumniName: 'Alice Wonderland', description: 'Exciting opportunity for recent graduates to join our engineering team.', datePosted: '2024-07-10', location: 'Mountain View, CA', type: 'Full-time' },
  { id: 'job2', tenantId: SAMPLE_TENANT_ID, title: 'Marketing Intern (Summer)', company: 'Amazon', postedByAlumniId: 'alumni4', alumniName: 'Diana Prince', description: 'Gain hands-on experience in a fast-paced marketing environment.', datePosted: '2024-07-08', location: 'Seattle, WA', type: 'Internship' },
  { id: 'job3', tenantId: SAMPLE_TENANT_ID, title: 'Project Manager - Mentorship Program', company: 'Self-Employed (Mentorship)', postedByAlumniId: 'alumni2', alumniName: 'Bob The Builder', description: 'Looking to mentor aspiring Product Managers. Part-time commitment.', datePosted: '2024-07-05', location: 'Remote', type: 'Mentorship' },
];

// Default sample user profile - CAN BE MODIFIED FOR TESTING ROLES
export const sampleUserProfile: UserProfile = {
  id: 'currentUser',
  tenantId: SAMPLE_TENANT_ID,
  role: 'admin', // <= CHANGED TO ADMIN
  name: 'Alex Taylor (Admin)', // Added "(Admin)" to name for clarity during testing
  email: 'admin@example.com', // Changed email for admin context
  dateOfBirth: '1990-05-20',
  gender: 'Prefer not to say',
  mobileNumber: '+15559876543',
  currentAddress: 'Admin HQ, Anytown, CA, USA',

  graduationYear: '2012',
  degreeProgram: 'Master of Business Administration (MBA)',
  department: 'Business Administration',

  currentJobTitle: 'Platform Administrator',
  currentOrganization: 'ResumeMatch AI Platform',
  industry: 'IT/Software',
  workLocation: 'Remote',
  linkedInProfile: 'https://linkedin.com/in/adminprofile',
  yearsOfExperience: '10+',

  skills: ['System Administration', 'User Management', 'Cloud Infrastructure', 'Security'],

  // Admins might not engage in the same way, but keeping structure
  areasOfSupport: ['Organizing Alumni Events'],
  timeCommitment: 'Occasionally, when needed',
  preferredEngagementMode: 'Online',
  otherComments: 'Overseeing platform operations.',

  lookingForSupportType: undefined, // Admins likely don't seek support via this form
  helpNeededDescription: '',

  shareProfileConsent: false, // Admins might default to less visibility
  featureInSpotlightConsent: false,

  bio: 'Experienced platform administrator ensuring the smooth operation of ResumeMatch AI.',
  profilePictureUrl: 'https://picsum.photos/seed/admintaylor/200/200',
  resumeText: `Admin User Profile
  Email: admin@example.com
  Role: Platform Administrator
  
  Responsible for managing tenants, users, and overall system health.
  
  Key Responsibilities:
  - Tenant onboarding and configuration
  - User account management and role assignment
  - Monitoring system performance and logs
  - Overseeing feature deployments
  - Managing platform settings and integrations
  
  Skills: System Administration, User Support, Database Management, Cloud Services (AWS/GCP), Security Best Practices.
  `,
  careerInterests: 'Platform Scalability, DevOps, AI Ethics',

  // Gamification Data for Admin (Could be less relevant, but included for consistency)
  xpPoints: 5000,
  dailyStreak: 15,
  referralCode: 'ADMINREF123',
  earnedBadges: ['admin-master', 'profile-pro', 'early-adopter'],
};

export const sampleAppointments: Appointment[] = [
    { id: 'appt1', tenantId: SAMPLE_TENANT_ID, requesterUserId: 'currentUser', alumniUserId: 'alumni1', title: 'Mentorship Session with Alice W.', dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), withUser: 'Alice Wonderland', status: 'Confirmed', costInCoins: 10, meetingLink: 'https://zoom.us/j/1234567890' },
    { id: 'appt2', tenantId: SAMPLE_TENANT_ID, requesterUserId: 'currentUser', alumniUserId: 'alumni2', title: 'Networking Call with Bob B.', dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), withUser: 'Bob The Builder', status: 'Pending', costInCoins: 15 },
    { id: 'appt3', tenantId: SAMPLE_TENANT_ID, requesterUserId: 'alumni3', alumniUserId: 'currentUser', title: 'Incoming Request: Career Advice', dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), withUser: 'Charlie Brown', status: 'Pending', costInCoins: 10 }, // Example of incoming request
];

export const sampleWalletBalance: Wallet = {
    tenantId: SAMPLE_TENANT_ID,
    userId: 'currentUser',
    coins: 150,
    transactions: [
        { id: 'txn1', tenantId: SAMPLE_TENANT_ID, userId: 'currentUser', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), description: 'Reward for profile completion', amount: 50, type: 'credit' },
        { id: 'txn2', tenantId: SAMPLE_TENANT_ID, userId: 'currentUser', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), description: 'Used for premium report', amount: -20, type: 'debit' },
        { id: 'txn3', tenantId: SAMPLE_TENANT_ID, userId: 'currentUser', date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), description: 'Appointment booking fee (Alice W.)', amount: -10, type: 'debit' },
        { id: 'txn4', tenantId: SAMPLE_TENANT_ID, userId: 'currentUser', date: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), description: 'Daily login bonus', amount: 5, type: 'credit' },
    ]
};

export const sampleResumeProfiles: ResumeProfile[] = [
  { id: 'resume1', tenantId: SAMPLE_TENANT_ID, userId: 'currentUser', name: "Software Engineer Focused", resumeText: sampleUserProfile.resumeText || "This is a resume focused on software engineering roles...", lastAnalyzed: "2024-07-15" },
  { id: 'resume2', tenantId: SAMPLE_TENANT_ID, userId: 'currentUser', name: "Product Manager Application", resumeText: "A resume tailored for product management positions...", lastAnalyzed: "2024-07-10" },
  { id: 'resume3', tenantId: SAMPLE_TENANT_ID, userId: 'currentUser', name: "General Tech Resume", resumeText: "A general purpose resume for various tech roles.", lastAnalyzed: "2024-06-20" },
];


export const sampleResumeScanHistory: ResumeScanHistoryItem[] = [
  {
    id: 'scan1',
    tenantId: SAMPLE_TENANT_ID,
    userId: 'currentUser',
    resumeId: 'resume1',
    resumeName: 'Software_Engineer_Resume_v2.pdf',
    jobTitle: 'Senior Software Engineer',
    companyName: 'Innovate LLC',
    scanDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    matchScore: 85,
    reportUrl: '/my-resumes/resumeId123/analysis/reportXYZ', // Example URL
    bookmarked: true, // Sample bookmarked item
  },
  {
    id: 'scan2',
    tenantId: SAMPLE_TENANT_ID,
    userId: 'currentUser',
    resumeId: 'resume2',
    resumeName: 'Product_Manager_Profile.docx',
    jobTitle: 'Product Lead',
    companyName: 'FutureTech Corp',
    scanDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    matchScore: 72,
    reportUrl: '/my-resumes/resumeId456/analysis/reportABC', // Example URL
    bookmarked: false,
  },
  {
    id: 'scan3',
    tenantId: SAMPLE_TENANT_ID,
    userId: 'currentUser',
    resumeId: 'resume3',
    resumeName: 'General_Tech_Resume.pdf',
    jobTitle: 'Data Analyst',
    companyName: 'Data Corp',
    scanDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
    matchScore: 91,
    bookmarked: false,
  },
];

// Graduation years for dropdown
export const graduationYears = Array.from({ length: 26 }, (_, i) => (2025 - i).toString());

// Sample Tenants
export const sampleTenants: Tenant[] = [
  { id: 'tenant-1', name: 'Default University', createdAt: new Date().toISOString(), settings: { allowPublicSignup: true } },
  { id: 'tenant-2', name: 'Corporate Partner Inc.', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), settings: { allowPublicSignup: false } },
  { id: 'tenant-3', name: 'Community College', createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), settings: { allowPublicSignup: true } },
];

// Sample Badges
export const sampleBadges: Badge[] = [
    { id: 'profile-pro', name: 'Profile Pro', description: 'Completed 100% of your profile.', icon: 'UserCheck', achieved: true },
    { id: 'early-adopter', name: 'Early Adopter', description: 'Joined within the first month of launch.', icon: 'Award', achieved: true },
    { id: 'networker', name: 'Networker', description: 'Made 10+ alumni connections.', icon: 'Users', achieved: false },
    { id: 'analyzer-ace', name: 'Analyzer Ace', description: 'Analyzed 5+ resumes.', icon: 'Zap', achieved: false },
    { id: 'contributor', name: 'Contributor', description: 'Posted 5+ times in the community feed.', icon: 'MessageSquare', achieved: false },
    { id: 'admin-master', name: 'Admin Master', description: 'Successfully managed platform settings.', icon: 'ShieldCheck', achieved: true }, // Admin only badge example
];

// Sample Blog Posts
export const sampleBlogPosts: BlogPost[] = [
  {
    id: 'blog1',
    tenantId: 'platform', // Global post
    title: 'Mastering the AI Resume Analysis',
    slug: 'mastering-ai-resume-analysis',
    author: 'ResumeMatch AI Team',
    date: '2024-07-20T10:00:00Z',
    imageUrl: 'https://picsum.photos/seed/blogai/800/400',
    content: 'Learn how to leverage our AI analysis tool to its full potential. Understand match scores, keyword analysis, and how to use suggestions effectively...\n\n *Detailed content goes here*',
    excerpt: 'Learn how to leverage our AI analysis tool to its full potential. Understand match scores, keyword analysis...',
    tags: ['resume', 'ai', 'jobsearch'],
  },
  {
    id: 'blog2',
    tenantId: SAMPLE_TENANT_ID, // Tenant-specific post
    title: 'Networking Success Stories from State University Alumni',
    slug: 'state-uni-networking-success',
    author: 'Alumni Relations (State University)',
    date: '2024-07-15T14:30:00Z',
    imageUrl: 'https://picsum.photos/seed/blognetwork/800/400',
    content: 'Hear inspiring stories from fellow alumni who found opportunities through the ResumeMatch AI network. Discover tips for effective networking...\n\n *Detailed content goes here*',
    excerpt: 'Hear inspiring stories from fellow alumni who found opportunities through the ResumeMatch AI network...',
    tags: ['networking', 'career', 'success stories'],
  },
  {
    id: 'blog3',
    tenantId: 'platform',
    title: 'The Power of Mentorship: Connecting Generations',
    slug: 'power-of-mentorship',
    author: 'ResumeMatch AI Team',
    date: '2024-07-10T09:00:00Z',
    imageUrl: 'https://picsum.photos/seed/blogmentor/800/400',
    content: 'Explore the benefits of both being a mentor and finding a mentor within our community. How our platform facilitates these connections...\n\n *Detailed content goes here*',
    excerpt: 'Explore the benefits of both being a mentor and finding a mentor within our community...',
    tags: ['mentorship', 'community', 'connections'],
  },
];
