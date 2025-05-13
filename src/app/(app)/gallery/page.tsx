
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { GalleryVerticalEnd, CalendarDays } from "lucide-react";
import { sampleEvents } from "@/lib/sample-data";
import Image from "next/image";

export default function GalleryPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <GalleryVerticalEnd className="h-8 w-8" /> Event Gallery
      </h1>
      <CardDescription>A glimpse into past events and memorable moments from our community.</CardDescription>

      {sampleEvents.length === 0 ? (
        <Card className="text-center py-12 shadow-lg">
          <CardHeader>
            <GalleryVerticalEnd className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="text-2xl">No Events in Gallery</CardTitle>
            <CardDescription>
              Check back later for photos from our past events.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleEvents.map((event) => (
            <Card key={event.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <div className="aspect-video relative w-full">
                {event.imageUrls && event.imageUrls.length > 0 ? (
                  <Image 
                      src={event.imageUrls[0]} 
                      alt={event.title} 
                      layout="fill" 
                      objectFit="cover"
                      data-ai-hint={event.dataAiHint || "event photo"}
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-sm text-muted-foreground">
                    No Image
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{event.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{event.description || "A memorable event."}</p>
              </CardContent>
              <CardFooter className="border-t pt-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CalendarDays className="h-4 w-4"/> {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
