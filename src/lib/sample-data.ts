import type { JobApplication, AlumniProfile, Activity, CommunityPost, FeatureRequest, GalleryEvent, JobOpening, UserProfile, UserRole, Gender, DegreeProgram, Industry, SupportArea, TimeCommitment, EngagementMode, SupportTypeSought } from '@/types';

export const sampleJobApplications: JobApplication[] = [
  { id: '1', companyName: 'Tech Solutions Inc.', jobTitle: 'Software Engineer', status: 'Applied', dateApplied: '2024-07-01', notes: 'Applied via company portal.' },
  { id: '2', companyName: 'Innovate LLC', jobTitle: 'Frontend Developer', status: 'Interviewing', dateApplied: '2024-06-25', notes: 'First interview scheduled for 2024-07-10.' },
  { id: '3', companyName: 'Data Corp', jobTitle: 'Data Analyst', status: 'Offer', dateApplied: '2024-06-15', notes: 'Received offer, considering.' },
  { id: '4', companyName: 'Web Wizards', jobTitle: 'UX Designer', status: 'Rejected', dateApplied: '2024-06-20', notes: 'Did not proceed after initial screening.' },
];

export const sampleAlumni: AlumniProfile[] = [
  { id: 'alumni1', name: 'Alice Wonderland', profilePictureUrl: 'https://picsum.photos/seed/alice/200/200', currentJobTitle: 'Senior Software Engineer', company: 'Google', shortBio: 'Passionate about AI and cloud computing. Graduated in 2015.', university: 'State University', skills: ['Java', 'Python', 'Machine Learning'], location: { lat: 37.7749, lng: -122.4194 } , email: "alice.wonderland@example.com", role: 'user'},
  { id: 'alumni2', name: 'Bob The Builder', profilePictureUrl: 'https://picsum.photos/seed/bob/200/200', currentJobTitle: 'Product Manager', company: 'Microsoft', shortBio: 'Focused on user-centric product development. Class of 2018.', university: 'Tech Institute', skills: ['Product Management', 'Agile', 'UX Research'], location: { lat: 47.6062, lng: -122.3321 }, email: "bob.builder@example.com", role: 'manager' },
  { id: 'alumni3', name: 'Charlie Brown', profilePictureUrl: 'https://picsum.photos/seed/charlie/200/200', currentJobTitle: 'Data Scientist', company: 'Facebook', shortBio: 'Exploring large-scale data and its implications. Alumnus of 2017.', university: 'State University', skills: ['R', 'Statistics', 'Big Data'], location: { lat: 34.0522, lng: -118.2437 }, email: "charlie.brown@example.com", role: 'user' },
  { id: 'alumni4', name: 'Diana Prince', profilePictureUrl: 'https://picsum.photos/seed/diana/200/200', currentJobTitle: 'Marketing Lead', company: 'Amazon', shortBio: 'Specializing in digital marketing strategies. Graduated 2016.', university: 'Commerce College', skills: ['SEO', 'Content Marketing', 'Social Media'], location: { lat: 40.7128, lng: -74.0060 }, email: "diana.prince@example.com", role: 'admin' },
];

export const sampleActivities: Activity[] = [
  { id: 'act1', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), description: 'Uploaded resume "Software_Engineer_Resume.pdf".' },
  { id: 'act2', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), description: 'Analyzed resume for "Senior Product Manager" role at Innovate LLC.' },
  { id: 'act3', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), description: 'Connected with Alice Wonderland.' },
  { id: 'act4', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), description: 'Tracked new job application for "Data Scientist" at Data Corp.' },
];

export const sampleCommunityPosts: CommunityPost[] = [
  { id: 'post1', userId: 'user123', userName: 'John Doe', userAvatar: 'https://picsum.photos/seed/johndoe/50/50', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), content: 'Anyone have experience with tackling take-home assignments for Senior Eng roles? Tips appreciated!', type: 'text', tags: ['jobsearch', 'interviewtips'] },
  { id: 'post2', userId: 'user456', userName: 'Jane Smith', userAvatar: 'https://picsum.photos/seed/janesmith/50/50', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), content: 'Looking for a mentor in the Product Management space. Any alumni willing to connect?', type: 'request', tags: ['mentorship', 'productmanagement'] },
];

export const sampleFeatureRequests: FeatureRequest[] = [
  { id: 'fr1', userId: 'user789', userName: 'Sam Wilson', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), title: 'Integrate with LinkedIn for profile import', description: 'It would be great to automatically pull resume data from LinkedIn.', status: 'Pending' },
  { id: 'fr2', userId: 'user101', userName: 'Maria Hill', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), title: 'Dark mode for the dashboard', description: 'A dark theme option would be easier on the eyes.', status: 'In Progress' },
];

