"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, PlusCircle, Edit3, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tenant } from "@/types"; // Assuming Tenant type exists
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const tenantSchema = z.object({
  name: z.string().min(3, "Tenant name must be at least 3 characters"),
  allowPublicSignup: z.boolean().default(false),
});

type TenantFormData = z.infer<typeof tenantSchema>;

// Sample tenant data - replace with actual data fetching
const initialSampleTenants: Tenant[] = [
  { id: 'tenant-1', name: 'Default University', createdAt: new Date().toISOString(), settings: { allowPublicSignup: true } },
  { id: 'tenant-2', name: 'Corporate Partner Inc.', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), settings: { allowPublicSignup: false } },
];

export default function TenantManagementPage() {
  const [tenants, setTenants] = useState<Tenant[]>(initialSampleTenants);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const { control, handleSubmit, reset, formState: { errors } } = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
    defaultValues: { name: '', allowPublicSignup: false }
  });

  const handleCreateTenantSubmit = (data: TenantFormData) => {
    const newTenant: Tenant = {
      id: `tenant-${Date.now()}`, // Simple ID generation for mock
      name: data.name,
      createdAt: new Date().toISOString(),
      settings: { allowPublicSignup: data.allowPublicSignup },
    };
    setTenants(prev => [newTenant, ...prev]);
    toast({ title: "Tenant Created", description: `Tenant "${data.name}" has been successfully created.` });
    setIsCreateDialogOpen(false);
    reset();
  };

  const handleEditTenant = (tenantId: string) => {
    toast({ title: "Action Mocked", description: `Editing tenant ${tenantId}...` });
  };

  const handleDeleteTenant = (tenantId: string) => {
    setTenants(prev => prev.filter(t => t.id !== tenantId));
    toast({ title: "Tenant Deleted", description: `Tenant ${tenantId} deleted.`, variant: "destructive" });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Building2 className="h-8 w-8" /> Tenant Management
        </h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <PlusCircle className="mr-2 h-5 w-5" /> Create New Tenant
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Tenant</DialogTitle>
              <CardDescription>Enter the details for the new tenant.</CardDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleCreateTenantSubmit)} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tenant-name" className="text-right">
                  Name
                </Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => <Input id="tenant-name" {...field} className="col-span-3" />}
                />
                {errors.name && <p className="text-sm text-destructive col-start-2 col-span-3">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="allow-public-signup" className="text-right col-span-3">
                  Allow Public Signup?
                </Label>
                 <Controller
                  name="allowPublicSignup"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="allow-public-signup"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="col-span-1 justify-self-center"
                    />
                  )}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Create Tenant</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <CardDescription>Oversee and manage all tenants within the platform.</CardDescription>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Tenant List</CardTitle>
        </CardHeader>
        <CardContent>
          {tenants.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No tenants found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant Name</TableHead>
                  <TableHead>Tenant ID</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Public Signup</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">{tenant.name}</TableCell>
                    <TableCell>{tenant.id}</TableCell>
                    <TableCell>{new Date(tenant.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{tenant.settings?.allowPublicSignup ? 'Enabled' : 'Disabled'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditTenant(tenant.id)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteTenant(tenant.id)}>
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
    </div>
  );
}
