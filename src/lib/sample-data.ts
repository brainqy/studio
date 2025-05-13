

import type { JobApplication, AlumniProfile, Activity, CommunityPost, FeatureRequest, GalleryEvent, JobOpening, UserProfile, UserRole, Gender, DegreeProgram, Industry, SupportArea, TimeCommitment, EngagementMode, SupportTypeSought, ResumeScanHistoryItem, Appointment, Wallet, ResumeProfile, Tenant, Badge, BlogPost, ReferralHistoryItem, GamificationRule, UserStatus, SurveyResponse, Affiliate, AffiliateClick, AffiliateSignup, AffiliateStatus, SurveyStep, ResumeTemplate, TourStep, CommunityComment, InterviewQuestion, InterviewQuestionCategory, BlogGenerationSettings, MockInterviewSession, InterviewQuestionDifficulty, InterviewQuestionUserComment, PracticeSession, PracticeSessionStatus } from '@/types';
import { AreasOfSupport, AppointmentStatuses, Genders, DegreePrograms, Industries, TimeCommitments, EngagementModes, SupportTypesSought } from '@/types'; // Import AppointmentStatuses and other const arrays

const SAMPLE_TENANT_ID = 'tenant-1'; // Define a default tenant ID for sample data

export const sampleJobApplications: JobApplication[] = [
  { id: '1', tenantId: SAMPLE_TENANT_ID, userId: 'currentUser', companyName: 'Tech Solutions Inc.', jobTitle: 'Software Engineer', status: 'Applied', dateApplied: '2024-07-01', notes: 'Applied via company portal.', location: 'Remote', resumeUsed: 'resume1', reminderDate: new Date(Date.now() + 86400000 * 7).toISOString() }, 
  { id: '2', tenantId: SAMPLE_TENANT_ID, userId: 'currentUser', companyName: 'Innovate LLC', jobTitle: 'Frontend Developer', status: 'Interviewing', dateApplied: '2024-06-25', notes: 'First interview scheduled for 2024-07-10.', location: 'New York, NY', resumeUsed: 'resume1' },
  { id: '3', tenantId: SAMPLE_TENANT_ID, userId: 'currentUser', companyName: 'Data Corp', jobTitle: 'Data Analyst', status: 'Offer', dateApplied: '2024-06-15', notes: 'Received offer, considering.', location: 'San Francisco, CA', resumeUsed: 'resume3', reminderDate: new Date(Date.now() + 86400000 * 3).toISOString() }, 
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
    lastLogin: new Date(Date.now() - 86400000 * 1).toISOString(), 
    interests: ['Hiking', 'Photography', 'Open Source'],
    offersHelpWith: [AreasOfSupport[0], AreasOfSupport[2], AreasOfSupport[4]], 
    appointmentCoinCost: 10,
    xpPoints: 2500,
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
    lastLogin: new Date(Date.now() - 86400000 * 2).toISOString(), 
    interests: ['Woodworking', 'Community Volunteering', 'Travel'],
    offersHelpWith: [AreasOfSupport[1], AreasOfSupport[3], AreasOfSupport[8]], 
    appointmentCoinCost: 15,
    xpPoints: 1800,
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
    lastLogin: new Date(Date.now() - 86400000 * 30).toISOString(), 
    interests: ['Chess', 'Reading Sci-Fi', 'Data For Good'],
    offersHelpWith: [AreasOfSupport[0], AreasOfSupport[7]], 
    appointmentCoinCost: 10,
    xpPoints: 1200,
  },
  {
    id: 'alumni4',
    tenantId: SAMPLE_TENANT_ID,
    name: 'Diana Prince (Admin)', 
    profilePictureUrl: 'https://picsum.photos/seed/diana/200/200',
    currentJobTitle: 'Marketing Lead',
    company: 'Amazon',
    shortBio: 'Specializing in digital marketing strategies. Graduated 2016.',
    university: 'Commerce College',
    skills: ['SEO', 'Content Marketing', 'Social Media', 'PPC Advertising'],
    email: "diana.prince.admin@example.com", 
    role: 'admin', 
    status: 'active',
    lastLogin: new Date(Date.now() - 0.5 * 86400000).toISOString(),
    interests: ['Yoga', 'Creative Writing', 'Digital Trends'],
    offersHelpWith: [AreasOfSupport[2], AreasOfSupport[5], AreasOfSupport[9]], 
    appointmentCoinCost: 20,
    xpPoints: 5000,
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

export let sampleCommunityPosts: CommunityPost[] = [ // Changed to let for dynamic updates
  { 
    id: 'post1', 
    tenantId: SAMPLE_TENANT_ID, 
    userId: 'user123', 
    userName: 'John Doe', 
    userAvatar: 'https://picsum.photos/seed/johndoe/50/50', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), 
    content: 'Anyone have experience with tackling take-home assignments for Senior Eng roles? Tips appreciated!', 
    type: 'text', 
    tags: ['jobsearch', 'interviewtips'], 
    moderationStatus: 'visible', 
    flagCount: 0,
    comments: [
      { id: 'comment1-1', userId: 'alumni1', userName: 'Alice Wonderland', userAvatar: 'https://picsum.photos/seed/alice/50/50', timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(), text: 'Focus on clean code and clear documentation for your solution. Good luck!' },
      { id: 'comment1-2', userId: 'user456', userName: 'Jane Smith', userAvatar: 'https://picsum.photos/seed/janesmith/50/50', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), text: 'Great question! I usually allocate specific time blocks for each part of the assignment.' },
    ]
  },
  { 
    id: 'post2', 
    tenantId: SAMPLE_TENANT_ID, 
    userId: 'user456', 
    userName: 'Jane Smith', 
    userAvatar: 'https://picsum.photos/seed/janesmith/50/50', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), 
    content: 'Looking for a mentor in the Product Management space. Any alumni willing to connect?', 
    type: 'request', 
    tags: ['mentorship', 'productmanagement'], 
    status: 'open', 
    moderationStatus: 'visible', 
    flagCount: 0,
    comments: [] 
  },
  { 
    id: 'post3', 
    tenantId: SAMPLE_TENANT_ID, 
    userId: 'alumni1', 
    userName: 'Alice Wonderland', 
    userAvatar: 'https://picsum.photos/seed/alice/50/50', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), 
    content: 'Upcoming Workshop: Intro to Cloud Native', 
    type: 'event', 
    eventTitle: 'Intro to Cloud Native', 
    eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), 
    eventLocation: 'Online (Zoom)', 
    tags: ['workshop', 'cloud'], 
    moderationStatus: 'visible', 
    flagCount: 0,
    comments: [
       { id: 'comment3-1', userId: 'user123', userName: 'John Doe', userAvatar: 'https://picsum.photos/seed/johndoe/50/50', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), text: 'Sounds interesting! Will there be a recording?' },
    ]
  },
  { 
    id: 'post4', 
    tenantId: SAMPLE_TENANT_ID, 
    userId: 'user789', 
    userName: 'Bad Actor', 
    userAvatar: 'https://picsum.photos/seed/badactor/50/50', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), 
    content: 'This is a borderline inappropriate post for testing moderation.', 
    type: 'text', 
    tags: ['testing'], 
    moderationStatus: 'flagged', 
    flagCount: 1,
    comments: [] 
  },
  { 
    id: 'post5', 
    tenantId: SAMPLE_TENANT_ID, 
    userId: 'user101', 
    userName: 'Another User', 
    userAvatar: 'https://picsum.photos/seed/anotheruser/50/50', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(), 
    content: 'This post has been removed by admin.', 
    type: 'text', 
    tags: ['removed'], 
    moderationStatus: 'removed', 
    flagCount: 0,
    comments: [] 
  },
];

