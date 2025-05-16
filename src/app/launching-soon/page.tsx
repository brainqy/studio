
"use client";

import { useState, type FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox"; // Added Checkbox
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Rocket, Sparkles, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function LaunchingSoonPage() {
  const [email, setEmail] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false); // State for checkbox
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) {
      toast({ title: "Email Required", description: "Please enter your email address.", variant: "destructive" });
      return;
    }
    if (!termsAccepted) {
      toast({ title: "Terms Not Accepted", description: "Please accept the Terms and Conditions to proceed.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Notify email submitted:", email, "Terms Accepted:", termsAccepted);
    toast({ title: "You're on the list!", description: `We'll notify you at ${email} when we launch.` });
    setEmail('');
    setTermsAccepted(false); // Reset checkbox
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4 text-center">
      <Card className="w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="p-6 bg-primary text-primary-foreground">
          <Rocket className="h-16 w-16 mx-auto mb-4" />
          <CardTitle className="text-3xl md:text-4xl font-extrabold">
            Something Awesome is Coming Soon!
          </CardTitle>
          <CardDescription className="text-lg text-primary-foreground/80 mt-2">
            ResumeMatch AI is preparing to launch exciting new features to supercharge your career journey.
          </CardDescription>
        </div>
        
        <CardContent className="p-6 space-y-6">
          <div className="text-center">
            <Sparkles className="h-10 w-10 text-yellow-400 mx-auto mb-3 animate-pulse" />
            <p className="text-muted-foreground text-md">
              We're putting the finishing touches on a revolutionary update. Get ready for an even smarter, more intuitive, and powerful platform.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="notify-email" className="sr-only">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="notify-email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-12 text-base"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 justify-center">
              <Checkbox 
                id="terms" 
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(Boolean(checked))}
                disabled={isLoading}
              />
              <Label
                htmlFor="terms"
                className="text-xs text-muted-foreground leading-snug"
              >
                I agree to the 
                <Link href="/terms" className="underline hover:text-primary" target="_blank"> Terms and Conditions</Link> and 
                <Link href="/privacy" className="underline hover:text-primary" target="_blank"> Privacy Policy</Link>.
              </Label>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-lg bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={isLoading || !termsAccepted}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" /> Notify Me!
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="p-6 bg-secondary/30 border-t">
          <p className="text-xs text-muted-foreground text-center w-full">
            We respect your privacy and will only use your email to notify you about the launch.
            In the meantime, you can still <Link href="/" className="text-primary hover:underline font-medium">explore our current platform</Link>.
          </p>
        </CardFooter>
      </Card>

      <footer className="mt-8 text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} ResumeMatch AI. All rights reserved.
        <div className="mt-1 space-x-2">
            <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
            <span className="text-gray-400">|</span>
            <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
