






import type { JobApplication, AlumniProfile, Activity, CommunityPost, FeatureRequest, GalleryEvent, JobOpening, UserProfile, UserRole, Gender, DegreeProgram, Industry, SupportArea, TimeCommitment, EngagementMode, SupportTypeSought, ResumeScanHistoryItem, Appointment, Wallet, ResumeProfile, Tenant, Badge, BlogPost, ReferralHistoryItem, GamificationRule, UserStatus, SurveyResponse, Affiliate, AffiliateClick, AffiliateSignup, AffiliateStatus, SurveyStep } from '@/types';
import { AreasOfSupport, AppointmentStatuses, Genders, DegreePrograms, Industries, TimeCommitments, EngagementModes, SupportTypesSought } from '@/types'; // Import AppointmentStatuses and other const arrays

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
    status: 'active',
    lastLogin: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
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
    status: 'active',
    lastLogin: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
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
    status: 'inactive',
    lastLogin: new Date(Date.now() - 86400000 * 30).toISOString(), // 30 days ago
    interests: ['Chess', 'Reading Sci-Fi', 'Data For Good'],
    offersHelpWith: [AreasOfSupport[0], AreasOfSupport[7]], // Mentoring, Curriculum Feedback
    appointmentCoinCost: 10,
  },
  {
    id: 'alumni4',
    tenantId: SAMPLE_TENANT_ID,
    name: 'Diana Prince (Admin)', // Marking as Admin for clarity in samplePlatformUsers
    profilePictureUrl: 'https://picsum.photos/seed/diana/200/200',
    currentJobTitle: 'Marketing Lead',
    company: 'Amazon',
    shortBio: 'Specializing in digital marketing strategies. Graduated 2016.',
    university: 'Commerce College',
    skills: ['SEO', 'Content Marketing', 'Social Media', 'PPC Advertising'],
    email: "diana.prince.admin@example.com", // Different email for admin
    role: 'admin', 
    status: 'active',
    lastLogin: new Date(Date.now() - 86400000 * 0.5).toISOString(), // 12 hours ago
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
  { id: 'post1', tenantId: SAMPLE_TENANT_ID, userId: 'user123', userName: 'John Doe', userAvatar: 'https://picsum.photos/seed/johndoe/50/50', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), content: 'Anyone have experience with tackling take-home assignments for Senior Eng roles? Tips appreciated!', type: 'text', tags: ['jobsearch', 'interviewtips'], moderationStatus: 'visible', flagCount: 0 },
  { id: 'post2', tenantId: SAMPLE_TENANT_ID, userId: 'user456', userName: 'Jane Smith', userAvatar: 'https://picsum.photos/seed/janesmith/50/50', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), content: 'Looking for a mentor in the Product Management space. Any alumni willing to connect?', type: 'request', tags: ['mentorship', 'productmanagement'], status: 'open', moderationStatus: 'visible', flagCount: 0 },
  { id: 'post3', tenantId: SAMPLE_TENANT_ID, userId: 'alumni1', userName: 'Alice Wonderland', userAvatar: 'https://picsum.photos/seed/alice/50/50', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), content: 'Upcoming Workshop: Intro to Cloud Native', type: 'event', eventTitle: 'Intro to Cloud Native', eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), eventLocation: 'Online (Zoom)', tags: ['workshop', 'cloud'], moderationStatus: 'visible', flagCount: 0 },
  { id: 'post4', tenantId: SAMPLE_TENANT_ID, userId: 'user789', userName: 'Bad Actor', userAvatar: 'https://picsum.photos/seed/badactor/50/50', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), content: 'This is a borderline inappropriate post for testing moderation.', type: 'text', tags: ['testing'], moderationStatus: 'flagged', flagCount: 1 },
  { id: 'post5', tenantId: SAMPLE_TENANT_ID, userId: 'user101', userName: 'Another User', userAvatar: 'https://picsum.photos/seed/anotheruser/50/50', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(), content: 'This post has been removed by admin.', type: 'text', tags: ['removed'], moderationStatus: 'removed', flagCount: 0 },
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
  { id: 'job2', tenantId: SAMPLE_TENANT_ID, title: 'Marketing Intern (Summer)', company: 'Amazon', postedByAlumniId: 'alumni4', alumniName: 'Diana Prince (Admin)', description: 'Gain hands-on experience in a fast-paced marketing environment.', datePosted: '2024-07-08', location: 'Seattle, WA', type: 'Internship' },
  { id: 'job3', tenantId: SAMPLE_TENANT_ID, title: 'Project Manager - Mentorship Program', company: 'Self-Employed (Mentorship)', postedByAlumniId: 'alumni2', alumniName: 'Bob The Builder', description: 'Looking to mentor aspiring Product Managers. Part-time commitment.', datePosted: '2024-07-05', location: 'Remote', type: 'Mentorship' },
];