export const sampleFeatureRequests: FeatureRequest[] = [
  { id: 'fr1', tenantId: SAMPLE_TENANT_ID, userId: 'user789', userName: 'Sam Wilson', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), title: 'Integrate with LinkedIn for profile import', description: 'It would be great to automatically pull resume data from LinkedIn.', status: 'Pending' },
  { id: 'fr2', tenantId: SAMPLE_TENANT_ID, userId: 'user101', userName: 'Maria Hill', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), title: 'Dark mode for the dashboard', description: 'A dark theme option would be easier on the eyes.', status: 'In Progress' },
];

export let sampleGalleryEvents: GalleryEvent[] = [ // Changed to let for admin modifications
  { id: 'event1', tenantId: SAMPLE_TENANT_ID, title: 'Annual Alumni Meet 2023', date: '2023-10-15T10:00:00Z', imageUrl: 'https://picsum.photos/seed/event1/600/400', description: 'A wonderful evening connecting with fellow alumni.' , dataAiHint: 'conference networking'},
  { id: 'event2', tenantId: SAMPLE_TENANT_ID, title: 'Tech Talk Series: AI Today', date: '2024-03-22T10:00:00Z', imageUrl: 'https://picsum.photos/seed/event2/600/400', description: 'Insightful talks on the future of Artificial Intelligence.' , dataAiHint: 'presentation seminar'},
  { id: 'event3', tenantId: SAMPLE_TENANT_ID, title: 'Campus Job Fair Spring 2024', date: '2024-04-10T10:00:00Z', imageUrl: 'https://picsum.photos/seed/event3/600/400', description: 'Connecting students with top employers.', dataAiHint: 'job fair students' },
];

export const sampleJobOpenings: JobOpening[] = [
  { id: 'job1', tenantId: SAMPLE_TENANT_ID, title: 'Junior Developer', company: 'Google', postedByAlumniId: 'alumni1', alumniName: 'Alice Wonderland', description: 'Exciting opportunity for recent graduates to join our engineering team.', datePosted: '2024-07-10', location: 'Mountain View, CA', type: 'Full-time' },
  { id: 'job2', tenantId: SAMPLE_TENANT_ID, title: 'Marketing Intern (Summer)', company: 'Amazon', postedByAlumniId: 'alumni4', alumniName: 'Diana Prince (Admin)', description: 'Gain hands-on experience in a fast-paced marketing environment.', datePosted: '2024-07-08', location: 'Seattle, WA', type: 'Internship' },
  { id: 'job3', tenantId: SAMPLE_TENANT_ID, title: 'Project Manager - Mentorship Program', company: 'Self-Employed (Mentorship)', postedByAlumniId: 'alumni2', alumniName: 'Bob The Builder', description: 'Looking to mentor aspiring Product Managers. Part-time commitment.', datePosted: '2024-07-05', location: 'Remote', type: 'Mentorship' },
];

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
  company: 'Tech Startup Inc.', // Added company for consistency with AlumniProfile
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
  shortBio: 'Enthusiastic software developer passionate about creating innovative solutions. With 5 years in the field, I have honed my skills in JavaScript, React, and Node.js, primarily focusing on building scalable web applications. My experience at Tech Startup Inc. involved leading front-end development for key projects and mentoring junior developers. I am always keen to learn new technologies and contribute to impactful products. Outside of work, I enjoy hiking and exploring new tech trends.',
  university: 'State University', // Added for consistency
  profilePictureUrl: 'https://picsum.photos/seed/alexuser/200/200',
  interests: ['Coding', 'AI Ethics', 'Sci-fi Novels'],
  offersHelpWith: [AreasOfSupport[0]], // Added for consistency
  appointmentCoinCost: 0, // Users typically don't charge themselves
  resumeText: `Alex Taylor (User)
  Email: user@example.com | LinkedIn: linkedin.com/in/alexuser | Mobile: +15551234567

  Summary:
  A highly motivated and results-oriented Software Developer with 5 years of experience in building and maintaining web applications. Proficient in JavaScript, React, Node.js, and cloud technologies. Strong problem-solving skills and a collaborative team player. Eager to contribute to innovative projects and continuously learn new technologies.
  
  Experience:
  Software Developer, Tech Startup Inc. (Jan 2020 - Present)
  - Developed and maintained front-end components using React and TypeScript.
  - Built RESTful APIs with Node.js and Express.js.
  - Collaborated with cross-functional teams to deliver high-quality software products.
  - Mentored 2 junior developers, improving team productivity by 15%.
  
  Junior Developer, Web Solutions Co. (Jun 2017 - Dec 2019)
  - Assisted in the development of client websites using HTML, CSS, and JavaScript.
  - Provided technical support and bug fixes for existing applications.
  
  Education:
  Bachelor of Science in Computer Science, State University (2013 - 2017)
  - Dean's List 2016, 2017
  - Capstone Project: AI-Powered Recommendation Engine
  
  Skills:
  Languages: JavaScript, TypeScript, Python, HTML, CSS
  Frameworks/Libraries: React, Redux, Node.js, Express.js
  Databases: MongoDB, PostgreSQL, SQL
  Tools: Git, Docker, Jenkins, Jira
  Cloud: AWS (EC2, S3, Lambda)
  Other: Agile Methodologies, Problem Solving, Team Collaboration
  `,
  careerInterests: 'Full-stack Development, AI Applications, Web Technologies, Cloud Architecture',
  xpPoints: 1250,
  dailyStreak: 15, 
  longestStreak: 25, 
  totalActiveDays: 300, 
  weeklyActivity: [true, true, false, true, true, false, true], // Represents activity for the last 7 days, with the last element being today
  referralCode: 'USERREF789',
  earnedBadges: ['profile-pro', 'analyzer-ace', 'networker'],
  affiliateCode: 'AFFUSER007',
  // Add sample interview sessions for this user
  pastInterviewSessions: ['session-hist-1', 'session-hist-2'], // IDs referencing sampleMockInterviewSessions
  interviewCredits: 2,
};

export const samplePlatformUsers: UserProfile[] = [
  sampleUserProfile, 
  ...sampleAlumni, 
];


export const sampleAppointments: Appointment[] = [
    { id: 'appt1', tenantId: SAMPLE_TENANT_ID, requesterUserId: 'currentUser', alumniUserId: 'alumni1', title: 'Mentorship Session with Alice W.', dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), withUser: 'Alice Wonderland', status: 'Confirmed', costInCoins: 10, meetingLink: 'https://zoom.us/j/1234567890', reminderDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString() },
    { id: 'appt2', tenantId: SAMPLE_TENANT_ID, requesterUserId: 'currentUser', alumniUserId: 'alumni2', title: 'Networking Call with Bob B.', dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), withUser: 'Bob The Builder', status: 'Pending', costInCoins: 15, reminderDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString() },
    { id: 'appt3', tenantId: SAMPLE_TENANT_ID, requesterUserId: 'alumni3', alumniUserId: 'currentUser', title: 'Incoming Request: Career Advice', dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 0).toISOString(), withUser: 'Charlie Brown', status: 'Pending', costInCoins: 10, reminderDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 0).toISOString() }, // Reminder today
    { id: 'appt4', tenantId: SAMPLE_TENANT_ID, requesterUserId: 'currentUser', alumniUserId: 'alumni4', title: 'Discuss Marketing Strategy', dateTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), withUser: 'Diana Prince (Admin)', status: 'Completed', costInCoins: 20 },
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

export let sampleResumeProfiles: ResumeProfile[] = [
  { id: 'resume1', tenantId: SAMPLE_TENANT_ID, userId: 'currentUser', name: "Software Engineer Focused", resumeText: sampleUserProfile.resumeText || "This is a resume focused on software engineering roles...", lastAnalyzed: "2024-07-15" },
  { id: 'resume2', tenantId: SAMPLE_TENANT_ID, userId: 'currentUser', name: "Product Manager Application", resumeText: "A resume tailored for product management positions...", lastAnalyzed: "2024-07-10" },
  { id: 'resume3', tenantId: SAMPLE_TENANT_ID, userId: 'currentUser', name: "General Tech Resume", resumeText: "A general purpose resume for various tech roles.", lastAnalyzed: "2024-06-20" },
];

