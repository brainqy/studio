
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Button asChild variant="outline" size="sm" className="mb-6">
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4"/>Back to Home</Link>
        </Button>
        <Card className="shadow-xl">
          <CardHeader className="border-b">
             <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
                <CardDescription>Last Updated: {new Date().toLocaleDateString()}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 prose prose-sm sm:prose dark:prose-invert max-w-none">
            <p>Your privacy is important to us. It is ResumeMatch AI's policy to respect your privacy regarding any information we may collect from you across our website and other sites we own and operate.</p>

            <h2>1. Information We Collect</h2>
            <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.</p>
            <p>Information we may collect includes:</p>
            <ul>
              <li>Contact Information: Name, email address, phone number.</li>
              <li>Professional Information: Resume content, job history, skills, education, career interests.</li>
              <li>Usage Data: Information about how you use our Service, such as features accessed and time spent on the platform.</li>
              <li>Technical Data: IP address, browser type, operating system.</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect in various ways, including to:</p>
            <ul>
              <li>Provide, operate, and maintain our Service</li>
              <li>Improve, personalize, and expand our Service</li>
              <li>Understand and analyze how you use our Service</li>
              <li>Develop new products, services, features, and functionality</li>
              <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the Service, and for marketing and promotional purposes</li>
              <li>Process your transactions</li>
              <li>Find and prevent fraud</li>
            </ul>

            <h2>3. Sharing Your Information</h2>
            <p>We do not share your personally identifying information publicly or with third-parties, except when required to by law, or to protect our rights, or if you consent to share it (e.g., with other alumni for networking purposes if you opt-in).</p>
            <p>Our website may link to external sites that are not operated by us. Please be aware that we have no control over the content and practices of these sites, and cannot accept responsibility or liability for their respective privacy policies.</p>
            
            <h2>4. Data Security</h2>
            <p>We take reasonable precautions to protect your information. When you submit sensitive information via the website, your information is protected both online and offline. However, no method of transmission over the Internet, or method of electronic storage, is 100% secure.</p>

            <h2>5. Your Data Rights</h2>
            <p>You are free to refuse our request for your personal information, with the understanding that we may be unable to provide you with some of your desired services. You have the right to access, update, or delete the information we have on you. If you wish to exercise these rights, please contact us.</p>

            <h2>6. Children's Privacy</h2>
            <p>Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with Personal Information, please contact us.</p>

            <h2>7. Changes to This Privacy Policy</h2>
            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>

            <h2>8. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at [Your Contact Email/Link].</p>
            
             <p className="mt-6 text-center text-muted-foreground">
              --- Placeholder Content ---
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