// Default sample user profile - CAN BE MODIFIED FOR TESTING ROLES
export const sampleUserProfile: UserProfile = {
  id: 'currentUser',
  tenantId: SAMPLE_TENANT_ID,
  role: 'user', 
  name: 'Alex Taylor (User)', 
  email: 'user@example.com', 
  status: 'active',
  lastLogin: new Date().toISOString(),
  dateOfBirth: '1995-08-15',
  gender: 'Male',
  mobileNumber: '+15551234567',
  currentAddress: '123 Main St, Anytown, CA, USA',

  graduationYear: '2017',
  degreeProgram: 'Bachelor of Science (B.Sc)',
  department: 'Computer Science',

  currentJobTitle: 'Software Developer',
  currentOrganization: 'Tech Startup Inc.',
  industry: 'IT/Software',
  workLocation: 'Remote',
  linkedInProfile: 'https://linkedin.com/in/alexuser',
  yearsOfExperience: '5',

  skills: ['JavaScript', 'React', 'Node.js', 'Problem Solving'],
  areasOfSupport: ['Mentoring Students'],
  timeCommitment: '1-2 hours',
  preferredEngagementMode: 'Online',
  otherComments: 'Happy to help with technical questions.',

  lookingForSupportType: 'Career Mentoring',
  helpNeededDescription: 'Guidance on advancing to a senior role.',

  shareProfileConsent: true, 
  featureInSpotlightConsent: true,

  bio: 'Enthusiastic software developer passionate about creating innovative solutions.',
  profilePictureUrl: 'https://picsum.photos/seed/alexuser/200/200',
  resumeText: `Alex Taylor (User)
  Email: user@example.com
  Role: Software Developer

  Summary:
  A highly motivated and results-oriented Software Developer with 5 years of experience in building and maintaining web applications. Proficient in JavaScript, React, Node.js, and cloud technologies. Strong problem-solving skills and a collaborative team player. Eager to contribute to innovative projects and continuously learn new technologies.
  
  Experience:
  Software Developer, Tech Startup Inc. (Jan 2020 - Present)
  - Developed and maintained front-end components using React and TypeScript.
  - Built RESTful APIs with Node.js and Express.
  - Collaborated with cross-functional teams to deliver high-quality software products.
  
  Junior Developer, Web Solutions Co. (Jun 2017 - Dec 2019)
  - Assisted in the development of client websites using HTML, CSS, and JavaScript.
  - Provided technical support and bug fixes for existing applications.
  
  Education:
  Bachelor of Science in Computer Science, State University (2013 - 2017)
  
  Skills:
  JavaScript, React, Redux, Node.js, Express, TypeScript, HTML, CSS, Git, SQL, MongoDB, AWS.
  `,
  careerInterests: 'Full-stack Development, AI Applications, Web Technologies',
  xpPoints: 1250,
  dailyStreak: 15, 
  longestStreak: 25, 
  totalActiveDays: 300, 
  weeklyActivity: [true, true, false, true, true, false, true],
  referralCode: 'USERREF789',
  earnedBadges: ['profile-pro', 'analyzer-ace', 'networker'],
  affiliateCode: 'AFFUSER007',
};

