"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, PlusCircle, Edit3, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tenant } from "@/types"; // Assuming Tenant type exists

// Sample tenant data - replace with actual data fetching
const sampleTenants: Tenant[] = [
  { id: 'tenant-1', name: 'Default University', createdAt: new Date().toISOString(), settings: { allowPublicSignup: true } },
  { id: 'tenant-2', name: 'Corporate Partner Inc.', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), settings: { allowPublicSignup: false } },
];

export default function TenantManagementPage() {
  const { toast } = useToast();

  // Placeholder functions for actions
  const handleCreateTenant = () => {
    toast({ title: "Action Mocked", description: "Creating a new tenant..." });
  };

  const handleEditTenant = (tenantId: string) => {
    toast({ title: "Action Mocked", description: `Editing tenant ${tenantId}...` });
  };

  const handleDeleteTenant = (tenantId: string) => {
    toast({ title: "Action Mocked", description: `Deleting tenant ${tenantId}...`, variant: "destructive" });
  };


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Building2 className="h-8 w-8" /> Tenant Management
        </h1>
        <Button onClick={handleCreateTenant} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" /> Create New Tenant
        </Button>
      </div>
      <CardDescription>Oversee and manage all tenants within the platform.</CardDescription>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Tenant List</CardTitle>
        </CardHeader>
        <CardContent>
          {sampleTenants.length === 0 ? (
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
                {sampleTenants.map((tenant) => (
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