const placeholderResumeText = `[Your Name]
[Your Contact Info]

Summary:
Experienced professional seeking a challenging role.

Experience:
Company A - Role 1 (2020-2022)
- Did task X
- Accomplished Y

Education:
University Z - Degree (2016-2020)
`;

const placeholderJobDescription = `Title: Sample Job
Company: Sample Corp
Location: Remote

Responsibilities:
- Do X
- Manage Y
- Achieve Z

Qualifications:
- Skill A
- Skill B
`;


export const sampleResumeScanHistory: ResumeScanHistoryItem[] = [
  {
    id: 'scan1',
    tenantId: SAMPLE_TENANT_ID,
    userId: 'currentUser',
    resumeId: 'resume1',
    resumeName: 'Software_Engineer_Resume_v2.pdf',
    jobTitle: 'Senior Software Engineer',
    companyName: 'Innovate LLC',
    resumeTextSnapshot: placeholderResumeText.replace("professional", "software engineer"),
    jobDescriptionText: placeholderJobDescription.replace("Sample Job", "Senior Software Engineer"),
    scanDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), 
    matchScore: 85,
    bookmarked: true, 
  },
  {
    id: 'scan2',
    tenantId: SAMPLE_TENANT_ID,
    userId: 'currentUser',
    resumeId: 'resume2',
    resumeName: 'Product_Manager_Profile.docx',
    jobTitle: 'Product Lead',
    companyName: 'FutureTech Corp',
    resumeTextSnapshot: placeholderResumeText.replace("professional", "product manager"),
    jobDescriptionText: placeholderJobDescription.replace("Sample Job", "Product Lead"),
    scanDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), 
    matchScore: 72,
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
    resumeTextSnapshot: placeholderResumeText.replace("professional", "data analyst"),
    jobDescriptionText: placeholderJobDescription.replace("Sample Job", "Data Analyst"),
    scanDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), 
    matchScore: 91,
    bookmarked: false,
  },
];

export const graduationYears = Array.from({ length: 26 }, (_, i) => (2025 - i).toString());