// Sample platform users for user management page
export const samplePlatformUsers: UserProfile[] = [
  sampleUserProfile, // Current user (now a 'user')
  // Find the 'Diana Prince' entry from sampleAlumni and ensure it's the admin
  ...sampleAlumni.map(alumni => ({
    ...alumni,
    id: alumni.id,
    tenantId: alumni.tenantId,
    role: alumni.email === "diana.prince.admin@example.com" ? 'admin' : (alumni.role || 'user'), // Ensure Diana is admin
    name: alumni.name,
    email: alumni.email,
    status: alumni.status || (Math.random() > 0.2 ? 'active' : 'inactive'),
    lastLogin: alumni.lastLogin || new Date(Date.now() - 86400000 * Math.floor(Math.random() * 30)).toISOString(),
    profilePictureUrl: alumni.profilePictureUrl,
    dateOfBirth: '1990-01-01',
    gender: 'Prefer not to say',
    graduationYear: '2015',
    currentJobTitle: alumni.currentJobTitle,
    currentOrganization: alumni.company,
    skills: alumni.skills,
    xpPoints: Math.floor(Math.random() * 5000),
    dailyStreak: Math.floor(Math.random() * 30),
    weeklyActivity: Array(7).fill(false).map(() => Math.random() > 0.5),
  }))
];


export const sampleAppointments: Appointment[] = [
    { id: 'appt1', tenantId: SAMPLE_TENANT_ID, requesterUserId: 'currentUser', alumniUserId: 'alumni1', title: 'Mentorship Session with Alice W.', dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), withUser: 'Alice Wonderland', status: 'Confirmed', costInCoins: 10, meetingLink: 'https://zoom.us/j/1234567890' },
    { id: 'appt2', tenantId: SAMPLE_TENANT_ID, requesterUserId: 'currentUser', alumniUserId: 'alumni2', title: 'Networking Call with Bob B.', dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), withUser: 'Bob The Builder', status: 'Pending', costInCoins: 15 },
    { id: 'appt3', tenantId: SAMPLE_TENANT_ID, requesterUserId: 'alumni3', alumniUserId: 'currentUser', title: 'Incoming Request: Career Advice', dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), withUser: 'Charlie Brown', status: 'Pending', costInCoins: 10 }, // Example of incoming request
    { id: 'appt4', tenantId: SAMPLE_TENANT_ID, requesterUserId: 'currentUser', alumniUserId: 'alumni4', title: 'Discuss Marketing Strategy', dateTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), withUser: 'Diana Prince (Admin)', status: 'Completed', costInCoins: 20 }, // Example of completed appointment
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
  {
    id: 'tenant-1',
    name: 'Default University',
    createdAt: new Date().toISOString(),
    settings: {
      allowPublicSignup: true,
      customLogoUrl: 'https://picsum.photos/seed/logo1/200/50',
      primaryColor: 'hsl(180 100% 25%)', // Teal
      accentColor: 'hsl(180 100% 30%)',
      features: {
        communityFeedEnabled: true,
        jobBoardEnabled: true,
        gamificationEnabled: true,
        walletEnabled: true,
        eventRegistrationEnabled: true,
      },
      emailTemplates: {
        welcomeEmail: 'Welcome to Default University Alumni Network!',
      }
    }
  },
  {
    id: 'tenant-2',
    name: 'Corporate Partner Inc.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    settings: {
      allowPublicSignup: false,
      primaryColor: 'hsl(221 83% 53%)', // Blue
      accentColor: 'hsl(221 83% 63%)',
      features: {
        communityFeedEnabled: false,
        jobBoardEnabled: true,
        gamificationEnabled: false,
        walletEnabled: false,
        eventRegistrationEnabled: true,
      }
    }
  },
  {
    id: 'tenant-3',
    name: 'Community College Connect',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    settings: {
      allowPublicSignup: true,
      primaryColor: 'hsl(39 100% 50%)', // Orange
      accentColor: 'hsl(39 100% 55%)',
      features: {
        communityFeedEnabled: true,
        jobBoardEnabled: true,
        gamificationEnabled: true,
        walletEnabled: true,
        eventRegistrationEnabled: false,
      }
    }
  },
];

