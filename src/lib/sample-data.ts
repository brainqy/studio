import type { JobApplication, AlumniProfile, Activity, CommunityPost, FeatureRequest, GalleryEvent, JobOpening, UserProfile, UserRole, Gender, DegreeProgram, Industry, SupportArea, TimeCommitment, EngagementMode, SupportTypeSought, ResumeScanHistoryItem, Appointment, Wallet, ResumeProfile } from '@/types';
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
    role: 'admin',
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

export const sampleUserProfile: UserProfile = {
  id: 'currentUser',
  tenantId: SAMPLE_TENANT_ID,
  role: 'user', // Default role for the sample user
  name: 'Alex Taylor',
  email: 'alex.taylor@example.com',
  dateOfBirth: '1995-08-15',
  gender: 'Male',
  mobileNumber: '+15551234567',
  currentAddress: '123 Main St, Anytown, CA, USA',

  graduationYear: '2023',
  degreeProgram: 'Bachelor of Science (B.Sc)',
  department: 'Computer Science',

  currentJobTitle: 'Aspiring Full-Stack Developer',
  currentOrganization: 'Tech Solutions Inc. (Internship)',
  industry: 'IT/Software',
  workLocation: 'Anytown, USA',
  linkedInProfile: 'https://linkedin.com/in/alextaylor',
  yearsOfExperience: '1',

  skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],

  areasOfSupport: ['Mentoring Students', 'Sharing Job Referrals'],
  timeCommitment: '1-2 hours',
  preferredEngagementMode: 'Online',
  otherComments: 'Eager to contribute to the alumni community!',

  lookingForSupportType: 'Career Mentoring',
  helpNeededDescription: 'Looking for guidance on breaking into the AI/ML field.',

  shareProfileConsent: true,
  featureInSpotlightConsent: false,

  bio: 'Aspiring full-stack developer with a keen interest in AI and web technologies. Eager to learn and contribute to innovative projects.',
  profilePictureUrl: 'https://picsum.photos/seed/alextaylor/200/200',
  resumeText: `Alex Taylor
alex.taylor@example.com | (555) 123-4567 | linkedin.com/in/alextaylor | github.com/alextaylor

Summary
Highly motivated and results-oriented aspiring Full-Stack Developer with a strong foundation in JavaScript, React, Node.js, and Python. Passionate about creating intuitive user experiences and leveraging AI for innovative solutions. Proven ability to learn quickly and collaborate effectively in team environments.

Education
B.S. in Computer Science | State University | Graduated May 2023
Relevant Coursework: Data Structures, Algorithms, Web Development, Database Management, Introduction to AI

Projects
ResumeMatch AI (Personal Project)
  - Developed a conceptual AI-powered resume analysis tool using Next.js and Genkit.
  - Implemented features for resume upload, job description input, and match score calculation.
E-commerce Platform (Capstone Project)
  - Built a full-stack e-commerce website with React, Node.js, Express, and MongoDB.
  - Features included product listings, shopping cart, user authentication, and order processing.

Skills
Programming Languages: JavaScript, Python, Java, HTML, CSS
Frameworks/Libraries: React, Node.js, Express, Next.js, Tailwind CSS
Databases: MongoDB, SQL (PostgreSQL, MySQL)
Tools: Git, Docker, VS Code, Figma
Other: RESTful APIs, Agile Methodologies, Problem-Solving

Experience
Software Engineering Intern | Tech Solutions Inc. | Summer 2022
  - Assisted in developing new features for a client-facing web application using React and Node.js.
  - Participated in daily stand-ups, sprint planning, and code reviews.
  - Contributed to bug fixing and improving application performance.
`,
  careerInterests: 'Full-stack development, AI/ML engineering, UI/UX design collaboration'
};

export const sampleAppointments: Appointment[] = [
    { id: 'appt1', tenantId: SAMPLE_TENANT_ID, requesterUserId: 'currentUser', alumniUserId: 'alumni1', title: 'Mentorship Session with Alice W.', dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), withUser: 'Alice Wonderland', status: 'Confirmed', costInCoins: 10, meetingLink: 'https://zoom.us/j/1234567890' },
    { id: 'appt2', tenantId: SAMPLE_TENANT_ID, requesterUserId: 'currentUser', alumniUserId: 'alumni2', title: 'Networking Call with Bob B.', dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), withUser: 'Bob The Builder', status: 'Pending', costInCoins: 15 },
];

export const sampleWalletBalance: Wallet = {
    tenantId: SAMPLE_TENANT_ID,
    userId: 'currentUser',
    coins: 150,
    transactions: [
        { id: 'txn1', tenantId: SAMPLE_TENANT_ID, userId: 'currentUser', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), description: 'Reward for profile completion', amount: 50, type: 'credit' },
        { id: 'txn2', tenantId: SAMPLE_TENANT_ID, userId: 'currentUser', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), description: 'Used for premium report', amount: -20, type: 'debit' },
        { id: 'txn3', tenantId: SAMPLE_TENANT_ID, userId: 'currentUser', date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), description: 'Appointment booking fee (Alice W.)', amount: -10, type: 'debit' },
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
  },
];


// Graduation years for dropdown
export const graduationYears = Array.from({ length: 26 }, (_, i) => (2025 - i).toString());