export const sampleTenants: Tenant[] = [
  {
    id: 'tenant-1',
    name: 'Default University',
    createdAt: new Date().toISOString(),
    settings: {
      allowPublicSignup: true,
      customLogoUrl: 'https://picsum.photos/seed/logo1/200/50',
      primaryColor: 'hsl(180 100% 25%)', 
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
      primaryColor: 'hsl(221 83% 53%)', 
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
      primaryColor: 'hsl(39 100% 50%)', 
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

export const sampleBadges: Badge[] = [
    { id: 'profile-pro', name: 'Profile Pro', description: 'Completed 100% of your profile.', icon: 'UserCheck', xpReward: 100, triggerCondition: 'Profile completion reaches 100%' },
    { id: 'early-adopter', name: 'Early Adopter', description: 'Joined within the first month of launch.', icon: 'Award', xpReward: 50, triggerCondition: 'User signup date within launch window' },
    { id: 'networker', name: 'Networker', description: 'Made 10+ alumni connections.', icon: 'Users', xpReward: 75, triggerCondition: 'Number of connections > 10' },
    { id: 'analyzer-ace', name: 'Analyzer Ace', description: 'Analyzed 5+ resumes.', icon: 'Zap', xpReward: 50, triggerCondition: 'Resume scan count > 5' },
    { id: 'contributor', name: 'Contributor', description: 'Posted 5+ times in the community feed.', icon: 'MessageSquare', xpReward: 30, triggerCondition: 'Community post count > 5' },
    { id: 'admin-master', name: 'Admin Master', description: 'Successfully managed platform settings.', icon: 'ShieldCheck', xpReward: 0, triggerCondition: 'User role is Admin' }, 
];

export let sampleBlogPosts: BlogPost[] = [ // Changed to let for user blog creation
  {
    id: 'blog1',
    tenantId: 'platform', 
    userId: 'system',
    userName: 'ResumeMatch AI Team',
    userAvatar: 'https://picsum.photos/seed/systemlogo/50/50',
    title: 'Mastering the AI Resume Analysis',
    slug: 'mastering-ai-resume-analysis',
    author: 'ResumeMatch AI Team',
    date: '2024-07-20T10:00:00Z',
    imageUrl: 'https://picsum.photos/seed/blogai/800/400',
    content: 'Learn how to leverage our AI analysis tool to its full potential. Understand match scores, keyword analysis, and how to use suggestions effectively...\n\nOur AI engine scans your resume against the provided job description, identifying key skills, experiences, and keywords. It then calculates a match score based on alignment.\n\n**Understanding the Score:**\n- **80%+:** Excellent match, likely a strong candidate.\n- **60-79%:** Good match, minor adjustments might be needed.\n- **Below 60%:** Significant gaps, consider tailoring your resume.\n\n**Using Suggestions:**\nThe AI provides suggestions for improvement. Focus on incorporating missing keywords naturally and highlighting relevant experiences mentioned in the job description. Remember, authenticity is key!\n\n*This is sample content. More details would follow in a real post.*',
    excerpt: 'Learn how to leverage our AI analysis tool to its full potential. Understand match scores, keyword analysis...',
    tags: ['resume', 'ai', 'jobsearch'],
    comments: [],
  },
  {
    id: 'blog2',
    tenantId: SAMPLE_TENANT_ID, 
    userId: 'alumni4', // Assuming Diana (admin) posted this for the tenant
    userName: 'Diana Prince (Admin)',
    userAvatar: 'https://picsum.photos/seed/diana/50/50',
    title: 'Networking Success Stories from State University Alumni',
    slug: 'state-uni-networking-success',
    author: 'Alumni Relations (State University)',
    date: '2024-07-15T14:30:00Z',
    imageUrl: 'https://picsum.photos/seed/blognetwork/800/400',
    content: 'Hear inspiring stories from fellow alumni who found opportunities through the ResumeMatch AI network. Discover tips for effective networking...\n\nAlice Wonderland (Class of \'15) shares how a connection made through the platform led to her current role at Google. "The recommendation feature pointed me towards someone I hadn\'t considered, and it turned out to be the perfect connection," she says.\n\nBob The Builder (Class of \'18) used the Alumni Directory filters to find mentors in Product Management. "Being able to filter by skills and industry was invaluable," Bob notes.\n\n**Networking Tips:**\n1. Personalize your connection requests.\n2. Be clear about what you\'re seeking (advice, referral, chat).\n3. Follow up respectfully.\n\n*This is sample content. More details would follow in a real post.*',
    excerpt: 'Hear inspiring stories from fellow alumni who found opportunities through the ResumeMatch AI network...',
    tags: ['networking', 'career', 'success stories', 'state university'],
    comments: [],
  },
  {
    id: 'blog3',
    tenantId: 'platform',
    userId: 'system',
    userName: 'ResumeMatch AI Team',
    userAvatar: 'https://picsum.photos/seed/systemlogo/50/50',
    title: 'The Power of Mentorship: Connecting Generations',
    slug: 'power-of-mentorship',
    author: 'ResumeMatch AI Team',
    date: '2024-07-10T09:00:00Z',
    imageUrl: 'https://picsum.photos/seed/blogmentor/800/400',
    content: 'Explore the benefits of both being a mentor and finding a mentor within our community. How our platform facilitates these connections...\n\nMentorship provides invaluable guidance for career growth. Our platform makes it easy to identify alumni willing to offer support in specific areas.\n\n**Benefits for Mentees:**\n- Gain industry insights.\n- Receive personalized career advice.\n- Expand your professional network.\n\n**Benefits for Mentors:**\n- Develop leadership skills.\n- Give back to the community.\n- Stay connected with emerging talent.\n\nUse the Alumni Directory filters to find potential mentors or mentees based on your interests and needs.\n\n*This is sample content. More details would follow in a real post.*',
    excerpt: 'Explore the benefits of both being a mentor and finding a mentor within our community...',
    tags: ['mentorship', 'community', 'connections'],
    comments: [],
  },
];

export const sampleReferralHistory: ReferralHistoryItem[] = [
  { id: 'ref1', referrerUserId: 'currentUser', referredEmailOrName: 'friend1@example.com', referralDate: new Date(Date.now() - 86400000 * 7).toISOString(), status: 'Signed Up' },
  { id: 'ref2', referrerUserId: 'currentUser', referredEmailOrName: 'colleague@example.com', referralDate: new Date(Date.now() - 86400000 * 5).toISOString(), status: 'Reward Earned', rewardAmount: 25 },
  { id: 'ref3', referrerUserId: 'currentUser', referredEmailOrName: 'contact@example.com', referralDate: new Date(Date.now() - 86400000 * 3).toISOString(), status: 'Pending' },
  { id: 'ref4', referrerUserId: 'currentUser', referredEmailOrName: 'another@example.com', referralDate: new Date(Date.now() - 86400000 * 10).toISOString(), status: 'Expired' },
];

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
        surveyName: 'Initial User Feedback', // Added name for consistency
        responseDate: new Date(Date.now() - 86400000 * 3).toISOString(),
        data: {
            experience: 'needs_improvement',
            frustration_details: 'The job board sometimes loads slowly.',
            referral_likelihood: 'neutral'
        }
    }
];

export const sampleAffiliates: Affiliate[] = [
  {
    id: 'affiliateuser1', 
    userId: 'alumni1', 
    name: 'Alice Wonderland',
    email: 'alice.wonderland@example.com',
    status: 'approved' as AffiliateStatus,
    affiliateCode: 'ALICEAFF',
    commissionRate: 0.10,
    totalEarned: 55.00,
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
  {
    id: 'affiliateuser2', 
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
    id: 'affiliateuser3', 
    userId: 'alumni3',
    name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    status: 'rejected' as AffiliateStatus,
    affiliateCode: 'CHARLIEAFF',
    commissionRate: 0.10,
    totalEarned: 0,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'currentUser', 
    userId: 'currentUser',
    name: sampleUserProfile.name, 
    email: sampleUserProfile.email, 
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
  { id: 'click3', affiliateId: 'affiliateuser1', timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), convertedToSignup: true }, 
  { id: 'click4', affiliateId: 'currentUser', timestamp: new Date(Date.now() - 0.5 * 86400000).toISOString(), convertedToSignup: false },
  { id: 'click5', affiliateId: 'affiliateuser1', timestamp: new Date(Date.now() - 86400000 * 4).toISOString(), convertedToSignup: false }, 
  { id: 'click6', affiliateId: 'affiliateuser2', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), convertedToSignup: false }, 
];

export const sampleAffiliateSignups: AffiliateSignup[] = [
  { id: 'signup1', affiliateId: 'currentUser', newUserId: 'newUser1', signupDate: new Date(Date.now() - 86400000 * 2).toISOString(), commissionEarned: 7.50 },
  { id: 'signup2', affiliateId: 'affiliateuser1', newUserId: 'newUser2', signupDate: new Date(Date.now() - 86400000 * 3).toISOString(), commissionEarned: 5.00 }, 
  { id: 'signup3', affiliateId: 'currentUser', newUserId: 'newUser3', signupDate: new Date(Date.now() - 86400000 * 1).toISOString(), commissionEarned: 10.00 }, 
  { id: 'signup4', affiliateId: 'affiliateuser1', newUserId: 'newUser4', signupDate: new Date(Date.now() - 86400000 * 5).toISOString(), commissionEarned: 5.00 }, 
];

export const profileCompletionSurveyDefinition: SurveyStep[] = [
  { id: 'pc_intro', type: 'botMessage', text: "Let's complete your profile! This will help us personalize your experience and connect you with better opportunities.", nextStepId: 'pc_s1_start' },
  { id: 'pc_s1_start', type: 'botMessage', text: "First, some personal details.", nextStepId: 'pc_s1_fullName' },
  { id: 'pc_s1_fullName', type: 'userInput', text: "What's your full name? (Required)", placeholder: "e.g., John Doe", variableName: 'fullName', nextStepId: 'pc_s1_dob' },
  { id: 'pc_s1_dob', type: 'userInput', inputType: 'date', text: "What's your date of birth? (YYYY-MM-DD)", placeholder: "YYYY-MM-DD", variableName: 'dateOfBirth', nextStepId: 'pc_s1_gender' },
  { id: 'pc_s1_gender', type: 'userDropdown', text: "What's your gender?", dropdownOptions: Genders.map(g => ({label: g, value: g})), variableName: 'gender', nextStepId: 'pc_s1_email' },
  { id: 'pc_s1_email', type: 'userInput', inputType: 'email', text: "What's your email ID? (Required)", placeholder: "you@example.com", variableName: 'email', nextStepId: 'pc_s1_mobile' },
  { id: 'pc_s1_mobile', type: 'userInput', inputType: 'tel', text: "What's your mobile number (with country code)?", placeholder: "+1 123 456 7890", variableName: 'mobileNumber', nextStepId: 'pc_s1_address' },
  { id: 'pc_s1_address', type: 'userInput', text: "What's your current address (City, State, Country)?", placeholder: "San Francisco, CA, USA", inputType: 'textarea', variableName: 'currentAddress', nextStepId: 'pc_s2_start' },
  { id: 'pc_s2_start', type: 'botMessage', text: "Great! Now, let's cover your academic background.", nextStepId: 'pc_s2_gradYear' },
  { id: 'pc_s2_gradYear', type: 'userDropdown', text: "What's your year of graduation/batch?", dropdownOptions: graduationYears.map(y => ({label: y, value: y})), variableName: 'graduationYear', nextStepId: 'pc_s2_degree' },
  { id: 'pc_s2_degree', type: 'userDropdown', text: "What's your degree/program?", dropdownOptions: DegreePrograms.map(d => ({label: d, value: d})), variableName: 'degreeProgram', nextStepId: 'pc_s2_department' },
  { id: 'pc_s2_department', type: 'userInput', text: "What's your department?", placeholder: "e.g., Computer Science", variableName: 'department', nextStepId: 'pc_s3_start' },
  { id: 'pc_s3_start', type: 'botMessage', text: "Excellent. Let's move on to your professional information.", nextStepId: 'pc_s3_jobTitle' },
  { id: 'pc_s3_jobTitle', type: 'userInput', text: "What's your current job title?", placeholder: "e.g., Software Engineer", variableName: 'currentJobTitle', nextStepId: 'pc_s3_organization' },
  { id: 'pc_s3_organization', type: 'userInput', text: "What's your current organization?", placeholder: "e.g., Tech Corp", variableName: 'currentOrganization', nextStepId: 'pc_s3_industry' },
  { id: 'pc_s3_industry', type: 'userDropdown', text: "What's your industry/sector?", dropdownOptions: Industries.map(i => ({label: i, value: i})), variableName: 'industry', nextStepId: 'pc_s3_workLocation' },
  { id: 'pc_s3_workLocation', type: 'userInput', text: "What's your work location (City, Country)?", placeholder: "e.g., London, UK", variableName: 'workLocation', nextStepId: 'pc_s3_linkedin' },
  { id: 'pc_s3_linkedin', type: 'userInput', inputType: 'url', text: "What's your LinkedIn profile URL? (Optional)", placeholder: "https://linkedin.com/in/yourprofile", variableName: 'linkedInProfile', nextStepId: 'pc_s3_experience' },
  { id: 'pc_s3_experience', type: 'userInput', text: "How many years of experience do you have?", placeholder: "e.g., 5 or 5+", variableName: 'yearsOfExperience', nextStepId: 'pc_s3_skills_prompt' },
  { id: 'pc_s3_skills_prompt', type: 'botMessage', text: "What are your key skills or areas of expertise? (Please list them, separated by commas)", nextStepId: 'pc_s3_skills_input' },
  { id: 'pc_s3_skills_input', type: 'userInput', placeholder: "e.g., React, Python, Data Analysis", inputType: 'textarea', variableName: 'skills', nextStepId: 'pc_s4_start' },
  { id: 'pc_s4_start', type: 'botMessage', text: "Let's talk about alumni engagement.", nextStepId: 'pc_s4_supportAreas_prompt' },
  { id: 'pc_s4_supportAreas_prompt', type: 'botMessage', text: `Which areas can you support? (Comma-separated from: ${AreasOfSupport.join(', ')})`, nextStepId: 'pc_s4_supportAreas_input' },
  { id: 'pc_s4_supportAreas_input', type: 'userInput', text: "Your areas of support:", placeholder: "e.g., Mentoring Students, Job Referrals", inputType: 'textarea', variableName: 'areasOfSupport', nextStepId: 'pc_s4_timeCommitment' },
  { id: 'pc_s4_timeCommitment', type: 'userDropdown', text: "How much time are you willing to commit per month?", dropdownOptions: TimeCommitments.map(tc => ({label: tc, value: tc})), variableName: 'timeCommitment', nextStepId: 'pc_s4_engagementMode' },
  { id: 'pc_s4_engagementMode', type: 'userDropdown', text: "What's your preferred mode of engagement?", dropdownOptions: EngagementModes.map(em => ({label: em, value: em})), variableName: 'preferredEngagementMode', nextStepId: 'pc_s4_otherComments' },
  { id: 'pc_s4_otherComments', type: 'userInput', text: "Any other comments or notes regarding engagement? (Optional)", inputType: 'textarea', variableName: 'otherComments', nextStepId: 'pc_s5_start' },
  { id: 'pc_s5_start', type: 'botMessage', text: "Now, optionally, tell us if you're looking for any specific support.", nextStepId: 'pc_s5_supportType' },
  { id: 'pc_s5_supportType', type: 'userDropdown', text: "What type of support are you looking for? (Optional)", dropdownOptions: [{label: "Not looking for support now", value: "none"}, ...SupportTypesSought.map(st => ({label: st, value: st}))], variableName: 'lookingForSupportType', nextStepId: 'pc_s5_helpNeeded' },
  { id: 'pc_s5_helpNeeded', type: 'userInput', text: "Briefly describe the help you need. (Optional, if you selected a support type)", inputType: 'textarea', variableName: 'helpNeededDescription', nextStepId: 'pc_s6_start' },
  { id: 'pc_s6_start', type: 'botMessage', text: "Almost done! Just a couple of consent questions.", nextStepId: 'pc_s6_shareProfile' },
  { id: 'pc_s6_shareProfile', type: 'userOptions', text: "Can we share your profile with other alumni for relevant collaboration?", options: [{text: 'Yes', value: 'true', nextStepId: 'pc_s6_featureSpotlight'}, {text: 'No', value: 'false', nextStepId: 'pc_s6_featureSpotlight'}], variableName: 'shareProfileConsent' },
  { id: 'pc_s6_featureSpotlight', type: 'userOptions', text: "Can we feature you on the alumni dashboard or spotlight?", options: [{text: 'Yes', value: 'true', nextStepId: 'pc_end'}, {text: 'No', value: 'false', nextStepId: 'pc_end'}], variableName: 'featureInSpotlightConsent' },
  { id: 'pc_end', type: 'botMessage', text: "Thank you for completing your profile information! Your profile is now more discoverable. 🎉", isLastStep: true },
];

export const sampleResumeTemplates: ResumeTemplate[] = [
  {
    id: 'template1',
    name: 'Modern Chronological',
    description: 'A clean, modern take on the classic chronological resume. Great for experienced professionals.',
    previewImageUrl: 'https://picsum.photos/seed/template1/300/400',
    category: 'Modern',
    dataAiHint: 'resume modern',
    content: `[Your Name]
[Your Phone] | [Your Email] | [Your LinkedIn Profile URL] | [Your Portfolio URL (Optional)]

Summary
---
[Briefly summarize your career objectives and key qualifications. Tailor this to the job you're applying for.]

Experience
---
[Job Title] | [Company Name] | [City, State] | [Dates of Employment (e.g., Month YYYY – Month YYYY)]
- [Responsibility or accomplishment 1 - Use action verbs]
- [Responsibility or accomplishment 2]
- [Responsibility or accomplishment 3]

[Previous Job Title] | [Previous Company Name] | [City, State] | [Dates of Employment]
- [Responsibility or accomplishment 1]
- [Responsibility or accomplishment 2]

Education
---
[Degree Name] | [Major/Minor] | [University Name] | [City, State] | [Graduation Year]
- [Relevant coursework, honors, or activities (Optional)]

Skills
---
Technical Skills: [List hard skills, e.g., Python, JavaScript, SQL, Microsoft Excel, Adobe Creative Suite]
Soft Skills: [List soft skills, e.g., Communication, Teamwork, Problem-solving, Leadership]
Languages: [List languages and proficiency levels]

Projects (Optional)
---
[Project Name] | [Link to Project (Optional)]
- [Brief description of the project and your role/contributions]
- [Technologies used]

Certifications (Optional)
---
[Certification Name] | [Issuing Organization] | [Date Issued]`
  },
  {
    id: 'template2',
    name: 'Creative Combination',
    description: 'Highlights skills and projects. Ideal for creative fields or career changers.',
    previewImageUrl: 'https://picsum.photos/seed/template2/300/400',
    category: 'Creative',
    dataAiHint: 'resume creative',
    content: `[Your Name]
[Your Phone] | [Your Email] | [Your LinkedIn Profile URL] | [Your Portfolio URL]

Skills Summary
---
- [Skill 1 with brief example of application]
- [Skill 2 with brief example of application]
- [Skill 3 with brief example of application]
- Technical Proficiencies: [List software, tools, languages]

Projects
---
[Project Name 1] | [Your Role] | [Dates]
- [Description of project and impact. Highlight skills used.]
- [Link to project if available]

[Project Name 2] | [Your Role] | [Dates]
- [Description of project and impact. Highlight skills used.]

Experience
---
[Job Title] | [Company Name] | [City, State] | [Dates of Employment]
- [Key achievement or responsibility 1]
- [Key achievement or responsibility 2]

Education
---
[Degree Name] | [University Name] | [Graduation Year]
- [Relevant coursework or honors]

Awards & Recognition (Optional)
---
- [Award/Recognition 1]
- [Award/Recognition 2]`
  },
  {
    id: 'template3',
    name: 'Functional Skills-Based',
    description: 'Emphasizes skills over work history. Good for those with employment gaps or students.',
    previewImageUrl: 'https://picsum.photos/seed/template3/300/400',
    category: 'Functional',
    dataAiHint: 'resume skills',
    content: `[Your Name]
[Your Phone] | [Your Email] | [Your LinkedIn Profile URL]

Professional Profile
---
[A concise statement highlighting your key skills and career focus.]

Core Competencies
---
[Skill Category 1 - e.g., Project Management]
- [Demonstrable achievement or experience related to this skill]
- [Another achievement or experience]

[Skill Category 2 - e.g., Communication]
- [Demonstrable achievement or experience]
- [Another achievement or experience]

[Skill Category 3 - e.g., Technical Proficiency]
- [List specific technical skills or software]

Work History
---
[Company Name 1] | [Job Title(s)] | [Dates of Employment (brief)]
[Company Name 2] | [Job Title(s)] | [Dates of Employment (brief)]
(Focus is on skills above, so work history can be more concise)

Education
---
[Degree Name] | [University Name] | [Graduation Year]
- [Relevant academic achievements or projects]

Volunteer Experience (Optional)
---
[Organization Name] | [Role] | [Dates]
- [Brief description of responsibilities and skills utilized]`
  },
  {
    id: 'template4',
    name: 'Academic CV',
    description: 'Designed for academic positions, research roles, and grants. Includes publication sections.',
    previewImageUrl: 'https://picsum.photos/seed/template4/300/400',
    category: 'Academic',
    dataAiHint: 'cv academic',
    content: `[Your Name]
[Your Phone] | [Your Email] | [Your LinkedIn/ResearchGate Profile URL]

Education
---
[Degree (e.g., Ph.D. in Subject)] | [University Name] | [City, State] | [Year of Completion/Expected]
Dissertation: "[Dissertation Title]" (Advisor: [Advisor's Name])

[Master's Degree] | [University Name] | [City, State] | [Year]
Thesis: "[Thesis Title]" (Optional)

[Bachelor's Degree] | [University Name] | [City, State] | [Year]

Research Experience
---
[Position, e.g., Postdoctoral Fellow] | [Lab/Department] | [University Name] | [Dates]
- [Description of research projects, methodologies, and findings.]
- [Key contributions and skills developed.]

[Position, e.g., Research Assistant] | [Lab/Department] | [University Name] | [Dates]
- [Description of research support and activities.]

Teaching Experience
---
[Position, e.g., Teaching Assistant] | [Course Name] | [Department] | [University Name] | [Semesters/Years]
- [Responsibilities, e.g., led discussion sections, graded assignments.]

[Position, e.g., Guest Lecturer] | [Topic] | [Course Name] | [University Name] | [Date]

Publications
---
(Use a consistent citation style, e.g., APA, MLA. List in reverse chronological order.)
Peer-Reviewed Articles:
1. [Author(s)]. ([Year]). [Article Title]. [Journal Name], [Volume](Issue), [Pages].
Book Chapters:
1. [Author(s)]. ([Year]). [Chapter Title]. In [Editor(s) (Eds.)], [Book Title] (pp. [Pages]). [Publisher].

Conference Presentations
---
1. [Author(s)]. ([Year, Month]). [Presentation Title]. Paper presented at the [Conference Name], [Location].

Grants and Awards
---
- [Grant/Award Name] | [Funding Body/Institution] | [Year]
- [Fellowship Name] | [Institution] | [Year]

Skills
---
Research Skills: [e.g., Statistical Analysis (SPSS, R), Qualitative Methods, Experimental Design]
Technical Skills: [e.g., Python, MATLAB, Lab Equipment]
Languages: [Language (Proficiency Level)]

References
---
Available upon request.`
  },
];

export const userDashboardTourSteps: TourStep[] = [
  { title: "Welcome to Your Dashboard!", description: "This is your central hub for managing your career journey with ResumeMatch AI." },
  { title: "Resume Analysis", description: "Use our AI tools to analyze your resume against job descriptions and get improvement suggestions." },
  { title: "Job Tracker", description: "Keep track of all your job applications in one place with our Kanban-style board." },
  { title: "Alumni Network", description: "Connect with fellow alumni, find mentors, and expand your professional network." },
  { title: "Rewards & Progress", description: "Earn XP and badges for your activity on the platform. Check your progress here!" }
];

export const adminDashboardTourSteps: TourStep[] = [
  { title: "Admin Dashboard Overview", description: "Welcome, Admin! Manage users, tenants, and platform-wide settings from here." },
  { title: "User Management", description: "View, edit, and manage all user accounts across different tenants." },
  { title: "Tenant Management", description: "Oversee and configure settings for individual tenants on the platform." },
  { title: "Gamification Rules", description: "Define and manage XP point rules and badges awarded for user actions." },
  { title: "Content Moderation", description: "Review and manage flagged content from the community feed to maintain a positive environment." }
];

export const managerDashboardTourSteps: TourStep[] = [
  { title: "Manager Dashboard Insights", description: "Hello Manager! Monitor your team's engagement, manage projects, and track key metrics." },
  { title: "Team Performance", description: "View analytics related to your team's activity and project progress." },
  { title: "Mentorship Programs", description: "Oversee mentorship programs, assign mentors, and track mentee progress." },
  { title: "Event Management", description: "Approve event submissions and manage event logistics for your tenant or group." }
];

export const sampleInterviewQuestions: InterviewQuestion[] = [
  {
    id: 'iq1',
    category: 'Behavioral',
    question: "Tell me about a time you failed.",
    isMCQ: true,
    mcqOptions: [
      "I've never truly failed; I see everything as a learning opportunity.",
      "I prefer not to discuss failures as they are negative.",
      "I once missed a critical deadline on Project X due to poor planning. I took responsibility, communicated proactively, and implemented a new system to prevent recurrence, successfully meeting subsequent deadlines.",
      "My previous manager was always setting unrealistic goals, so failures were common in that team."
    ],
    correctAnswer: "I once missed a critical deadline on Project X due to poor planning. I took responsibility, communicated proactively, and implemented a new system to prevent recurrence, successfully meeting subsequent deadlines.",
    answerOrTip: "The best approach is to use the STAR method (Situation, Task, Action, Result) and focus on what you learned and how you improved.",
    tags: ['failure', 'learning'],
    difficulty: 'Medium',
    rating: 4.2, // Average rating
    ratingsCount: 15,
    userComments: [
        { id: 'uc1-1', userId: 'alumni2', userName: 'Bob The Builder', comment: 'Good standard question. The tip is helpful!', timestamp: new Date(Date.now() - 86400000 * 1).toISOString()},
        { id: 'uc1-2', userId: 'alumni3', userName: 'Charlie Brown', comment: 'Could use a more complex failure example in options.', timestamp: new Date(Date.now() - 86400000 * 2).toISOString()}
    ],
    comments: "Standard behavioral question, good for assessing self-awareness.", // Admin comment
    createdBy: "system",
    approved: true,
  },
  {
    id: 'iq2',
    category: 'Behavioral',
    question: "Describe a situation where you had to work with a difficult team member.",
    isMCQ: true,
    mcqOptions: [
      "I avoided them as much as possible and did my work independently.",
      "I confronted them publicly about their behavior to resolve it quickly.",
      "I initiated a private conversation to understand their perspective, found common ground, and established clear communication protocols, which improved our collaboration.",
      "I reported them to my manager immediately without trying to resolve it myself."
    ],
    correctAnswer: "I initiated a private conversation to understand their perspective, found common ground, and established clear communication protocols, which improved our collaboration.",
    answerOrTip: "Focus on professional and constructive approaches. Highlight your communication, empathy, and problem-solving skills.",
    tags: ['teamwork', 'conflict'],
    difficulty: 'Medium',
    rating: 4.8,
    ratingsCount: 22,
    userComments: [],
    comments: "Assesses conflict resolution and interpersonal skills.",
    createdBy: "system",
    approved: true,
  },
  {
    id: 'iq3',
    category: 'Technical',
    question: "Explain the difference between an abstract class and an interface.",
    isMCQ: true,
    mcqOptions: [
      "Abstract classes can have constructors, interfaces cannot.",
      "A class can implement multiple abstract classes but only inherit from one interface.",
      "Interfaces can contain implemented methods, abstract classes cannot.",
      "Both are primarily used for achieving 100% abstraction."
    ],
    correctAnswer: "Abstract classes can have constructors, interfaces cannot.",
    answerOrTip: "Key differences: Abstract classes can have constructors and member variable implementations; interfaces cannot (traditionally). A class can implement multiple interfaces but inherit only one class (or abstract class).",
    tags: ['oop', 'programming', 'java'],
    difficulty: 'Medium',
    rating: 4.0,
    ratingsCount: 10,
    userComments: [{id: 'uc3-1', userId: 'currentUser', userName: 'Alex Taylor (User)', comment: 'The options are a bit tricky, good test!', timestamp: new Date().toISOString()}],
    comments: "Fundamental OOP concept.",
    createdBy: "adminUser1",
    approved: true,
  },
  {
    id: 'iq4',
    category: 'Role-Specific',
    question: "How would you approach designing a new feature for our product? (For Product Managers)",
    isMCQ: true,
    mcqOptions: [
      "Start coding immediately based on my gut feeling for what users want.",
      "Conduct user research, define clear requirements, prioritize based on impact/effort, work with design/dev, and define success metrics.",
      "Ask the engineering team to build whatever they think is cool and technically feasible.",
      "Copy a similar feature from a competitor's product directly."
    ],
    correctAnswer: "Conduct user research, define clear requirements, prioritize based on impact/effort, work with design/dev, and define success metrics.",
    answerOrTip: "A good answer outlines a structured product development process: research, definition, prioritization, execution, and measurement.",
    tags: ['product management', 'design'],
    difficulty: 'Hard',
    rating: 4.5,
    ratingsCount: 18,
    userComments: [],
    comments: "Tests understanding of product lifecycle.",
    createdBy: "adminUser2",
    approved: true,
  },
  {
    id: 'iq5',
    category: 'Common',
    question: "Why are you interested in this role?",
    isMCQ: true,
    mcqOptions: [
      "I need a job, and this one was available.",
      "The salary and benefits are attractive.",
      "This role aligns perfectly with my skills in X and Y, and I'm excited about [Company Mission/Product] because [Specific Reason]. I believe I can contribute Z.",
      "My friend works here and said it's a good place to work."
    ],
    correctAnswer: "This role aligns perfectly with my skills in X and Y, and I'm excited about [Company Mission/Product] because [Specific Reason]. I believe I can contribute Z.",
    answerOrTip: "Connect your skills, experience, and career goals to the specific requirements of the role and the company's mission. Show genuine enthusiasm.",
    tags: ['motivation', 'fit'],
    difficulty: 'Easy',
    rating: 3.9,
    ratingsCount: 30,
    userComments: [],
    comments: "Good for screening initial interest.",
    createdBy: "system",
    approved: true,
  },
  {
    id: 'iq6',
    category: 'Common',
    question: "Where do you see yourself in 5 years?",
    isMCQ: true,
    mcqOptions: [
      "Running this company.",
      "I haven't thought that far ahead.",
      "I see myself growing within a role like this, taking on more responsibility, developing expertise in [Relevant Area], and contributing to significant projects for the company.",
      "Probably at a different company in a higher position."
    ],
    correctAnswer: "I see myself growing within a role like this, taking on more responsibility, developing expertise in [Relevant Area], and contributing to significant projects for the company.",
    answerOrTip: "Show ambition for growth that aligns with the company's potential opportunities. Express interest in developing skills and taking on more responsibility.",
    tags: ['career goals'],
    difficulty: 'Easy',
    rating: 3.5,
    ratingsCount: 12,
    userComments: [],
    comments: "Needs review for phrasing.",
    createdBy: "system",
    approved: false, 
  },
  {
    id: 'iq7',
    category: 'Technical',
    question: "What are the principles of RESTful API design?",
    isMCQ: true,
    mcqOptions: [
      "Stateful, Client-Server, Uniform Interface, Cacheable.",
      "Stateless, Client-Server, Uniform Interface, Cacheable, Layered System.",
      "Monolithic architecture, Tight Coupling, RPC-style calls.",
      "Always use XML for data exchange and SOAP protocols."
    ],
    correctAnswer: "Stateless, Client-Server, Uniform Interface, Cacheable, Layered System.",
    answerOrTip: "Key principles: Client-Server, Stateless, Cacheable, Uniform Interface (resource identification, manipulation through representations, self-descriptive messages, HATEOAS), Layered System, Code on Demand (optional).",
    tags: ['api', 'backend'],
    difficulty: 'Hard',
    rating: 4.7,
    ratingsCount: 9,
    userComments: [],
    comments: "Crucial for backend roles.",
    createdBy: "adminUser1",
    approved: true,
  },
  {
    id: 'iq8',
    category: 'Behavioral',
    question: "Give an example of a goal you reached and tell me how you achieved it.",
    isMCQ: true,
    mcqOptions: [
      "I wanted to get a promotion, so I worked hard.",
      "My goal was to improve team efficiency by 15%. I identified bottlenecks in our workflow, proposed a new process using [Tool/Method], trained the team, and we achieved a 20% efficiency gain in 3 months.",
      "I set a personal goal to read more books, but I didn't really track it.",
      "We had a team goal, but someone else mostly did the work."
    ],
    correctAnswer: "My goal was to improve team efficiency by 15%. I identified bottlenecks in our workflow, proposed a new process using [Tool/Method], trained the team, and we achieved a 20% efficiency gain in 3 months.",
    answerOrTip: "Use the STAR method. Be specific about the goal, your actions, and the quantifiable result or impact.",
    tags: ['achievement', 'goals'],
    difficulty: 'Medium',
    rating: 4.1,
    ratingsCount: 17,
    userComments: [],
    createdBy: "system",
    approved: true,
  },
  {
    id: 'mcq1',
    category: 'Technical',
    question: "Which of the following is NOT a valid HTTP method?",
    isMCQ: true,
    mcqOptions: ["GET", "POST", "PUSH", "DELETE"],
    correctAnswer: "PUSH",
    answerOrTip: "PUSH is not a standard HTTP method. Common methods include GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS.",
    tags: ['http', 'api', 'mcq'],
    difficulty: 'Easy',
    rating: 3.8,
    ratingsCount: 25,
    userComments: [],
    createdBy: "system",
    approved: true,
  },
  {
    id: 'mcq2',
    category: 'Analytical',
    question: "A project's critical path is delayed by 2 days. What is the most likely impact on the project completion date?",
    isMCQ: true,
    mcqOptions: ["No impact", "Completion delayed by 1 day", "Completion delayed by 2 days", "Completion delayed by more than 2 days"],
    correctAnswer: "Completion delayed by 2 days",
    answerOrTip: "A delay on the critical path directly translates to a delay in the project completion date by the same amount, assuming no other changes.",
    tags: ['project management', 'analytical', 'mcq'],
    difficulty: 'Medium',
    rating: 4.3,
    ratingsCount: 13,
    userComments: [],
    createdBy: "adminUser2",
    approved: true,
  },
  {
    id: 'hr1',
    category: 'HR',
    question: "How do you handle stress and pressure?",
    isMCQ: true,
    mcqOptions: [
        "I avoid stressful situations as much as possible.",
        "I tend to get overwhelmed but eventually get through it.",
        "I prioritize tasks, break them into manageable steps, focus on what I can control, and take short breaks to stay effective. For example, during Project Y's tight deadline...",
        "I don't really experience stress; I thrive under pressure."
    ],
    correctAnswer: "I prioritize tasks, break them into manageable steps, focus on what I can control, and take short breaks to stay effective. For example, during Project Y's tight deadline...",
    answerOrTip: "Describe specific strategies you use (e.g., prioritization, time management, mindfulness, seeking support). Give a brief example if possible.",
    tags: ['stress management', 'soft skills'],
    difficulty: 'Medium',
    rating: 4.0,
    ratingsCount: 19,
    userComments: [],
    createdBy: "system",
    approved: true,
  },
  {
    id: 'coding1',
    category: 'Coding',
    question: "Write a function to reverse a string in JavaScript.",
    isMCQ: true,
    mcqOptions: [
        "str.split('').reverse().join('')",
        "for (let i = 0; i < str.length; i++) newStr += str[str.length - 1 - i];",
        "str.reverse()",
        "Array.from(str).sort().join('')"
    ],
    correctAnswer: "str.split('').reverse().join('')",
    answerOrTip: "Common solutions include `str.split('').reverse().join('')` or a loop. Discuss time/space complexity (O(n) for both in most JS engines).",
    tags: ['javascript', 'string manipulation', 'algorithms'],
    difficulty: 'Easy',
    rating: 3.7,
    ratingsCount: 28,
    userComments: [],
    createdBy: "system",
    approved: true,
  },
  {
    id: 'coding2',
    category: 'Coding',
    question: "Explain Big O notation and provide an example of O(n) and O(log n).",
    isMCQ: true,
    mcqOptions: [
        "It measures exact execution time. O(n) is fast, O(log n) is slow.",
        "It describes the worst-case time or space complexity as input size grows. O(n): linear search. O(log n): binary search.",
        "It's only used for sorting algorithms. O(n) example: bubble sort. O(log n) example: merge sort.",
        "Big O is about optimizing code for specific hardware."
    ],
    correctAnswer: "It describes the worst-case time or space complexity as input size grows. O(n): linear search. O(log n): binary search.",
    answerOrTip: "Big O notation describes the upper bound of an algorithm's time or space complexity in relation to input size. O(n) is linear (e.g., iterating an array), O(log n) is logarithmic (e.g., binary search on a sorted array).",
    tags: ['data structures', 'algorithms', 'complexity'],
    difficulty: 'Medium',
    rating: 4.6,
    ratingsCount: 11,
    userComments: [],
    createdBy: "adminUser1",
    approved: true,
  },
];


export let sampleBlogGenerationSettings: BlogGenerationSettings = {
  generationIntervalHours: 24, // Default to once a day
  topics: ['Career Advice', 'Resume Writing Tips', 'Interview Skills', 'Networking Strategies', 'Industry Trends'],
  style: 'informative',
  lastGenerated: undefined,
};

export const sampleMockInterviewSessions: MockInterviewSession[] = [
  {
    id: 'session-hist-1',
    userId: 'currentUser',
    topic: 'Frontend Developer Interview',
    jobDescription: 'Looking for a skilled frontend dev for a challenging role requiring React, TypeScript, and state management expertise.',
    questions: sampleInterviewQuestions.slice(0, 2).map(q => ({ id: q.id, questionText: q.question, category: q.category, difficulty: q.difficulty })),
    answers: [
      { questionId: 'iq1', questionText: sampleInterviewQuestions[0].question, userAnswer: "I once tried to implement a feature too quickly without fully understanding the requirements, which led to significant rework. I learned the importance of thorough planning and asking clarifying questions upfront. Since then, I always create a detailed plan and confirm requirements before starting development, which has greatly reduced errors and delays.", aiFeedback: "Good attempt at STAR, but be more specific about the situation and the exact results of your corrective actions. Quantify if possible.", aiScore: 70, strengths: ["Honesty", "Acknowledged learning"], areasForImprovement: ["Specificity (STAR)", "Quantifiable results"] },
      { questionId: 'iq2', questionText: sampleInterviewQuestions[1].question, userAnswer: "In a previous project, a senior team member was consistently dismissive of junior developers' ideas. I scheduled a one-on-one with them, explained how their approach was impacting team morale and innovation, and suggested they actively solicit input during design reviews. They were receptive, and the team dynamic improved.", aiFeedback: "Excellent use of the STAR method. Clear actions and positive outcome. Well done.", aiScore: 90, strengths: ["Proactive communication", "Problem-solving", "Empathy"], areasForImprovement: ["Could mention the specific positive impact on a project metric if applicable."] },
    ],
    overallFeedback: {
      overallSummary: 'The user demonstrated good problem-solving approaches and an ability to learn from past experiences. Answers could be more consistently structured using the STAR method for maximum impact.',
      keyStrengths: ['Self-awareness', 'Proactive communication', 'Willingness to learn'],
      keyAreasForImprovement: ['Consistent STAR method application', 'Quantifying impact of actions'],
      finalTips: ['Practice framing all behavioral answers using the STAR method.', 'Prepare specific examples with measurable results for common interview questions.'],
      overallScore: 80,
    },
    overallScore: 80,
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    timerPerQuestion: 120,
    questionCategories: ['Behavioral'],
    difficulty: 'Medium'
  },
  {
    id: 'session-hist-2',
    userId: 'currentUser',
    topic: 'Data Analyst Role',
    questions: sampleInterviewQuestions.slice(2, 3).map(q => ({ id: q.id, questionText: q.question, category: q.category, difficulty: q.difficulty })), // Only one question for this example
    answers: [
      { questionId: 'iq3', questionText: sampleInterviewQuestions[2].question, userAnswer: 'An abstract class can have constructors and implemented methods, while an interface traditionally only defines a contract with method signatures and constants. A class can inherit from only one abstract class but implement multiple interfaces.', aiFeedback: 'Correct and comprehensive explanation of the key differences.', aiScore: 95, strengths: ["Technical accuracy", "Clarity"], areasForImprovement: ["None for this answer"] },
    ],
    overallFeedback: {
      overallSummary: 'Strong technical knowledge demonstrated regarding OOP principles.',
      keyStrengths: ['Precise technical definitions', 'Clear communication of complex concepts'],
      keyAreasForImprovement: ['N/A for this short session'],
      finalTips: ['Continue to provide such clear and accurate technical explanations.'],
      overallScore: 95,
    },
    overallScore: 95,
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
    timerPerQuestion: 0, // No timer
    questionCategories: ['Technical'],
    difficulty: 'Medium'
  }
];

export let sampleCreatedQuizzes: MockInterviewSession[] = [ // Using MockInterviewSession as a base for Quizzes // Made 'let' for edit
  {
    id: 'quiz-java-basics',
    userId: 'system', // Indicates a system-generated or admin-created quiz
    topic: 'Java Basics Quiz',
    description: "Test your fundamental knowledge of Java programming concepts. Covers data types, OOP, and common library functions.",
    questions: sampleInterviewQuestions.filter(q => q.tags?.includes('java') && q.isMCQ).slice(0, 5).map(q => ({ id: q.id, questionText: q.question, category: q.category, difficulty: q.difficulty })),
    answers: [], // Not applicable for quiz template
    status: 'pending', // This status could indicate it's a template/available quiz
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), // Created 10 days ago
    questionCategories: ['Technical', 'Coding'],
    difficulty: 'Easy',
  },
  {
    id: 'quiz-behavioral-common',
    userId: 'system',
    topic: 'Common Behavioral Questions',
    description: "Practice how you'd respond to frequently asked behavioral interview questions. Focus on structuring your answers using STAR.",
    questions: sampleInterviewQuestions.filter(q => q.category === 'Behavioral' && q.isMCQ).slice(0, 7).map(q => ({ id: q.id, questionText: q.question, category: q.category, difficulty: q.difficulty })),
    answers: [],
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    questionCategories: ['Behavioral', 'Common'],
    difficulty: 'Medium',
  },
  {
    id: 'quiz-pm-roleplay',
    userId: 'currentUser', // Example of a user-created quiz
    topic: 'Product Manager Role Scenarios',
    description: "A challenging quiz with scenario-based questions for aspiring Product Managers. Tests decision-making and prioritization skills.",
    questions: sampleInterviewQuestions.filter(q => q.category === 'Role-Specific' && q.tags?.includes('product management') && q.isMCQ).slice(0, 3).map(q => ({ id: q.id, questionText: q.question, category: q.category, difficulty: q.difficulty })),
    answers: [],
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    questionCategories: ['Role-Specific', 'Analytical'],
    difficulty: 'Hard',
  },
];

export const samplePracticeSessions: PracticeSession[] = [
  {
    id: "ps1",
    userId: "currentUser",
    date: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
    category: "Practice with Experts",
    type: "Angular",
    language: "English",
    status: "SCHEDULED",
    notes: "Focus on advanced component architecture.",
  },
  {
    id: "ps2",
    userId: "currentUser",
    date: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days from now
    category: "Practice with AI",
    type: "Java Backend",
    language: "English",
    status: "SCHEDULED",
    notes: "Data structures and algorithms focus.",
  },
  {
    id: "ps3",
    userId: "currentUser",
    date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    category: "Practice with Friends",
    type: "Behavioral",
    language: "English",
    status: "COMPLETED",
    notes: "Practiced STAR method.",
  },
  {
    id: "ps4",
    userId: "currentUser",
    date: new Date(Date.now() + 86400000 * 1).toISOString(), // Tomorrow
    category: "Practice with Experts",
    type: "System Design",
    language: "English",
    status: "CANCELLED",
    notes: "Expert had to reschedule.",
  },
];