// Sample Badges (now includes reward and trigger)
export const sampleBadges: Badge[] = [
    { id: 'profile-pro', name: 'Profile Pro', description: 'Completed 100% of your profile.', icon: 'UserCheck', xpReward: 100, triggerCondition: 'Profile completion reaches 100%' },
    { id: 'early-adopter', name: 'Early Adopter', description: 'Joined within the first month of launch.', icon: 'Award', xpReward: 50, triggerCondition: 'User signup date within launch window' },
    { id: 'networker', name: 'Networker', description: 'Made 10+ alumni connections.', icon: 'Users', xpReward: 75, triggerCondition: 'Number of connections > 10' },
    { id: 'analyzer-ace', name: 'Analyzer Ace', description: 'Analyzed 5+ resumes.', icon: 'Zap', xpReward: 50, triggerCondition: 'Resume scan count > 5' },
    { id: 'contributor', name: 'Contributor', description: 'Posted 5+ times in the community feed.', icon: 'MessageSquare', xpReward: 30, triggerCondition: 'Community post count > 5' },
    { id: 'admin-master', name: 'Admin Master', description: 'Successfully managed platform settings.', icon: 'ShieldCheck', xpReward: 0, triggerCondition: 'User role is Admin' }, // Admin only badge example
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
    content: 'Learn how to leverage our AI analysis tool to its full potential. Understand match scores, keyword analysis, and how to use suggestions effectively...\n\nOur AI engine scans your resume against the provided job description, identifying key skills, experiences, and keywords. It then calculates a match score based on alignment.\n\n**Understanding the Score:**\n- **80%+:** Excellent match, likely a strong candidate.\n- **60-79%:** Good match, minor adjustments might be needed.\n- **Below 60%:** Significant gaps, consider tailoring your resume.\n\n**Using Suggestions:**\nThe AI provides suggestions for improvement. Focus on incorporating missing keywords naturally and highlighting relevant experiences mentioned in the job description. Remember, authenticity is key!\n\n*This is sample content. More details would follow in a real post.*',
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
    content: 'Hear inspiring stories from fellow alumni who found opportunities through the ResumeMatch AI network. Discover tips for effective networking...\n\nAlice Wonderland (Class of \'15) shares how a connection made through the platform led to her current role at Google. "The recommendation feature pointed me towards someone I hadn\'t considered, and it turned out to be the perfect connection," she says.\n\nBob The Builder (Class of \'18) used the Alumni Search to find mentors in Product Management. "Being able to filter by skills and industry was invaluable," Bob notes.\n\n**Networking Tips:**\n1. Personalize your connection requests.\n2. Be clear about what you\'re seeking (advice, referral, chat).\n3. Follow up respectfully.\n\n*This is sample content. More details would follow in a real post.*',
    excerpt: 'Hear inspiring stories from fellow alumni who found opportunities through the ResumeMatch AI network...',
    tags: ['networking', 'career', 'success stories', 'state university'],
  },
  {
    id: 'blog3',
    tenantId: 'platform',
    title: 'The Power of Mentorship: Connecting Generations',
    slug: 'power-of-mentorship',
    author: 'ResumeMatch AI Team',
    date: '2024-07-10T09:00:00Z',
    imageUrl: 'https://picsum.photos/seed/blogmentor/800/400',
    content: 'Explore the benefits of both being a mentor and finding a mentor within our community. How our platform facilitates these connections...\n\nMentorship provides invaluable guidance for career growth. Our platform makes it easy to identify alumni willing to offer support in specific areas.\n\n**Benefits for Mentees:**\n- Gain industry insights.\n- Receive personalized career advice.\n- Expand your professional network.\n\n**Benefits for Mentors:**\n- Develop leadership skills.\n- Give back to the community.\n- Stay connected with emerging talent.\n\nUse the Alumni Directory filters to find potential mentors or mentees based on your interests and needs.\n\n*This is sample content. More details would follow in a real post.*',
    excerpt: 'Explore the benefits of both being a mentor and finding a mentor within our community...',
    tags: ['mentorship', 'community', 'connections'],
  },
];

