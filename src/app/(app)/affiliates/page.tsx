
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Target, Copy, Share2, Users, CheckCircle, LinkIcon, DollarSign, BarChart3, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sampleUserProfile, sampleUserAffiliateProfile, sampleAffiliateClicks, sampleAffiliateSignups } from "@/lib/sample-data";
import type { Affiliate, AffiliateClick, AffiliateSignup } from "@/types";
import { format } from "date-fns";

export default function AffiliatesPage() {
  const { toast } = useToast();
  const user = sampleUserProfile;
  const affiliateProfile = sampleUserAffiliateProfile; // Assuming current user is an affiliate
  const affiliateLink = `https://resumematch.ai/join?aff=${affiliateProfile.affiliateCode}`;

  // Mocked data based on samples
  const totalClicks = sampleAffiliateClicks.length;
  const totalSignups = sampleAffiliateSignups.length;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Copied to Clipboard", description: "Affiliate code/link copied!" });
    }).catch(err => {
      toast({ title: "Copy Failed", description: "Could not copy text.", variant: "destructive" });
      console.error('Failed to copy: ', err);
    });
  };

  const handleShare = () => {
     if (navigator.share) {
      navigator.share({
        title: 'Supercharge Your Career with ResumeMatch AI!',
        text: `Check out ResumeMatch AI and use my affiliate link: ${affiliateLink}`,
        url: affiliateLink,
      })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing', error));
    } else {
      copyToClipboard(affiliateLink);
      toast({ title: "Link Copied", description: "Share API not supported. Affiliate link copied to clipboard instead." });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <Target className="h-8 w-8" /> Affiliates Program
      </h1>
      <CardDescription>Partner with ResumeMatch AI, share with your network, and earn commissions!</CardDescription>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Your Affiliate Details</CardTitle>
          <CardDescription>Use this code or link to promote ResumeMatch AI.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="affiliate-code">Your Unique Affiliate Code</Label>
            <div className="flex items-center space-x-2">
              <Input id="affiliate-code" value={affiliateProfile.affiliateCode} readOnly className="font-mono"/>
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(affiliateProfile.affiliateCode)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="affiliate-link">Your Affiliate Link</Label>
            <div className="flex items-center space-x-2">
              <Input id="affiliate-link" value={affiliateLink} readOnly />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(affiliateLink)}>
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
           <p className="text-sm text-muted-foreground">
            Commission Rate: <span className="font-semibold text-primary">{(affiliateProfile.commissionRate * 100).toFixed(0)}%</span>
          </p>
        </CardContent>
         <CardFooter className="flex justify-end">
             <Button onClick={handleShare} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Share2 className="mr-2 h-4 w-4" /> Share Affiliate Link
            </Button>
        </CardFooter>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Affiliate Performance</CardTitle>
          <CardDescription>Track your clicks, signups, and earnings.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 border rounded-lg">
                <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2"/>
                <p className="text-2xl font-bold">{totalClicks}</p>
                <p className="text-sm text-muted-foreground">Total Clicks</p>
            </div>
             <div className="p-4 border rounded-lg">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2"/>
                <p className="text-2xl font-bold">{totalSignups}</p>
                <p className="text-sm text-muted-foreground">Successful Signups</p>
            </div>
            <div className="p-4 border rounded-lg">
                <DollarSign className="h-8 w-8 text-yellow-500 mx-auto mb-2"/>
                <p className="text-2xl font-bold">${affiliateProfile.totalEarned.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Total Earned</p>
            </div>
        </CardContent>
      </Card>

       <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Recent Signups via Your Link</CardTitle>
        </CardHeader>
        <CardContent>
          {sampleAffiliateSignups.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No signups through your affiliate link yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID (Masked)</TableHead>
                  <TableHead>Signup Date</TableHead>
                  <TableHead className="text-right">Commission Earned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleAffiliateSignups.map((signup) => (
                  <TableRow key={signup.id}>
                    <TableCell className="font-medium">User...{signup.newUserId.slice(-4)}</TableCell>
                    <TableCell>{format(new Date(signup.signupDate), 'PP')}</TableCell>
                    <TableCell className="text-right text-green-600 font-semibold">
                      {signup.commissionEarned ? `$${signup.commissionEarned.toFixed(2)}` : 'Pending'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
         <CardFooter>
            <p className="text-xs text-muted-foreground">Commissions are typically processed at the end of each month.</p>
         </CardFooter>
      </Card>

       <Card className="shadow-lg bg-primary/10 border-primary/30">
            <CardHeader>
                <CardTitle>How the Affiliate Program Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-foreground/80">
                <p>1. Share your unique affiliate code or link.</p>
                <p>2. When someone signs up using your link and subscribes to a paid plan (if applicable), you earn a commission.</p>
                <p>3. Track your performance and earnings in this dashboard.</p>
                <p>4. Payouts are typically made monthly via [Payment Method - e.g., PayPal].</p>
            </CardContent>
        </Card>
    </div>
  );
}
