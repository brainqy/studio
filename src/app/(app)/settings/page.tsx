"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Settings, Palette, UploadCloud, Bell, Lock, WalletCards, Sun, Moon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [walletEnabled, setWalletEnabled] = useState(true);

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
      toast({ title: "Logo Uploaded (Mock)", description: `${file.name} selected. In a real app, this would upload.` });
    }
  };

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
          <div className="space-y-2 p-3 rounded-md border hover:bg-secondary/30">
            <Label htmlFor="logo-upload" className="text-sm font-medium flex items-center gap-2">
                <UploadCloud className="h-5 w-5"/> Custom Logo (Admins Only)
            </Label>
            <Input id="logo-upload" type="file" accept="image/png, image/jpeg" onChange={handleLogoUpload} className="text-sm"/>
            <p className="text-xs text-muted-foreground">Upload your company logo. Recommended size: 200x50px.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary"/>Notifications</CardTitle>
          <CardDescription>Manage your notification preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-md border hover:bg-secondary/30">
            <Label htmlFor="email-notifications" className="text-sm font-medium">Email Notifications</Label>
            <Switch id="email-notifications" checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-md border hover:bg-secondary/30">
            <Label htmlFor="app-notifications" className="text-sm font-medium">In-App Notifications</Label>
            <Switch id="app-notifications" defaultChecked />
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><WalletCards className="h-5 w-5 text-primary"/>Features</CardTitle>
          <CardDescription>Enable or disable specific application features.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center justify-between p-3 rounded-md border hover:bg-secondary/30">
            <Label htmlFor="wallet-enable" className="text-sm font-medium">Digital Wallet System</Label>
            <Switch id="wallet-enable" checked={walletEnabled} onCheckedChange={setWalletEnabled} />
          </div>
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
          <Button variant="outline">Change Password</Button>
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