// Sample Referral History
export const sampleReferralHistory: ReferralHistoryItem[] = [
  { id: 'ref1', referrerUserId: 'currentUser', referredEmailOrName: 'friend1@example.com', referralDate: new Date(Date.now() - 86400000 * 7).toISOString(), status: 'Signed Up' },
  { id: 'ref2', referrerUserId: 'currentUser', referredEmailOrName: 'colleague@example.com', referralDate: new Date(Date.now() - 86400000 * 5).toISOString(), status: 'Reward Earned', rewardAmount: 25 },
  { id: 'ref3', referrerUserId: 'currentUser', referredEmailOrName: 'contact@example.com', referralDate: new Date(Date.now() - 86400000 * 3).toISOString(), status: 'Pending' },
  { id: 'ref4', referrerUserId: 'currentUser', referredEmailOrName: 'another@example.com', referralDate: new Date(Date.now() - 86400000 * 10).toISOString(), status: 'Expired' },
];

// Sample Gamification XP Rules
export const sampleXpRules: GamificationRule[] = [
    { actionId: 'profile_complete_50', description: 'Reach 50% Profile Completion', xpPoints: 25 },
    { actionId: 'profile_complete_100', description: 'Reach 100% Profile Completion', xpPoints: 100 },
    { actionId: 'resume_scan', description: 'Analyze a Resume', xpPoints: 20 },
    { actionId: 'book_appointment', description: 'Book an Appointment', xpPoints: 30 },
    { actionId: 'community_post', description: 'Create a Community Post', xpPoints: 15 },
    { actionId: 'community_comment', description: 'Comment on a Post', xpPoints: 5 },
    { actionId: 'successful_referral', description: 'Successful Referral Signup', xpPoints: 50 },
    { actionId: 'daily_login', description: 'Daily Login', xpPoints: 10 },
];

// Sample Survey Responses for Messenger Management
export const sampleSurveyResponses: SurveyResponse[] = [
    {
        id: 'resp1',
        userId: 'alumni1',
        userName: 'Alice Wonderland',
        surveyId: 'initialFeedbackSurvey',
        surveyName: 'Initial User Feedback',
        responseDate: new Date(Date.now() - 86400000 * 1).toISOString(),
        data: {
            experience: 'amazing',
            loved_feature: 'Resume Analyzer accuracy',
            referral_likelihood: 'very_likely'
        }
    },
    {
        id: 'resp2',
        userId: 'alumni2',
        userName: 'Bob The Builder',
        surveyId: 'initialFeedbackSurvey',
        surveyName: 'Initial User Feedback',
        responseDate: new Date(Date.now() - 86400000 * 2).toISOString(),
        data: {
            experience: 'okay',
            improvement_suggestion: 'More filter options in Alumni Connect',
            referral_likelihood: 'likely'
        }
    },
    {
        id: 'resp3',
        userId: 'alumni3',
        userName: 'Charlie Brown',
        surveyId: 'initialFeedbackSurvey',
        surveyName: 'Initial User Feedback',
        responseDate: new Date(Date.now() - 86400000 * 3).toISOString(),
        data: {
            experience: 'needs_improvement',
            frustration_details: 'The job board sometimes loads slowly.',
            referral_likelihood: 'neutral'
        }
    }
];

