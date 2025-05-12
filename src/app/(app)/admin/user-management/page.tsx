
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { UserCog, PlusCircle, Edit3, Trash2, UploadCloud, DownloadCloud, ChevronDown, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile, UserRole, UserStatus } from "@/types";
import { samplePlatformUsers } from "@/lib/sample-data"; // Using sampleAlumni as mock users
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";

const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(['admin', 'manager', 'user'] as [UserRole, ...UserRole[]]),
  status: z.enum(['active', 'inactive', 'pending', 'suspended'] as [UserStatus, ...UserStatus[]]),
});

type UserFormData = z.infer<typeof userSchema>;

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>(samplePlatformUsers);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const { toast } = useToast();

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase())
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
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...data } : u));
      toast({ title: "User Updated", description: `User "${data.name}" has been updated.` });
    } else {
      const newUser: UserProfile = {
        ...data,
        id: `user-${Date.now()}`,
        tenantId: 'tenant-1', // Default tenant or get from context
        lastLogin: new Date().toISOString(),
        profilePictureUrl: `https://avatar.vercel.sh/${data.email}.png`
      };
      setUsers(prev => [newUser, ...prev]);
      toast({ title: "User Created", description: `User "${data.name}" has been created.` });
    }
    setIsUserDialogOpen(false);
    reset();
    setEditingUser(null);
  };

  const openNewUserDialog = () => {
    setEditingUser(null);
    reset({ name: '', email: '', role: 'user', status: 'pending' });
    setIsUserDialogOpen(true);
  };

  const openEditUserDialog = (user: UserProfile) => {
    setEditingUser(user);
    setValue('name', user.name);
    setValue('email', user.email);
    setValue('role', user.role);
    setValue('status', user.status || 'pending');
    setValue('id', user.id);
    setIsUserDialogOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
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

    switch(action) {
        case 'activate':
            setUsers(users.map(u => selectedUserIds.has(u.id) ? {...u, status: 'active'} : u));
            toast({title: "Users Activated", description: `${selectedUserIds.size} users activated.`});
            break;
        case 'deactivate':
             setUsers(users.map(u => selectedUserIds.has(u.id) ? {...u, status: 'inactive'} : u));
            toast({title: "Users Deactivated", description: `${selectedUserIds.size} users deactivated.`});
            break;
        case 'delete':
            setUsers(users.filter(u => !selectedUserIds.has(u.id)));
            toast({title: "Users Deleted", description: `${selectedUserIds.size} users deleted.`, variant: "destructive"});
            break;
    }
    setSelectedUserIds(new Set());
  };


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <UserCog className="h-8 w-8" /> User Management
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
            <Button onClick={openNewUserDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <PlusCircle className="mr-2 h-5 w-5" /> Create User
            </Button>
            <Button variant="outline" onClick={() => toast({ title: "Mock Action", description: "User upload initiated." })}>
              <UploadCloud className="mr-2 h-5 w-5" /> Upload Users
            </Button>
            <Button variant="outline" onClick={() => toast({ title: "Mock Action", description: "User download initiated." })}>
              <DownloadCloud className="mr-2 h-5 w-5" /> Download Users
            </Button>
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
                      onCheckedChange={(checked) => handleSelectAll(checked)}
                    />
                  </TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
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
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
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
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">{editingUser ? "Save Changes" : "Create User"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
