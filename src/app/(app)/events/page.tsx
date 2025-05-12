
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, CalendarCheck2, MapPin, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import type { GalleryEvent } from "@/types"; // Using GalleryEvent type for structure

const SAMPLE_TENANT_ID = 'tenant-1'; // Assuming a default tenant

const sampleEvents: GalleryEvent[] = [ // Using GalleryEvent which now includes tenantId
  {
    id: 'event101',
    tenantId: SAMPLE_TENANT_ID,
    title: 'Alumni Networking Night Fall 2024',
    date: '2024-10-25T18:00:00',
    location: 'Grand Ballroom, University Center',
    description: 'Join us for an evening of networking, reconnecting with old friends, and making new connections. Hors d\'oeuvres and refreshments will be served.',
    imageUrl: 'https://picsum.photos/seed/networkevent/600/300',
    dataAiHint: "networking event people",
    // Add status and capacity if needed in GalleryEvent type or extend it
    // status: 'upcoming' as 'upcoming' | 'past' | 'full',
    // attendees: 120,
    // capacity: 200,
  },
  {
    id: 'event102',
    tenantId: SAMPLE_TENANT_ID,
    title: 'Tech Trends Workshop: AI & The Future of Work',
    date: '2024-11-15T14:00:00',
    location: 'Online (Zoom Webinar)',
    description: 'Explore the latest advancements in AI and how they are shaping the future of various industries. Led by industry experts and distinguished alumni.',
    imageUrl: 'https://picsum.photos/seed/techevent/600/300',
    dataAiHint: "tech workshop computer",
    // status: 'upcoming' as 'upcoming' | 'past' | 'full',
    // attendees: 85,
    // capacity: 100,
  },
    {
    id: 'event103',
    tenantId: SAMPLE_TENANT_ID,
    title: 'Annual Charity Gala',
    date: '2024-05-10T19:00:00',
    location: 'The Regent Hotel',
    description: 'A look back at our successful annual charity gala. Thank you to all attendees and sponsors!',
    imageUrl: 'https://picsum.photos/seed/galaevent/600/300',
    dataAiHint: "gala dinner formal",
    // status: 'past' as 'upcoming' | 'past' | 'full',
    // attendees: 250,
    // capacity: 250,
  }
];

// Extend GalleryEvent for this page's specific needs
interface RegistrableEvent extends GalleryEvent {
    status: 'upcoming' | 'past' | 'full';
    attendees: number;
    capacity: number;
}

// Add status, attendees, capacity back to sample data for display logic
const displayEvents: RegistrableEvent[] = sampleEvents.map((event, index) => ({
    ...event,
    // Assigning sample status/capacity based on index for variety
    status: index === 2 ? 'past' : (index === 1 ? 'upcoming' : 'upcoming'),
    attendees: index === 2 ? 250 : (index === 1 ? 98 : 120),
    capacity: index === 2 ? 250 : (index === 1 ? 100 : 200),
}));


export default function EventsPage() {
  const { toast } = useToast();

  const handleRegister = (eventId: string, eventTitle: string) => {
    toast({ title: "Registration Successful (Mock)", description: `You have registered for ${eventTitle}. Check your email for confirmation.`});
    // In a real app, update registration status, likely filtered by tenant
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <CalendarCheck2 className="h-8 w-8" /> Events Registration
      </h1>
      <CardDescription>Discover and register for upcoming alumni events, workshops, and gatherings within your network.</CardDescription>

      {displayEvents.length === 0 ? (
        <Card className="text-center py-12 shadow-lg">
          <CardHeader>
            <CalendarCheck2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="text-2xl">No Upcoming Events</CardTitle>
            <CardDescription>
              Please check back soon for new event announcements for your tenant.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {displayEvents.map((event) => (
            <Card key={event.id} className={`shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col ${event.status === 'past' ? 'opacity-70' : ''}`}>
              <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                <Image
                    src={event.imageUrl}
                    alt={event.title}
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint={event.dataAiHint}
                />
                {event.status === 'past' && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-xl font-bold transform -rotate-12 border-2 border-white p-2">PAST EVENT</span>
                    </div>
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-xl">{event.title}</CardTitle>
                <CardDescription className="flex items-center gap-1 text-sm">
                  <CalendarCheck2 className="h-4 w-4" /> {new Date(event.date).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
                </CardDescription>
                {/* Location might not always be present in GalleryEvent, handle optional */}
                {event.location && (
                    <CardDescription className="flex items-center gap-1 text-sm">
                        <MapPin className="h-4 w-4" /> {event.location}
                    </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>
              </CardContent>
              <CardFooter className="border-t pt-4 mt-auto flex justify-between items-center">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {event.attendees < event.capacity ? (
                    <span>{event.capacity - event.attendees} seats available</span>
                  ) : (
                    <span>Event Full</span>
                  )}
                  <span className="text-xs">({event.attendees}/{event.capacity})</span>
                </div>
                {event.status === 'upcoming' && event.attendees < event.capacity && (
                  <Button size="sm" onClick={() => handleRegister(event.id, event.title)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Ticket className="mr-2 h-4 w-4" /> Register Now
                  </Button>
                )}
                {event.status === 'upcoming' && event.attendees >= event.capacity && (
                  <Button size="sm" disabled variant="outline">
                    Event Full
                  </Button>
                )}
                 {event.status === 'past' && (
                  <Button size="sm" variant="ghost" disabled>
                    View Details
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