// Sample Affiliate Data
export const sampleAffiliates: Affiliate[] = [
  {
    id: 'affiliateuser1', // Example of a non-admin user who is an affiliate
    userId: 'alumni1', // Alice Wonderland is an affiliate
    name: 'Alice Wonderland',
    email: 'alice.wonderland@example.com',
    status: 'approved' as AffiliateStatus,
    affiliateCode: 'ALICEAFF',
    commissionRate: 0.10,
    totalEarned: 55.00,
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
  {
    id: 'affiliateuser2', // Bob The Builder
    userId: 'alumni2',
    name: 'Bob The Builder',
    email: 'bob.builder@example.com',
    status: 'pending' as AffiliateStatus,
    affiliateCode: 'BOBAFF',
    commissionRate: 0.12,
    totalEarned: 0,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
   {
    id: 'affiliateuser3', // Charlie Brown
    userId: 'alumni3',
    name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    status: 'rejected' as AffiliateStatus,
    affiliateCode: 'CHARLIEAFF',
    commissionRate: 0.10,
    totalEarned: 0,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  // The current 'currentUser' (Alex Taylor User) can also be an affiliate
  {
    id: 'currentUser', 
    userId: 'currentUser',
    name: sampleUserProfile.name, // Should be 'Alex Taylor (User)'
    email: sampleUserProfile.email, // Should be 'user@example.com'
    status: 'approved' as AffiliateStatus,
    affiliateCode: sampleUserProfile.affiliateCode || 'AFFUSER007',
    commissionRate: 0.15,
    totalEarned: 125.50,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
];


export const sampleAffiliateClicks: AffiliateClick[] = [
  { id: 'click1', affiliateId: 'currentUser', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), convertedToSignup: true },
  { id: 'click2', affiliateId: 'currentUser', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), convertedToSignup: false },
  { id: 'click3', affiliateId: 'affiliateuser1', timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), convertedToSignup: true }, // Alice's click
  { id: 'click4', affiliateId: 'currentUser', timestamp: new Date(Date.now() - 86400000 * 0.5).toISOString(), convertedToSignup: false }, 
  { id: 'click5', affiliateId: 'affiliateuser1', timestamp: new Date(Date.now() - 86400000 * 4).toISOString(), convertedToSignup: false }, // Alice's click
  { id: 'click6', affiliateId: 'affiliateuser2', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), convertedToSignup: false }, // Bob's click (pending affiliate)
];

export const sampleAffiliateSignups: AffiliateSignup[] = [
  { id: 'signup1', affiliateId: 'currentUser', newUserId: 'newUser1', signupDate: new Date(Date.now() - 86400000 * 2).toISOString(), commissionEarned: 7.50 },
  { id: 'signup2', affiliateId: 'affiliateuser1', newUserId: 'newUser2', signupDate: new Date(Date.now() - 86400000 * 3).toISOString(), commissionEarned: 5.00 }, // Alice's signup
  { id: 'signup3', affiliateId: 'currentUser', newUserId: 'newUser3', signupDate: new Date(Date.now() - 86400000 * 1).toISOString(), commissionEarned: 10.00 }, 
  { id: 'signup4', affiliateId: 'affiliateuser1', newUserId: 'newUser4', signupDate: new Date(Date.now() - 86400000 * 5).toISOString(), commissionEarned: 5.00 }, // Alice's signup
];

