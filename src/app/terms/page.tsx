
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Button asChild variant="outline" size="sm" className="mb-6">
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4"/>Back to Home</Link>
        </Button>
        <Card className="shadow-xl">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
                <CardDescription>Last Updated: {new Date().toLocaleDateString()}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 prose prose-sm sm:prose dark:prose-invert max-w-none">
            <p>Welcome to ResumeMatch AI!</p>
            
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing or using ResumeMatch AI (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to all of these Terms, do not use the Service.</p>

            <h2>2. Description of Service</h2>
            <p>ResumeMatch AI provides AI-powered tools for resume analysis, job matching, alumni networking, and other career development services.</p>

            <h2>3. User Accounts</h2>
            <p>To access certain features, you may need to create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.</p>

            <h2>4. User Conduct</h2>
            <p>You agree not to use the Service for any unlawful purpose or in any way that interrupts, damages, or impairs the service. You agree not to upload or transmit any material that is defamatory, offensive, or otherwise objectionable.</p>

            <h2>5. Intellectual Property</h2>
            <p>The Service and its original content, features, and functionality are owned by ResumeMatch AI and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.</p>

            <h2>6. AI-Generated Content</h2>
            <p>The Service uses artificial intelligence to generate content such as resume analyses, cover letters, and skill suggestions. While we strive for accuracy, AI-generated content may contain errors or inaccuracies. You are responsible for reviewing and verifying any AI-generated content before use.</p>
            
            <h2>7. Termination</h2>
            <p>We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>

            <h2>8. Limitation of Liability</h2>
            <p>In no event shall ResumeMatch AI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>

            <h2>9. Governing Law</h2>
            <p>These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.</p>

            <h2>10. Changes to Terms</h2>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>

            <h2>11. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at [Your Contact Email/Link].</p>
            
            <p className="mt-6 text-center text-muted-foreground">
              --- Placeholder Content ---
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
