
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Settings, Palette, UploadCloud, Bell, Lock, WalletCards, Sun, Moon, Award, Gift, Paintbrush } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { sampleUserProfile } from "@/lib/sample-data"; // For checking admin role

export default function SettingsPage() {
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [appNotificationsEnabled, setAppNotificationsEnabled] = useState(true);
  const [gamificationNotificationsEnabled, setGamificationNotificationsEnabled] = useState(true);
  const [referralNotificationsEnabled, setReferralNotificationsEnabled] = useState(true);
  const [walletEnabled, setWalletEnabled] = useState(true);

  // Mocked theme colors
  const [primaryColor, setPrimaryColor] = useState("#008080"); // Default Teal
  const [accentColor, setAccentColor] = useState("#009688"); // Default Slightly Lighter Teal

  const isAdmin = sampleUserProfile.role === 'admin';

  useEffect(() => {
    // Check initial theme from localStorage or system preference
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setIsDarkMode(storedTheme === 'dark');
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    document.documentElement.classList.toggle('dark', newIsDarkMode);
    localStorage.setItem('theme', newIsDarkMode ? 'dark' : 'light');
    toast({ title: "Theme Changed", description: `Switched to ${newIsDarkMode ? 'Dark' : 'Light'} Mode.` });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      // Mock upload
      toast({ title: "Logo Uploaded (Mock)", description: `${file.name} selected. In a real app, this would upload and apply to the tenant.` });
    }
  };

  const handleColorChange = (colorType: 'primary' | 'accent', value: string) => {
    if (colorType === 'primary') setPrimaryColor(value);
    if (colorType === 'accent') setAccentColor(value);
    // In a real app, this would update CSS variables and save to backend for the tenant
    toast({ title: "Color Updated (Mock)", description: `${colorType.charAt(0).toUpperCase() + colorType.slice(1)} color changed to ${value}.` });
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <Settings className="h-8 w-8" /> Settings
      </h1>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-primary"/>Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-md border hover:bg-secondary/30">
            <Label htmlFor="theme-switcher" className="flex items-center gap-2 text-sm font-medium">
              {isDarkMode ? <Moon className="h-5 w-5"/> : <Sun className="h-5 w-5"/>}
              Dark Mode
            </Label>
            <Switch id="theme-switcher" checked={isDarkMode} onCheckedChange={toggleTheme} />
          </div>
          
          {isAdmin && (
            <>
            <div className="space-y-2 p-3 rounded-md border hover:bg-secondary/30">
              <Label htmlFor="logo-upload" className="text-sm font-medium flex items-center gap-2">
                  <UploadCloud className="h-5 w-5"/> Custom Tenant Logo (Admins Only)
              </Label>
              <Input id="logo-upload" type="file" accept="image/png, image/jpeg" onChange={handleLogoUpload} className="text-sm"/>
              <p className="text-xs text-muted-foreground">Upload your company logo for this tenant. Recommended size: 200x50px.</p>
            </div>

            <div className="space-y-3 p-3 rounded-md border hover:bg-secondary/30">
                <Label className="text-sm font-medium flex items-center gap-2">
                    <Paintbrush className="h-5 w-5"/> Tenant Theme Colors (Admins Only - Mocked)
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="primary-color" className="text-xs">Primary Color</Label>
                        <div className="flex items-center gap-2">
                            <Input type="color" id="primary-color" value={primaryColor} onChange={(e) => handleColorChange('primary', e.target.value)} className="w-12 h-8 p-1"/>
                            <Input type="text" value={primaryColor} onChange={(e) => handleColorChange('primary', e.target.value)} placeholder="#RRGGBB"/>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="accent-color" className="text-xs">Accent Color</Label>
                        <div className="flex items-center gap-2">
                            <Input type="color" id="accent-color" value={accentColor} onChange={(e) => handleColorChange('accent', e.target.value)} className="w-12 h-8 p-1"/>
                            <Input type="text" value={accentColor} onChange={(e) => handleColorChange('accent', e.target.value)} placeholder="#RRGGBB"/>
                        </div>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">Customize primary and accent colors for this tenant's UI. (This is a mocked feature)</p>
            </div>
            </>
          )}

        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary"/>Notifications</CardTitle>
          <CardDescription>Manage your notification preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-md border hover:bg-secondary/30">
            <Label htmlFor="email-notifications" className="text-sm font-medium">General Email Notifications</Label>
            <Switch id="email-notifications" checked={emailNotificationsEnabled} onCheckedChange={setEmailNotificationsEnabled} />
          </div>
           <div className="flex items-center justify-between p-3 rounded-md border hover:bg-secondary/30">
            <Label htmlFor="app-notifications" className="text-sm font-medium">General In-App Notifications</Label>
            <Switch id="app-notifications" checked={appNotificationsEnabled} onCheckedChange={setAppNotificationsEnabled} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-md border hover:bg-secondary/30">
            <Label htmlFor="gamification-notifications" className="flex items-center gap-2 text-sm font-medium">
              <Award className="h-4 w-4" /> Gamification Notifications (Badges, XP)
            </Label>
            <Switch id="gamification-notifications" checked={gamificationNotificationsEnabled} onCheckedChange={setGamificationNotificationsEnabled} />
          </div>
           <div className="flex items-center justify-between p-3 rounded-md border hover:bg-secondary/30">
            <Label htmlFor="referral-notifications" className="flex items-center gap-2 text-sm font-medium">
              <Gift className="h-4 w-4" /> Referral Program Updates
            </Label>
            <Switch id="referral-notifications" checked={referralNotificationsEnabled} onCheckedChange={setReferralNotificationsEnabled} />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><WalletCards className="h-5 w-5 text-primary"/>Features</CardTitle>
          <CardDescription>Enable or disable specific application features (Tenant-wide settings may apply).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center justify-between p-3 rounded-md border hover:bg-secondary/30">
            <Label htmlFor="wallet-enable" className="text-sm font-medium">Digital Wallet System</Label>
            <Switch id="wallet-enable" checked={walletEnabled} onCheckedChange={setWalletEnabled} />
          </div>
          {/* Add more feature toggles here as needed */}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5 text-primary"/>Privacy & Security</CardTitle>
          <CardDescription>Manage your data and privacy settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center justify-between p-3 rounded-md border hover:bg-secondary/30">
             <Label htmlFor="data-sharing" className="text-sm font-medium">Data Sharing with Alumni Network</Label>
            <Switch id="data-sharing" defaultChecked />
          </div>
          {isAdmin && (
             <div className="flex items-center justify-between p-3 rounded-md border hover:bg-secondary/30">
                <Label htmlFor="two-factor-auth" className="text-sm font-medium">Enforce Two-Factor Authentication (Admins Only)</Label>
                <Switch id="two-factor-auth" onCheckedChange={() => toast({ title: "Mock Action", description: "2FA setting toggled for the tenant." })} />
            </div>
          )}
          <Button variant="outline" onClick={() => toast({title: "Action Mocked", description:"Password change form would appear here."})}>
            Change Password
          </Button>
          <Button variant="destructive" onClick={() => toast({title: "Data Deletion (Mock)", description:"Data deletion request initiated."})}>
            Request Data Deletion
          </Button>
        </CardContent>
      </Card>

      <div className="pt-4 text-center">
        <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => toast({title:"Settings Saved", description:"Your preferences have been updated."})}>
          Save All Settings
        </Button>
      </div>
    </div>
  );
}