// Profile Completion Survey Definition
export const profileCompletionSurveyDefinition: SurveyStep[] = [
  // Intro
  { id: 'pc_intro', type: 'botMessage', text: "Let's complete your profile! This will help us personalize your experience and connect you with better opportunities.", nextStepId: 'pc_s1_start' },

  // Section 1: Personal & Contact Information
  { id: 'pc_s1_start', type: 'botMessage', text: "First, some personal details.", nextStepId: 'pc_s1_fullName' },
  { id: 'pc_s1_fullName', type: 'userInput', text: "What's your full name? (Required)", placeholder: "e.g., John Doe", variableName: 'fullName', nextStepId: 'pc_s1_dob' },
  { id: 'pc_s1_dob', type: 'userInput', inputType: 'date', text: "What's your date of birth? (YYYY-MM-DD)", placeholder: "YYYY-MM-DD", variableName: 'dateOfBirth', nextStepId: 'pc_s1_gender' },
  { id: 'pc_s1_gender', type: 'userDropdown', text: "What's your gender?", dropdownOptions: Genders.map(g => ({label: g, value: g})), variableName: 'gender', nextStepId: 'pc_s1_email' },
  { id: 'pc_s1_email', type: 'userInput', inputType: 'email', text: "What's your email ID? (Required)", placeholder: "you@example.com", variableName: 'email', nextStepId: 'pc_s1_mobile' },
  { id: 'pc_s1_mobile', type: 'userInput', inputType: 'tel', text: "What's your mobile number (with country code)?", placeholder: "+1 123 456 7890", variableName: 'mobileNumber', nextStepId: 'pc_s1_address' },
  { id: 'pc_s1_address', type: 'userInput', text: "What's your current address (City, State, Country)?", placeholder: "San Francisco, CA, USA", inputType: 'textarea', variableName: 'currentAddress', nextStepId: 'pc_s2_start' },

  // Section 2: Academic Information
  { id: 'pc_s2_start', type: 'botMessage', text: "Great! Now, let's cover your academic background.", nextStepId: 'pc_s2_gradYear' },
  { id: 'pc_s2_gradYear', type: 'userDropdown', text: "What's your year of graduation/batch?", dropdownOptions: graduationYears.map(y => ({label: y, value: y})), variableName: 'graduationYear', nextStepId: 'pc_s2_degree' },
  { id: 'pc_s2_degree', type: 'userDropdown', text: "What's your degree/program?", dropdownOptions: DegreePrograms.map(d => ({label: d, value: d})), variableName: 'degreeProgram', nextStepId: 'pc_s2_department' },
  { id: 'pc_s2_department', type: 'userInput', text: "What's your department?", placeholder: "e.g., Computer Science", variableName: 'department', nextStepId: 'pc_s3_start' },

  // Section 3: Professional Information
  { id: 'pc_s3_start', type: 'botMessage', text: "Excellent. Let's move on to your professional information.", nextStepId: 'pc_s3_jobTitle' },
  { id: 'pc_s3_jobTitle', type: 'userInput', text: "What's your current job title?", placeholder: "e.g., Software Engineer", variableName: 'currentJobTitle', nextStepId: 'pc_s3_organization' },
  { id: 'pc_s3_organization', type: 'userInput', text: "What's your current organization?", placeholder: "e.g., Tech Corp", variableName: 'currentOrganization', nextStepId: 'pc_s3_industry' },
  { id: 'pc_s3_industry', type: 'userDropdown', text: "What's your industry/sector?", dropdownOptions: Industries.map(i => ({label: i, value: i})), variableName: 'industry', nextStepId: 'pc_s3_workLocation' },
  { id: 'pc_s3_workLocation', type: 'userInput', text: "What's your work location (City, Country)?", placeholder: "e.g., London, UK", variableName: 'workLocation', nextStepId: 'pc_s3_linkedin' },
  { id: 'pc_s3_linkedin', type: 'userInput', inputType: 'url', text: "What's your LinkedIn profile URL? (Optional)", placeholder: "https://linkedin.com/in/yourprofile", variableName: 'linkedInProfile', nextStepId: 'pc_s3_experience' },
  { id: 'pc_s3_experience', type: 'userInput', text: "How many years of experience do you have?", placeholder: "e.g., 5 or 5+", variableName: 'yearsOfExperience', nextStepId: 'pc_s3_skills_prompt' },
  { id: 'pc_s3_skills_prompt', type: 'botMessage', text: "What are your key skills or areas of expertise? (Please list them, separated by commas)", nextStepId: 'pc_s3_skills_input' },
  { id: 'pc_s3_skills_input', type: 'userInput', placeholder: "e.g., React, Python, Data Analysis", inputType: 'textarea', variableName: 'skills', nextStepId: 'pc_s4_start' },
  
  // Section 4: Alumni Engagement & Support Interests
  { id: 'pc_s4_start', type: 'botMessage', text: "Let's talk about alumni engagement.", nextStepId: 'pc_s4_supportAreas_prompt' },
  { id: 'pc_s4_supportAreas_prompt', type: 'botMessage', text: `Which areas can you support? (Comma-separated from: ${AreasOfSupport.join(', ')})`, nextStepId: 'pc_s4_supportAreas_input' }, // This might be better as multi-select checkboxes in a real UI, but for chatbot, free text then parse.
  { id: 'pc_s4_supportAreas_input', type: 'userInput', text: "Your areas of support:", placeholder: "e.g., Mentoring Students, Job Referrals", inputType: 'textarea', variableName: 'areasOfSupport', nextStepId: 'pc_s4_timeCommitment' },
  { id: 'pc_s4_timeCommitment', type: 'userDropdown', text: "How much time are you willing to commit per month?", dropdownOptions: TimeCommitments.map(tc => ({label: tc, value: tc})), variableName: 'timeCommitment', nextStepId: 'pc_s4_engagementMode' },
  { id: 'pc_s4_engagementMode', type: 'userDropdown', text: "What's your preferred mode of engagement?", dropdownOptions: EngagementModes.map(em => ({label: em, value: em})), variableName: 'preferredEngagementMode', nextStepId: 'pc_s4_otherComments' },
  { id: 'pc_s4_otherComments', type: 'userInput', text: "Any other comments or notes regarding engagement? (Optional)", inputType: 'textarea', variableName: 'otherComments', nextStepId: 'pc_s5_start' },

  // Section 5: Help You’re Looking For (Optional)
  { id: 'pc_s5_start', type: 'botMessage', text: "Now, optionally, tell us if you're looking for any specific support.", nextStepId: 'pc_s5_supportType' },
  { id: 'pc_s5_supportType', type: 'userDropdown', text: "What type of support are you looking for? (Optional)", dropdownOptions: [{label: "Not looking for support now", value: "none"}, ...SupportTypesSought.map(st => ({label: st, value: st}))], variableName: 'lookingForSupportType', nextStepId: 'pc_s5_helpNeeded' },
  { id: 'pc_s5_helpNeeded', type: 'userInput', text: "Briefly describe the help you need. (Optional, if you selected a support type)", inputType: 'textarea', variableName: 'helpNeededDescription', nextStepId: 'pc_s6_start' },

  // Section 6: Visibility & Consent
  { id: 'pc_s6_start', type: 'botMessage', text: "Almost done! Just a couple of consent questions.", nextStepId: 'pc_s6_shareProfile' },
  { id: 'pc_s6_shareProfile', type: 'userOptions', text: "Can we share your profile with other alumni for relevant collaboration?", options: [{text: 'Yes', value: 'true', nextStepId: 'pc_s6_featureSpotlight'}, {text: 'No', value: 'false', nextStepId: 'pc_s6_featureSpotlight'}], variableName: 'shareProfileConsent' },
  { id: 'pc_s6_featureSpotlight', type: 'userOptions', text: "Can we feature you on the alumni dashboard or spotlight?", options: [{text: 'Yes', value: 'true', nextStepId: 'pc_end'}, {text: 'No', value: 'false', nextStepId: 'pc_end'}], variableName: 'featureInSpotlightConsent' },

  // End
  { id: 'pc_end', type: 'botMessage', text: "Thank you for completing your profile information! Your profile is now more discoverable. 🎉", isLastStep: true },
];

