
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, PlusCircle, Edit3, Trash2, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tenant } from "@/types"; 
import { useState } from "react";
import { sampleTenants, sampleUserProfile } from "@/lib/sample-data";
import Link from "next/link";

export default function TenantManagementPage() {
  const [tenants, setTenants] = useState<Tenant[]>(sampleTenants);
  const { toast } = useToast();
  const currentUser = sampleUserProfile;

  if (currentUser.role !== 'admin') {
    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
            <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground">You do not have permission to view this page.</p>
            <Button asChild className="mt-6">
                <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
        </div>
    );
  }


  const handleEditTenant = (tenantId: string) => {
    toast({ title: "Action Mocked", description: `Editing tenant ${tenantId}... (This would typically navigate to a detailed tenant settings page or a more complex edit dialog).` });
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
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/admin/tenant-onboarding">
              <PlusCircle className="mr-2 h-5 w-5" /> Create New Tenant
            </Link>
        </Button>
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
