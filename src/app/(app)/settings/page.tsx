
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Settings, Palette, UploadCloud, Bell, Lock, WalletCards, Sun, Moon, Award, Gift, Paintbrush, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, type FormEvent } from "react";
import { sampleUserProfile, sampleTenants, samplePlatformSettings } from "@/lib/sample-data"; 
import type { Tenant, UserProfile, PlatformSettings } from "@/types";

export default function SettingsPage() {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<UserProfile>(sampleUserProfile);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(samplePlatformSettings);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Notification states
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [appNotificationsEnabled, setAppNotificationsEnabled] = useState(true);
  const [gamificationNotificationsEnabled, setGamificationNotificationsEnabled] = useState(true);
  const [referralNotificationsEnabled, setReferralNotificationsEnabled] = useState(true);
  
  // Feature states
  const [walletEnabled, setWalletEnabled] = useState(platformSettings.walletEnabled);

  // Tenant specific states (for manager role)
  const [tenantNameInput, setTenantNameInput] = useState("");
  const [tenantLogoUrlInput, setTenantLogoUrlInput] = useState("");
  const [currentPrimaryColor, setCurrentPrimaryColor] = useState("");
  const [currentAccentColor, setCurrentAccentColor] = useState("");

  // Change Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

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

    // Load settings based on user role
    if (currentUser.role === 'manager' && currentUser.tenantId) {
      const currentTenant = sampleTenants.find(t => t.id === currentUser.tenantId);
      if (currentTenant) {
        setTenantNameInput(currentTenant.name);
        setTenantLogoUrlInput(currentTenant.settings?.customLogoUrl || "");
        setCurrentPrimaryColor(currentTenant.settings?.primaryColor || "#008080");
        setCurrentAccentColor(currentTenant.settings?.accentColor || "#009688");
      }
    }
    // Initialize platform feature toggles (could be from fetched settings)
    setWalletEnabled(platformSettings.walletEnabled);

  }, [currentUser.role, currentUser.tenantId, platformSettings.walletEnabled]);

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
      toast({ title: "Logo Selected (Mock)", description: `${file.name} selected. Click "Save All Settings" to apply for tenant.` });
      // Mock: In a real app, you might set a temporary URL or preview
      // For now, this action doesn't directly change tenantLogoUrlInput until save
    }
  };

  const handleTenantColorChange = (colorType: 'primary' | 'accent', value: string) => {
    if (colorType === 'primary') setCurrentPrimaryColor(value);
    if (colorType === 'accent') setCurrentAccentColor(value);
    // Note: Actual application of these colors would be more complex, involving CSS variables or backend logic.
  };

  const handleSaveSettings = () => {
    // Mock saving general settings
    console.log("General settings saved (mocked):", {
      isDarkMode, emailNotificationsEnabled, appNotificationsEnabled,
      gamificationNotificationsEnabled, referralNotificationsEnabled, walletEnabled
    });
    
    // For platform settings (if admin)
    if(currentUser.role === 'admin'){
        // Update the global samplePlatformSettings object
        Object.assign(samplePlatformSettings, { walletEnabled });
        toast({ title: "Platform Settings Saved", description: "Platform feature preferences have been updated." });
    }

    // If manager, save tenant specific settings
    if (currentUser.role === 'manager' && currentUser.tenantId) {
      const tenantIndex = sampleTenants.findIndex(t => t.id === currentUser.tenantId);
      if (tenantIndex !== -1) {
        const updatedTenant = { ...sampleTenants[tenantIndex] };
        updatedTenant.name = tenantNameInput;
        if (!updatedTenant.settings) updatedTenant.settings = { allowPublicSignup: true }; // Ensure settings object exists
        updatedTenant.settings.customLogoUrl = tenantLogoUrlInput;
        updatedTenant.settings.primaryColor = currentPrimaryColor;
        updatedTenant.settings.accentColor = currentAccentColor;
        
        sampleTenants[tenantIndex] = updatedTenant; // Update the in-memory sample data
        toast({ title: "Tenant Branding Saved", description: `Branding for "${tenantNameInput}" updated.` });
      }
    } else if (currentUser.role !== 'admin') { // For regular users
      toast({ title: "Settings Saved", description: "Your preferences have been updated." });
    }
  };
  
  const handleChangePassword = (event: FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast({ title: "Password Mismatch", description: "New password and confirm password do not match.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Password Too Short", description: "New password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    // Mock password change
    console.log("Attempting to change password (mocked):", { currentPassword, newPassword });
    toast({ title: "Password Changed (Mock)", description: "Your password has been successfully updated." });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
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
        </CardContent>
      </Card>

      {/* Tenant Branding Settings - Visible only to Managers */}
      {currentUser.role === 'manager' && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Paintbrush className="h-5 w-5 text-primary"/>Tenant Branding Settings</CardTitle>
            <CardDescription>Customize the branding for your tenant: {currentUser.currentOrganization || currentUser.tenantId}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tenant-name-input">Tenant Name</Label>
              <Input 
                id="tenant-name-input" 
                value={tenantNameInput} 
                onChange={(e) => setTenantNameInput(e.target.value)} 
                placeholder="Your Organization's Name"
              />
            </div>
            <div>
              <Label htmlFor="tenant-logo-url-input">Tenant Logo URL</Label>
              <Input 
                id="tenant-logo-url-input" 
                value={tenantLogoUrlInput} 
                onChange={(e) => setTenantLogoUrlInput(e.target.value)} 
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo-upload" className="text-sm font-medium flex items-center gap-2">
                  <UploadCloud className="h-5 w-5"/> Upload Custom Logo
              </Label>
              <Input id="logo-upload" type="file" accept="image/png, image/jpeg" onChange={handleLogoUpload} className="text-sm"/>
              <p className="text-xs text-muted-foreground">Replace the logo URL above with an uploaded image (mocked upload).</p>
            </div>
             <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                    Tenant Theme Colors (Mocked)
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="tenant-primary-color" className="text-xs">Primary Color</Label>
                        <div className="flex items-center gap-2">
                            <Input type="color" id="tenant-primary-color" value={currentPrimaryColor} onChange={(e) => handleTenantColorChange('primary', e.target.value)} className="w-12 h-8 p-1"/>
                            <Input type="text" value={currentPrimaryColor} onChange={(e) => handleTenantColorChange('primary', e.target.value)} placeholder="#RRGGBB"/>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="tenant-accent-color" className="text-xs">Accent Color</Label>
                        <div className="flex items-center gap-2">
                            <Input type="color" id="tenant-accent-color" value={currentAccentColor} onChange={(e) => handleTenantColorChange('accent', e.target.value)} className="w-12 h-8 p-1"/>
                            <Input type="text" value={currentAccentColor} onChange={(e) => handleTenantColorChange('accent', e.target.value)} placeholder="#RRGGBB"/>
                        </div>
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Platform Feature Toggles - Visible only to Admins */}
      {currentUser.role === 'admin' && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><WalletCards className="h-5 w-5 text-primary"/>Platform Features (Admin)</CardTitle>
            <CardDescription>Enable or disable specific application features globally.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-md border hover:bg-secondary/30">
              <Label htmlFor="wallet-enable-platform" className="text-sm font-medium">Digital Wallet System (Platform-wide)</Label>
              <Switch 
                id="wallet-enable-platform" 
                checked={walletEnabled} 
                onCheckedChange={(checked) => {
                    setWalletEnabled(checked);
                    // This would also update platformSettings in a real backend call
                    setPlatformSettings(prev => ({...prev, walletEnabled: checked}));
                }} 
              />
            </div>
            {/* Add more global feature toggles here as needed by admin */}
          </CardContent>
        </Card>
      )}


      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-primary"/>Change Password</CardTitle>
          <CardDescription>Update your account password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <Input 
                id="current-password" 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required 
              />
            </div>
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input 
                id="new-password" 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required 
              />
            </div>
            <div>
              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
              <Input 
                id="confirm-new-password" 
                type="password" 
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required 
              />
            </div>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Change Password
            </Button>
          </form>
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
          {currentUser.role === 'admin' && (
             <div className="flex items-center justify-between p-3 rounded-md border hover:bg-secondary/30">
                <Label htmlFor="two-factor-auth" className="text-sm font-medium">Enforce Two-Factor Authentication (Platform Admin)</Label>
                <Switch id="two-factor-auth" onCheckedChange={() => toast({ title: "Mock Action", description: "Platform 2FA setting toggled." })} />
            </div>
          )}
          <Button variant="destructive" onClick={() => toast({title: "Data Deletion (Mock)", description:"Data deletion request initiated."})}>
            Request Data Deletion
          </Button>
        </CardContent>
      </Card>

      <div className="pt-4 text-center">
        <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleSaveSettings}>
          Save All Settings
        </Button>
      </div>
    </div>
  );
}