export const sampleGalleryEvents: GalleryEvent[] = [
  { id: 'event1', title: 'Annual Alumni Meet 2023', date: '2023-10-15', imageUrl: 'https://picsum.photos/seed/event1/600/400', description: 'A wonderful evening connecting with fellow alumni.' , dataAiHint: 'conference networking'},
  { id: 'event2', title: 'Tech Talk Series: AI Today', date: '2024-03-22', imageUrl: 'https://picsum.photos/seed/event2/600/400', description: 'Insightful talks on the future of Artificial Intelligence.' , dataAiHint: 'presentation seminar'},
  { id: 'event3', title: 'Campus Job Fair Spring 2024', date: '2024-04-10', imageUrl: 'https://picsum.photos/seed/event3/600/400', description: 'Connecting students with top employers.', dataAiHint: 'job fair students' },
];

export const sampleJobOpenings: JobOpening[] = [
  { id: 'job1', title: 'Junior Developer', company: 'Google', postedByAlumniId: 'alumni1', alumniName: 'Alice Wonderland', description: 'Exciting opportunity for recent graduates to join our engineering team.', datePosted: '2024-07-10', location: 'Mountain View, CA', type: 'Full-time' },
  { id: 'job2', title: 'Marketing Intern (Summer)', company: 'Amazon', postedByAlumniId: 'alumni4', alumniName: 'Diana Prince', description: 'Gain hands-on experience in a fast-paced marketing environment.', datePosted: '2024-07-08', location: 'Seattle, WA', type: 'Internship' },
  { id: 'job3', title: 'Project Manager - Mentorship Program', company: 'Self-Employed (Mentorship)', postedByAlumniId: 'alumni2', alumniName: 'Bob The Builder', description: 'Looking to mentor aspiring Product Managers. Part-time commitment.', datePosted: '2024-07-05', location: 'Remote', type: 'Mentorship' },
];

export const sampleUserProfile: UserProfile = {
  id: 'currentUser',
  role: 'user', // Default role
  name: 'Alex Taylor',
  email: 'alex.taylor@example.com',
  dateOfBirth: '1995-08-15',
  gender: 'Male',
  mobileNumber: '+15551234567',
  currentAddress: '123 Main St, Anytown, CA, USA',
  
  graduationYear: '2023',
  degreeProgram: 'Bachelor of Science (B.Sc)',
  department: 'Computer Science',
  
  currentJobTitle: 'Aspiring Full-Stack Developer', // Existing field
  currentOrganization: 'Tech Solutions Inc. (Internship)',
  industry: 'IT/Software',
  workLocation: 'Anytown, USA',
  linkedInProfile: 'https://linkedin.com/in/alextaylor',
  yearsOfExperience: '1',

  skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'], // Existing field
  
  areasOfSupport: ['Mentoring Students', 'Sharing Job Referrals'],
  timeCommitment: '1-2 hours',
  preferredEngagementMode: 'Online',
  otherComments: 'Eager to contribute to the alumni community!',
  
  lookingForSupportType: 'Career Mentoring',
  helpNeededDescription: 'Looking for guidance on breaking into the AI/ML field.',
  
  shareProfileConsent: true,
  featureInSpotlightConsent: false,

  bio: 'Aspiring full-stack developer with a keen interest in AI and web technologies. Eager to learn and contribute to innovative projects.', // Existing field
  profilePictureUrl: 'https://picsum.photos/seed/alextaylor/200/200', // Existing field
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
`, // Existing field
  careerInterests: 'Full-stack development, AI/ML engineering, UI/UX design collaboration' // Existing field
};

export const sampleAppointments = [
    { id: 'appt1', title: 'Mentorship Session with Alice W.', dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), withUser: 'Alice Wonderland', status: 'Confirmed' },
    { id: 'appt2', title: 'Networking Call with Bob B.', dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), withUser: 'Bob The Builder', status: 'Pending' },
];

export const sampleWalletBalance = {
    coins: 150,
    transactions: [
        { id: 'txn1', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), description: 'Reward for profile completion', amount: 50, type: 'credit' as 'credit' | 'debit' },
        { id: 'txn2', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), description: 'Used for premium report', amount: -20, type: 'debit' as 'credit' | 'debit' },
    ]
};

// Graduation years for dropdown
export const graduationYears = Array.from({ length: 26 }, (_, i) => (2025 - i).toString());
