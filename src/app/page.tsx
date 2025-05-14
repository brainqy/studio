
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Briefcase, Users, Zap, FileText, Edit, MessageSquare, Brain, Layers3, Award, CalendarCheck2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  const stats = [
    { name: "Resumes Analyzed", value: "10,000+", icon: FileText },
    { name: "Successful Placements", value: "1,500+", icon: Briefcase },
    { name: "Alumni Network", value: "5,000+", icon: Users },
    { name: "AI Features Used", value: "25,000+", icon: Zap },
  ];

  const coreFeatures = [
    { title: "AI Resume Analyzer", description: "Get deep insights into your resume's match with job descriptions, ATS compatibility, and keyword optimization.", icon: Zap, dataAiHint: "resume analysis report", imagePlaceholder: "https://placehold.co/600x400.png" },
    { title: "AI Resume & Cover Letter Writer", description: "Generate tailored resumes and compelling cover letters in minutes with AI assistance.", icon: Edit, dataAiHint: "ai resume writer", imagePlaceholder: "https://placehold.co/600x400.png" },
    { title: "Comprehensive Job Tracker", description: "Organize your job applications in a visual Kanban board, set reminders, and track your progress.", icon: Briefcase, dataAiHint: "job tracker board", imagePlaceholder: "https://placehold.co/600x400.png" },
    { title: "Interview Preparation Hub", description: "Practice with AI mock interviews, browse a vast question bank, and take custom quizzes.", icon: Brain, dataAiHint: "interview preparation", imagePlaceholder: "https://placehold.co/600x400.png" },
    { title: "Alumni Connect Directory", description: "Network with fellow alumni, find mentors, and book appointments for career guidance.", icon: Users, dataAiHint: "alumni directory", imagePlaceholder: "https://placehold.co/600x400.png" },
    { title: "Engaging Community Feed", description: "Share insights, ask questions, participate in polls, and connect with your peers.", icon: MessageSquare, dataAiHint: "community feed", imagePlaceholder: "https://placehold.co/600x400.png" },
    { title: "Gamified Rewards & Progress", description: "Earn XP, unlock badges, and see your progress on the leaderboard as you engage.", icon: Award, dataAiHint: "gamification rewards", imagePlaceholder: "https://placehold.co/600x400.png" },
    { title: "Resume Templates & Builder", description: "Choose from professional templates or build your resume step-by-step.", icon: Layers3, dataAiHint: "resume templates builder", imagePlaceholder: "https://placehold.co/600x400.png" },
    { title: "Event Management & Gallery", description: "Discover and register for alumni events, and browse past event galleries.", icon: CalendarCheck2, dataAiHint: "events gallery", imagePlaceholder: "https://placehold.co/600x400.png" },
  ];


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
            <FileText className="h-7 w-7" />
            ResumeMatch AI
          </Link>
          <nav className="space-x-2 sm:space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary/80">Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="secondary" className="bg-secondary hover:bg-secondary/80 text-secondary-foreground">Sign Up</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 sm:py-24 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">
              Unlock Your <span className="text-primary">Career Potential</span> with AI
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground">
              Leverage AI to perfectly match your resume with your dream job. Get insightful analysis, generate tailored documents, practice interviews, and connect with a powerful alumni network.
            </p>
            <div className="mt-10">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg">
                  Get Started Free
                  <Zap className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="mt-12 relative w-full max-w-4xl mx-auto aspect-[16/9] rounded-xl shadow-2xl overflow-hidden ring-1 ring-border">
               <Image
                src="https://placehold.co/1200x675.png"
                alt="ResumeMatch AI Dashboard Preview"
                layout="fill"
                objectFit="cover"
                data-ai-hint="dashboard overview"
                priority
              />
            </div>
          </div>
        </section>

        {/* Core Features Section */}
        <section id="features" className="py-16 sm:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">All The Tools You Need to Succeed</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                From crafting the perfect resume to acing the interview and building your network, ResumeMatch AI provides a comprehensive suite of tools.
              </p>
            </div>
            <div className="space-y-16">
              {coreFeatures.map((feature, index) => (
                <div key={feature.title} className={`flex flex-col items-center gap-8 md:gap-12 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className="md:w-1/2">
                    <div className="relative aspect-video rounded-lg shadow-xl overflow-hidden ring-1 ring-border">
                      <Image
                        src={feature.imagePlaceholder}
                        alt={`${feature.title} Screenshot`}
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint={feature.dataAiHint}
                      />
                    </div>
                  </div>
                  <div className="md:w-1/2 text-center md:text-left">
                    <feature.icon className="w-10 h-10 text-primary mb-4 mx-auto md:mx-0" />
                    <h3 className="text-2xl font-semibold text-foreground mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground text-md leading-relaxed">{feature.description}</p>
                     <Link href="/auth/signup">
                        <Button variant="link" className="mt-4 px-0 text-primary">
                            Explore {feature.title.split(" ")[0]} <Zap className="ml-1.5 h-4 w-4" />
                        </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* Statistics Section */}
        <section className="py-16 sm:py-24 bg-secondary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">Join a Thriving Community</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {stats.map((stat) => (
                <div key={stat.name} className="p-6 bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <stat.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  <p className="text-muted-foreground mt-1">{stat.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 sm:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Ready to Elevate Your Career?</h2>
            <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground">
              Stop guessing and start getting results. Sign up for ResumeMatch AI today and take the next step in your professional journey.
            </p>
            <div className="mt-8">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-3 text-lg">
                  Sign Up For Free
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </main>

      <footer className="py-8 bg-primary/5 text-center text-muted-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <p className="font-semibold text-foreground mb-1">ResumeMatch AI</p>
          <p className="text-sm">&copy; {new Date().getFullYear()} ResumeMatch AI. All rights reserved.</p>
          <div className="mt-3 space-x-4 text-sm">
            <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
            <span className="text-gray-400">|</span>
            <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
            <span className="text-gray-400">|</span>
            <Link href="/contact" className="hover:text-primary">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
