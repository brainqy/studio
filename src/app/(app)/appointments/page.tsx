"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, PlusCircle, Video, CheckCircle, Clock } from "lucide-react";
import { sampleAppointments, sampleAlumni } from "@/lib/sample-data";
import type { Appointment } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AppointmentsPage() {
  const { toast } = useToast();

  const getStatusClass = (status: Appointment['status']) => {
    if (status === 'Confirmed') return 'text-green-600 bg-green-100';
    if (status === 'Pending') return 'text-yellow-600 bg-yellow-100';
    if (status === 'Cancelled') return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };
  
  const getAlumniDetails = (name: string) => {
    return sampleAlumni.find(a => a.name === name);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <CalendarDays className="h-8 w-8" /> My Appointments
        </h1>
        <Button onClick={() => toast({ title: "Schedule New (Mock)", description: "This feature is for demonstration."})} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" /> Schedule New
        </Button>
      </div>
      
      <CardDescription>View and manage your scheduled meetings with alumni.</CardDescription>

      {sampleAppointments.length === 0 ? (
        <Card className="text-center py-12 shadow-lg">
          <CardHeader>
            <CalendarDays className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="text-2xl">No Appointments Scheduled</CardTitle>
            <CardDescription>
              Connect with alumni and schedule mentorship sessions or networking calls.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {sampleAppointments.map((appt) => {
            const alumni = getAlumniDetails(appt.withUser);
            return (
            <Card key={appt.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{appt.title}</CardTitle>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(appt.status)}`}>
                    {appt.status === 'Confirmed' && <CheckCircle className="inline h-3 w-3 mr-1"/>}
                    {appt.status === 'Pending' && <Clock className="inline h-3 w-3 mr-1"/>}
                    {appt.status}
                  </span>
                </div>
                {alumni && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={alumni.profilePictureUrl} alt={alumni.name} data-ai-hint="person face"/>
                            <AvatarFallback>{alumni.name.substring(0,1)}</AvatarFallback>
                        </Avatar>
                        <span>With {alumni.name}</span>
                    </div>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground">
                  <strong>Date & Time:</strong> {format(new Date(appt.dateTime), "PPPp")}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  ({formatDistanceToNow(new Date(appt.dateTime), { addSuffix: true })})
                </p>
              </CardContent>
              <CardFooter className="border-t pt-4 mt-auto flex justify-end space-x-2">
                {appt.status === 'Confirmed' && (
                  <Button size="sm" variant="default" onClick={() => toast({title: "Join Meeting (Mock)"})}>
                    <Video className="mr-2 h-4 w-4" /> Join Meeting
                  </Button>
                )}
                {appt.status === 'Pending' && (
                   <Button size="sm" variant="outline" onClick={() => toast({title: "Manage Appointment (Mock)"})}>Manage</Button>
                )}
                 {appt.status !== 'Cancelled' && (
                   <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => toast({title: "Cancel Appointment (Mock)"})}>Cancel</Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
        </div>
      )}
    </div>
  );
}
