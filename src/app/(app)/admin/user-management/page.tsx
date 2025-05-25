
"use client";

import { useState, useMemo, useEffect, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { UserCog, PlusCircle, Edit3, Trash2, Upload, DownloadCloud, ChevronDown, Search, HelpCircle, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile, UserRole, UserStatus } from "@/types";
import { samplePlatformUsers, sampleUserProfile, sampleTenants, SAMPLE_TENANT_ID } from "@/lib/sample-data";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";
import AccessDeniedMessage from "@/components/ui/AccessDeniedMessage";

const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(['admin', 'manager', 'user'] as [UserRole, ...UserRole[]]),
  status: z.enum(['active', 'inactive', 'pending', 'suspended'] as [UserStatus, ...UserStatus[]]),
  tenantId: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

const parseCSV = (csvText: string): Record<string, string>[] => {
  if (!csvText || typeof csvText !== 'string') {
    console.warn("[UserManagement] parseCSV: Input CSV text is invalid or empty.");
    return [];
  }
  const lines = csvText.trim().split(/\r\n|\n|\r/).filter(line => line.trim() !== ''); // Filter out empty lines
  if (lines.length < 2) {
    console.warn("[UserManagement] parseCSV: CSV requires at least a header and one data row.");
    return []; 
  }

  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  const dataRows = lines.slice(1);
  console.log("[UserManagement] parseCSV: Headers found:", header);

  return dataRows.map((rowText, rowIndex) => {
    // This simple split won't handle commas inside quoted fields correctly.
    // For a more robust solution, consider a dedicated CSV parsing library if complex CSVs are expected.
    const values = rowText.split(',').map(v => v.trim());
    const rowObject: Record<string, string> = {};
    header.forEach((colName, index) => {
      rowObject[colName] = values[index] || ''; // Default to empty string if value is missing for a header
    });
    console.log(`[UserManagement] parseCSV: Parsed row ${rowIndex + 1}:`, rowObject);
    return rowObject;
  });
};

const convertToCSV = (data: UserProfile[]): string => {
  if (!data || data.length === 0) return "";
  const headers = ["ID", "Name", "Email", "Role", "Status", "TenantID", "LastLogin", "CreatedAt"];
  const csvRows = [
    headers.join(','),
    ...data.map(user => [
      user.id,
      `"${user.name.replace(/"/g, '""')}"`,
      user.email,
      user.role,
      user.status || 'N/A',
      user.tenantId || 'N/A',
      user.lastLogin ? format(new Date(user.lastLogin), 'yyyy-MM-dd HH:mm:ss') : 'N/A',
      user.createdAt ? format(new Date(user.createdAt), 'yyyy-MM-dd HH:mm:ss') : 'N/A'
    ].join(','))
  ];
  return csvRows.join('\n');
};


export default function UserManagementPage() {
  const currentUser = sampleUserProfile;
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const { toast } = useToast();

  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);


  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    setUsers(
      currentUser.role === 'admin'
        ? [...samplePlatformUsers]
        : samplePlatformUsers.filter(u => u.tenantId === currentUser.tenantId)
    );
  }, [currentUser.role, currentUser.tenantId]);


  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.id && user.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [users, searchTerm]);

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      setSelectedUserIds(new Set(filteredUsers.map(u => u.id)));
    } else {
      setSelectedUserIds(new Set());
    }
  };

  const handleSelectRow = (userId: string, checked: boolean) => {
    const newSelectedIds = new Set(selectedUserIds);
    if (checked) {
      newSelectedIds.add(userId);
    } else {
      newSelectedIds.delete(userId);
    }
    setSelectedUserIds(newSelectedIds);
  };

  const onUserFormSubmit = (data: UserFormData) => {
    if (editingUser) {
      const updatedUser = {
        ...editingUser,
        ...data,
        tenantId: currentUser.role === 'admin' && data.tenantId ? data.tenantId : editingUser.tenantId,
      };
      setUsers(prev => prev.map(u => u.id === editingUser.id ? updatedUser : u));
      const platformUserIndex = samplePlatformUsers.findIndex(pu => pu.id === editingUser.id);
      if (platformUserIndex !== -1) {
        samplePlatformUsers[platformUserIndex] = updatedUser;
      }
      toast({ title: "User Updated", description: `User "${data.name}" has been updated.` });
    } else {
      let newTenantId = currentUser.role === 'manager' ? currentUser.tenantId : data.tenantId;
      if (currentUser.role === 'admin' && !newTenantId) {
          newTenantId = SAMPLE_TENANT_ID; // Default for admin if no tenant specified
          toast({ title: "Notice", description: `New user assigned to default tenant '${newTenantId}'.`, variant: "default"});
      } else if (currentUser.role === 'admin' && newTenantId && !sampleTenants.find(t => t.id === newTenantId)) {
          toast({ title: "Warning", description: `Specified Tenant ID '${newTenantId}' not found. User not created.`, variant: "destructive"});
          setIsLoading(false);
          return;
      }


      const newUser: UserProfile = {
        ...data,
        id: `user-${Date.now()}`,
        tenantId: newTenantId!,
        lastLogin: new Date().toISOString(),
        profilePictureUrl: `https://avatar.vercel.sh/${data.email.split('@')[0]}.png`,
        createdAt: new Date().toISOString(),
        skills: [],
        bio: '',
        currentJobTitle: '',
        company: '',
        currentOrganization: '',
        dateOfBirth: undefined,
        gender: undefined,
        mobileNumber: '',
        currentAddress: '',
        graduationYear: '',
        degreeProgram: undefined,
        department: '',
        industry: undefined,
        workLocation: '',
        linkedInProfile: '',
        yearsOfExperience: '',
        areasOfSupport: [],
        timeCommitment: undefined,
        preferredEngagementMode: undefined,
        otherComments: '',
        lookingForSupportType: undefined,
        helpNeededDescription: '',
        shareProfileConsent: true,
        featureInSpotlightConsent: false,
        isDistinguished: false,
        resumeText: '',
        careerInterests: '',
        interests: [],
        offersHelpWith: [],
        appointmentCoinCost: 10,
        xpPoints: 0,
        dailyStreak: 0,
        longestStreak: 0,
        totalActiveDays: 0,
        weeklyActivity: Array(7).fill(false),
        referralCode: `REF-${Date.now().toString().slice(-6)}`,
        earnedBadges: [],
        affiliateCode: undefined,
        pastInterviewSessions: [],
        interviewCredits: 0,
      };
      setUsers(prev => [newUser, ...prev]);
      samplePlatformUsers.push(newUser);
      toast({ title: "User Created", description: `User "${data.name}" has been created for tenant ${newTenantId}.` });
    }
    setIsUserDialogOpen(false);
    reset({ name: '', email: '', role: 'user', status: 'pending', tenantId: currentUser.role === 'manager' ? currentUser.tenantId : ''});
    setEditingUser(null);
  };

  const openNewUserDialog = () => {
    setEditingUser(null);
    reset({ name: '', email: '', role: 'user', status: 'pending', tenantId: currentUser.role === 'manager' ? currentUser.tenantId : '' });
    setIsUserDialogOpen(true);
  };

  const openEditUserDialog = (user: UserProfile) => {
    setEditingUser(user);
    setValue('name', user.name);
    setValue('email', user.email);
    setValue('role', user.role);
    setValue('status', user.status || 'pending');
    setValue('id', user.id);
    setValue('tenantId', user.tenantId);
    setIsUserDialogOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    const indexInPlatformUsers = samplePlatformUsers.findIndex(u => u.id === userId);
    if (indexInPlatformUsers > -1) {
        samplePlatformUsers.splice(indexInPlatformUsers, 1);
    }
    setSelectedUserIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
    });
    toast({ title: "User Deleted", description: `User ID ${userId} deleted.`, variant: "destructive" });
  };

  const handleBulkAction = (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedUserIds.size === 0) {
        toast({title: "No Users Selected", description: "Please select users to perform bulk action.", variant:"destructive"});
        return;
    }
    let updatedUsersLocally = [...users];
    
    selectedUserIds.forEach(selectedId => {
        const userIndexGlobal = samplePlatformUsers.findIndex(u => u.id === selectedId);
        if (userIndexGlobal !== -1) {
            if (action === 'activate') samplePlatformUsers[userIndexGlobal].status = 'active';
            else if (action === 'deactivate') samplePlatformUsers[userIndexGlobal].status = 'inactive';
        }
    });

    if (action === 'delete') {
        updatedUsersLocally = users.filter(u => !selectedUserIds.has(u.id));
        // Update global sample data
        const originalLength = samplePlatformUsers.length;
        samplePlatformUsers.splice(0, samplePlatformUsers.length, ...samplePlatformUsers.filter(u => !selectedUserIds.has(u.id)));
        console.log(`[UserManagement] Global users deleted: ${originalLength - samplePlatformUsers.length}`);
        toast({title: "Users Deleted", description: `${selectedUserIds.size} users deleted.`, variant: "destructive"});
    } else if (action === 'activate') {
        updatedUsersLocally = users.map(u => selectedUserIds.has(u.id) ? {...u, status: 'active'} : u);
        toast({title: "Users Activated", description: `${selectedUserIds.size} users activated.`});
    } else if (action === 'deactivate') {
        updatedUsersLocally = users.map(u => selectedUserIds.has(u.id) ? {...u, status: 'inactive'} : u);
        toast({title: "Users Deactivated", description: `${selectedUserIds.size} users deactivated.`});
    }

    setUsers(updatedUsersLocally);
    setSelectedUserIds(new Set());
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      console.log("[UserManagement] File selected:", event.target.files[0].name);
    } else {
      setSelectedFile(null);
      console.log("[UserManagement] File selection cleared.");
    }
  };

  const handleConfirmImport = () => {
    if (!selectedFile) {
      toast({ title: "No File Selected", description: "Please select a CSV file to import.", variant: "destructive" });
      return;
    }
    console.log("[UserManagement] Attempting to import file:", selectedFile.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target?.result as string;
      if (!csvText) {
        toast({ title: "File Error", description: "Could not read the file content.", variant: "destructive" });
        console.error("[UserManagement] FileReader result is null or undefined.");
        return;
      }
      console.log("[UserManagement] CSV content read, length:", csvText.length);
      try {
        const parsedUsersFromCSV = parseCSV(csvText);
        console.log("[UserManagement] Parsed CSV data:", parsedUsersFromCSV);
        if (parsedUsersFromCSV.length === 0) {
          toast({ title: "Empty or Invalid CSV", description: "No valid user data found. Expected headers: Name,Email. Optional: Role,Status,TenantID (case-insensitive).", variant: "destructive", duration: 7000 });
          return;
        }

        const newUsersToAdd: UserProfile[] = [];
        let importedCount = 0;
        let skippedCount = 0;

        for (const row of parsedUsersFromCSV) {
          const name = (row.name || '').trim();
          const email = (row.email || '').trim();
          
          const rawRole = (row.role || '').trim().toLowerCase();
          const role: UserRole = ['admin', 'manager', 'user'].includes(rawRole) ? rawRole as UserRole : 'user';

          const rawStatus = (row.status || '').trim().toLowerCase();
          const status: UserStatus = ['active', 'inactive', 'pending', 'suspended'].includes(rawStatus) ? rawStatus as UserStatus : 'pending';
          
          let csvTenantId = (row.tenantid || '').trim(); // Header: 'tenantid' (lowercase from parseCSV)

          console.log(`[UserManagement] Processing CSV row: Name='${name}', Email='${email}', Role='${role}', Status='${status}', CSVTenantID='${csvTenantId}'`);

          if (!name || !email) {
            console.warn("[UserManagement] Skipping row due to missing Name or Email:", row);
            skippedCount++;
            continue;
          }
          if (!email.includes('@')) {
              console.warn(`[UserManagement] Skipping row due to invalid email format '${email}':`, row);
              skippedCount++;
              continue;
          }

          let finalTenantId: string | undefined = undefined;
          if (currentUser.role === 'admin') {
            if (csvTenantId) {
              if (sampleTenants.find(t => t.id.toLowerCase() === csvTenantId.toLowerCase())) { // Case-insensitive check for tenant ID
                finalTenantId = sampleTenants.find(t => t.id.toLowerCase() === csvTenantId.toLowerCase())!.id; // Use actual ID casing
              } else {
                console.warn(`[UserManagement] Admin import: Tenant ID '${csvTenantId}' not found for user ${email}. Skipping user.`);
                skippedCount++;
                continue;
              }
            } else { // No tenantID in CSV, admin importing
              finalTenantId = SAMPLE_TENANT_ID; // Default tenant (e.g., 'Brainqy')
              console.log(`[UserManagement] Admin import: No Tenant ID in CSV for ${email}, assigning to default: ${finalTenantId}`);
            }
          } else if (currentUser.role === 'manager') {
            finalTenantId = currentUser.tenantId!;
            if (csvTenantId && csvTenantId.toLowerCase() !== finalTenantId.toLowerCase()) {
                console.warn(`[UserManagement] Manager import: User ${email} CSV TenantID '${csvTenantId}' differs from manager's tenant '${finalTenantId}'. User will be assigned to manager's tenant.`);
            }
             console.log(`[UserManagement] Manager import: Assigning user ${email} to manager's tenant: ${finalTenantId}`);
          } else {
            console.warn("[UserManagement] Import attempt by non-admin/manager. Skipping.");
            skippedCount++;
            continue;
          }
          
          if (finalTenantId && !sampleTenants.find(t => t.id === finalTenantId)) { // Final check with correct casing
              console.warn(`[UserManagement] Critical Error: Final Tenant ID '${finalTenantId}' resolved but not found for user ${email}. Skipping user.`);
              skippedCount++;
              continue;
          }

          const existingUser = samplePlatformUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
          if (existingUser) {
            console.warn(`[UserManagement] Skipping existing user (email already exists): ${email}`);
            skippedCount++;
            continue;
          }

          const newUser: UserProfile = {
            id: `user-csv-${Date.now()}-${importedCount}-${Math.random().toString(16).slice(2)}`,
            name,
            email,
            role,
            status,
            tenantId: finalTenantId!,
            lastLogin: new Date().toISOString(),
            profilePictureUrl: `https://avatar.vercel.sh/${email.split('@')[0]}.png`,
            createdAt: new Date().toISOString(),
            skills: [], bio: 'Imported via CSV', currentJobTitle: '', company: '', currentOrganization: '',
            dateOfBirth: undefined, gender: undefined, mobileNumber: '', currentAddress: '',
            graduationYear: '', degreeProgram: undefined, department: '', industry: undefined,
            workLocation: '', linkedInProfile: '', yearsOfExperience: '', areasOfSupport: [],
            timeCommitment: undefined, preferredEngagementMode: undefined, otherComments: '',
            lookingForSupportType: undefined, helpNeededDescription: '', shareProfileConsent: true,
            featureInSpotlightConsent: false, isDistinguished: false, resumeText: '', careerInterests: '',
            interests: [], offersHelpWith: [], appointmentCoinCost: 10, xpPoints: 0, dailyStreak: 0,
            longestStreak: 0, totalActiveDays: 0, weeklyActivity: Array(7).fill(false),
            referralCode: `REFCSV${Date.now().toString().slice(-5)}-${importedCount}`,
            earnedBadges: [], affiliateCode: undefined, pastInterviewSessions: [], interviewCredits: 0,
          };
          newUsersToAdd.push(newUser);
          importedCount++;
          console.log(`[UserManagement] User ${email} prepared for import to tenant ${finalTenantId}.`);
        }

        if (newUsersToAdd.length > 0) {
          samplePlatformUsers.push(...newUsersToAdd);
          setUsers(prev => {
            const currentDisplayedIds = new Set(prev.map(u => u.id));
            const trulyNewForDisplay = newUsersToAdd.filter(nu => 
                !currentDisplayedIds.has(nu.id) && 
                (currentUser.role === 'admin' || nu.tenantId === currentUser.tenantId)
            );
            return [...prev, ...trulyNewForDisplay];
          });
          console.log(`[UserManagement] ${newUsersToAdd.length} new users added to samplePlatformUsers. Displayed users updated.`);
        }

        toast({
          title: "Import Processed",
          description: `${importedCount} users processed for import. ${skippedCount} users skipped (check browser console for details). Refresh might be needed to see all changes if not immediately visible.`,
          duration: 7000
        });

      } catch (error) {
        console.error("[UserManagement] Error parsing or processing CSV:", error);
        toast({ title: "CSV Processing Error", description: "Could not process the CSV file. Ensure it's valid and check console.", variant: "destructive" });
      }
    };
    reader.onerror = (e) => {
      console.error("[UserManagement] FileReader error:", e);
      toast({ title: "File Read Error", description: "Could not read the selected file.", variant: "destructive" });
    };
    reader.readAsText(selectedFile);

    setIsImportDialogOpen(false);
    setSelectedFile(null);
  };

  const handleExportUsers = () => {
    if (currentUser.role !== 'admin') {
      toast({ title: "Permission Denied", description: "Only admins can export users.", variant: "destructive"});
      return;
    }
    // For export, use the 'users' state which is already filtered for managers, or full for admins
    const usersToExport = currentUser.role === 'admin' ? samplePlatformUsers : users;

    if (usersToExport.length === 0) {
      toast({ title: "No Users to Export", description: "There are no users to export.", variant: "default" });
      return;
    }
    const csvString = convertToCSV(usersToExport);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: "Export Successful", description: `Exported ${usersToExport.length} users.` });
    } else {
      toast({ title: "Export Failed", description: "Browser does not support file download.", variant: "destructive" });
    }
  };


  if (currentUser.role !== 'admin' && currentUser.role !== 'manager') {
    return <AccessDeniedMessage />;
  }

  return (
    <TooltipProvider>
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <UserCog className="h-8 w-8" /> User Management {currentUser.role === 'manager' && `(Tenant: ${currentUser.tenantId})`}
      </h1>
      <CardDescription>Manage platform users, roles, and statuses.</CardDescription>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search users (name, email, ID)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button onClick={openNewUserDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        <PlusCircle className="mr-2 h-5 w-5" /> Create User
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Manually add a new user to the platform.</p></TooltipContent>
            </Tooltip>
            {currentUser.role === 'admin' && (
              <>
                <Dialog open={isImportDialogOpen} onOpenChange={(isOpen) => {
                  setIsImportDialogOpen(isOpen);
                  if (!isOpen) setSelectedFile(null);
                }}>
                  <DialogTrigger asChild>
                    <Tooltip>
                        <TooltipTrigger asChild>
                           <Button variant="outline">
                                <Upload className="mr-2 h-5 w-5" /> Import Users
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Bulk import users via CSV file.</p></TooltipContent>
                    </Tooltip>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Import Users from CSV</DialogTitle>
                      <CardDescription>Select a CSV file with user data. Expected header (case-insensitive): Name,Email. Optional: Role,Status,TenantID.</CardDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-3">
                      <Label htmlFor="csv-file-upload">CSV File</Label>
                      <Input id="csv-file-upload" type="file" accept=".csv" onChange={handleFileSelect} />
                      {selectedFile && <p className="text-xs text-muted-foreground">Selected: {selectedFile.name}</p>}
                       <p className="text-xs text-muted-foreground">Example CSV format:<br/>
                          <code>Name,Email,Role,Status,TenantID</code><br/>
                          <code>Jane Doe,jane@example.com,user,active,Brainqy</code><br/>
                          <code>John Smith,john@example.com,manager,pending,tenant-2</code>
                       </p>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                      <Button onClick={handleConfirmImport} disabled={!selectedFile} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        Confirm Import
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" onClick={handleExportUsers}>
                            <DownloadCloud className="mr-2 h-5 w-5" /> Export Users
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Download a list of current users in CSV format.</p></TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {selectedUserIds.size > 0 && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{selectedUserIds.size} selected</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Bulk Actions <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => handleBulkAction('activate')}>Activate</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('deactivate')}>Deactivate</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleBulkAction('delete')} className="text-destructive">Delete Selected</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {filteredUsers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No users found matching your criteria.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={selectedUserIds.size === filteredUsers.length && filteredUsers.length > 0 ? true : (selectedUserIds.size > 0 ? "indeterminate" : false)}
                      onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                    />
                  </TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  {currentUser.role === 'admin' && <TableHead>Tenant ID</TableHead>}
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} data-state={selectedUserIds.has(user.id) && "selected"}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUserIds.has(user.id)}
                        onCheckedChange={(checked) => handleSelectRow(user.id, Boolean(checked))}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">{user.id}</TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell><span className="px-2 py-0.5 text-xs bg-accent text-accent-foreground rounded-full capitalize">{user.role}</span></TableCell>
                    <TableCell>
                       <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${
                           user.status === 'active' ? 'bg-green-100 text-green-700' :
                           user.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                           user.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                           user.status === 'suspended' ? 'bg-red-100 text-red-700' : ''
                       }`}>
                           {user.status || 'N/A'}
                       </span>
                    </TableCell>
                    {currentUser.role === 'admin' && <TableCell className="font-mono text-xs">{user.tenantId || 'N/A'}</TableCell>}
                    <TableCell>{user.lastLogin ? format(new Date(user.lastLogin), 'PPp') : 'Never'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openEditUserDialog(user)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isUserDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) { setEditingUser(null); reset(); } setIsUserDialogOpen(isOpen); }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Create New User"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onUserFormSubmit)} className="grid gap-4 py-4">
            <div>
              <Label htmlFor="user-name">Full Name</Label>
              <Controller name="name" control={control} render={({ field }) => <Input id="user-name" {...field} />} />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="user-email">Email Address</Label>
              <Controller name="email" control={control} render={({ field }) => <Input id="user-email" type="email" {...field} />} />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="user-role">Role</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="user-role"><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      {(currentUser.role === 'admin' || currentUser.role === 'manager') && <SelectItem value="manager">Manager</SelectItem>}
                      {currentUser.role === 'admin' && <SelectItem value="admin">Admin</SelectItem>}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && <p className="text-sm text-destructive mt-1">{errors.role.message}</p>}
            </div>
            <div>
              <Label htmlFor="user-status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="user-status"><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message}</p>}
            </div>
            {currentUser.role === 'admin' && (
                <div>
                    <Label htmlFor="user-tenantId">Tenant ID</Label>
                    <Controller name="tenantId" control={control} render={({ field }) => (
                       <Select onValueChange={field.onChange} value={field.value || ""}>
                         <SelectTrigger id="user-tenantId"><SelectValue placeholder="Assign to Tenant (optional)" /></SelectTrigger>
                         <SelectContent>
                           <SelectItem value="">-- No Specific Tenant --</SelectItem>
                           {sampleTenants.map(tenant => (
                             <SelectItem key={tenant.id} value={tenant.id}>{tenant.name} ({tenant.id})</SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                    )} />
                     {errors.tenantId && <p className="text-sm text-destructive mt-1">{errors.tenantId.message}</p>}
                     <p className="text-xs text-muted-foreground mt-1">If no tenant is selected, user will be assigned to default ('{SAMPLE_TENANT_ID}').</p>
                </div>
            )}
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">{editingUser ? "Save Changes" : "Create User"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  );
}

    