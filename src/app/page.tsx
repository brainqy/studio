import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Briefcase, Users, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  const stats = [
    { name: "Resumes Analyzed", value: "10,000+", icon: Zap },
    { name: "Successful Placements", value: "1,500+", icon: Briefcase },
    { name: "Alumni Network", value: "5,000+", icon: Users },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            ResumeMatch AI
          </Link>
          <nav className="space-x-4">
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
              Unlock Your <span className="text-primary">Career Potential</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground">
              Leverage AI to perfectly match your resume with your dream job. Get insightful analysis, improvement suggestions, and connect with a powerful alumni network.
            </p>
            <div className="mt-10">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Get Started Free
                  <Zap className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="mt-12 relative w-full max-w-3xl mx-auto aspect-video rounded-xl shadow-2xl overflow-hidden">
               <Image 
                src="https://picsum.photos/seed/hero/1200/675" 
                alt="ResumeMatch AI Dashboard Preview" 
                layout="fill"
                objectFit="cover"
                data-ai-hint="dashboard interface"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 sm:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">Why Choose ResumeMatch AI?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "AI-Powered Analysis", description: "Deep insights into resume-job description alignment.", icon: Zap },
                { title: "Improvement Suggestions", description: "Actionable feedback to enhance your resume.", icon: BarChart },
                { title: "Alumni Network", description: "Connect with professionals in your field.", icon: Users },
                { title: "Job Tracker", description: "Organize and manage your job applications.", icon: Briefcase },
                { title: "Personalized Recommendations", description: "Smart suggestions for networking and opportunities.", icon: Users },
                { title: "Secure & Private", description: "Your data is protected with industry-standard security.", icon: Users },
              ].map((feature) => (
                <Card key={feature.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <feature.icon className="w-8 h-8 text-primary" />
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 sm:py-24 bg-secondary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">Join a Thriving Community</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {stats.map((stat) => (
                <div key={stat.name} className="p-6 bg-card rounded-lg shadow-md">
                  <stat.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  <p className="text-muted-foreground mt-1">{stat.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Mobile App Promotion */}
        <section className="py-16 sm:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 bg-primary/10 p-8 md:p-12 rounded-xl shadow-lg">
              <div className="md:w-1/2 text-center md:text-left">
                <h2 className="text-3xl font-bold text-foreground mb-4">Take ResumeMatch AI On The Go!</h2>
                <p className="text-muted-foreground mb-6">
                  Download our mobile app to access all features anytime, anywhere. Stay ahead in your job search and networking efforts.
                </p>
                <div className="flex justify-center md:justify-start space-x-4">
                  <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/5">
                    <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.736 3.528C16.907 2.824 15.512 2.5 13.829 2.5c-2.032 0-4.264 1.056-5.67 2.512S5.28 8.184 5.28 10.056c0 1.407.976 3.248 2.304 4.607l.096.096c.216.216.48.384.768.528l4.431 2.287a.98.98 0 00.913 0l4.431-2.287c.288-.144.552-.312.768-.528l.096-.096c1.328-1.359 2.304-3.2 2.304-4.607 0-1.872-.864-3.864-2.88-5.528zM12 12.36a2.23 2.23 0 01-2.208-2.208A2.23 2.23 0 0112 7.944a2.23 2.23 0 012.208 2.208A2.23 2.23 0 0112 12.36zm7.632 7.824c-.336.624-.816 1.176-1.44 1.632-.528.384-1.2.72-1.872.96l-.24.072a14.016 14.016 0 01-2.088.432H10c-.744 0-1.44-.144-2.088-.432l-.24-.072c-.672-.24-1.344-.576-1.872-.96-.624-.456-1.104-1.008-1.44-1.632-.312-.552-.48-1.176-.48-1.8V18c0-1.056.504-2.016 1.344-2.664.38-.29.8-.5 1.24-.63l.38-.1a6.62 6.62 0 012.52-.37h4c.96 0 1.85.13 2.52.37l.38.1c.44.12.86.34 1.24.64.84.64 1.34 1.6 1.34 2.65v.36c0 .62-.17 1.24-.48 1.8z"/></svg>
                    App Store
                  </Button>
                  <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/5">
                     <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4.422 3.33A1.182 1.182 0 003.33 4.422v15.156c0 .625.473 1.123 1.092 1.123h.087L17.6 13.275V10.8L4.509 3.33h-.087zM18.385 11.4L5.136 4.01V20l13.249-7.422a1.18 1.18 0 000-2.034l-.001.001-.001.001zM19.653 12l-13.92 7.812c.035.002.07.003.106.003h.094a1.182 1.182 0 001.092-1.123V5.308a1.182 1.182 0 00-1.092-1.123h-.094c-.037 0-.071.001-.106.003L19.653 12z"/></svg>
                    Google Play
                  </Button>
                </div>
              </div>
              <div className="md:w-1/2 flex justify-center">
                <Image 
                  src="https://picsum.photos/seed/mobileapp/400/600" 
                  alt="Mobile App Preview" 
                  width={300} 
                  height={450} 
                  className="rounded-xl shadow-2xl"
                  data-ai-hint="mobile app screen"
                />
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="py-8 bg-primary/5 text-center text-muted-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} ResumeMatch AI. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
