tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Users, Search, Briefcase, GraduationCap, MessageSquare, Eye, CalendarPlus, Coins, Filter as FilterIcon } from "lucide-react";
import { sampleAlumni } from "@/lib/sample-data";
import type { AlumniProfile } from "@/types";
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import Link from 'next/link'; // Added for View Profile

// IMPORTANT: Replace with your actual Google Maps API Key
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY_HERE"; 

export default function AlumniConnectPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAlumni, setFilteredAlumni] = useState<AlumniProfile[]>(sampleAlumni);
  const [selectedAlumnus, setSelectedAlumnus] = useState<AlumniProfile | null>(null);
  const { toast } = useToast();

  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [selectedUniversities, setSelectedUniversities] = useState<Set<string>>(new Set());

  const uniqueCompanies = useMemo(() => Array.from(new Set(sampleAlumni.map(a => a.company))).sort(), []);
  const uniqueSkills = useMemo(() => Array.from(new Set(sampleAlumni.flatMap(a => a.skills))).sort(), []);
  const uniqueUniversities = useMemo(() => Array.from(new Set(sampleAlumni.map(a => a.university))).sort(), []);

  useEffect(() => {
    let results = sampleAlumni;
    if (searchTerm) {
      results = results.filter(alumni => 
        alumni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alumni.currentJobTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCompanies.size > 0) {
      results = results.filter(alumni => selectedCompanies.has(alumni.company));
    }
    if (selectedSkills.size > 0) {
      results = results.filter(alumni => alumni.skills.some(skill => selectedSkills.has(skill)));
    }
    if (selectedUniversities.size > 0) {
      results = results.filter(alumni => selectedUniversities.has(alumni.university));
    }
    setFilteredAlumni(results);
  }, [searchTerm, selectedCompanies, selectedSkills, selectedUniversities]);

  const handleFilterChange = (filterSet: Set<string>, item: string, setter: React.Dispatch<React.SetStateAction<Set<string>>>) => {
    const newSet = new Set(filterSet);
    if (newSet.has(item)) {
      newSet.delete(item);
    } else {
      newSet.add(item);
    }
    setter(newSet);
  };

  const handleSendMessage = (alumniName: string) => {
    toast({
      title: "Message Sent (Mock)",
      description: `Your message to ${alumniName} has been sent. This is a mocked feature.`,
    });
  };

  const handleBookAppointment = (alumniName: string) => {
    toast({
      title: "Coins Deducted (Mock)",
      description: "10 coins deducted from your wallet.",
    });
    toast({
      title: "Appointment Booked (Mock)",
      description: `Appointment with ${alumniName} booked. This is a mocked feature.`,
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Alumni Connect</h1>
      </div>

      <Accordion type="single" collapsible className="w-full bg-card shadow-lg rounded-lg">
        <AccordionItem value="filters">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <FilterIcon className="h-5 w-5" /> Filters
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
              <div className="space-y-1">
                <Label htmlFor="search-term">Name or Job Title</Label>
                <Input id="search-term" placeholder="e.g., Alice Wonderland" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div>
                <h4 className="font-medium mb-2">Company</h4>
                <ScrollArea className="h-40 pr-3">
                  <div className="space-y-2">
                    {uniqueCompanies.map(company => (
                      <div key={company} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`comp-${company}`} 
                          checked={selectedCompanies.has(company)}
                          onCheckedChange={() => handleFilterChange(selectedCompanies, company, setSelectedCompanies)}
                        />
                        <Label htmlFor={`comp-${company}`} className="font-normal">{company}</Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              <div>
                <h4 className="font-medium mb-2">Skills</h4>
                <ScrollArea className="h-40 pr-3">
                  <div className="space-y-2">
                    {uniqueSkills.map(skill => (
                      <div key={skill} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`skill-${skill}`} 
                          checked={selectedSkills.has(skill)}
                          onCheckedChange={() => handleFilterChange(selectedSkills, skill, setSelectedSkills)}
                        />
                        <Label htmlFor={`skill-${skill}`} className="font-normal">{skill}</Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              <div>
                <h4 className="font-medium mb-2">University</h4>
                <ScrollArea className="h-40 pr-3">
                  <div className="space-y-2">
                    {uniqueUniversities.map(uni => (
                      <div key={uni} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`uni-${uni}`} 
                          checked={selectedUniversities.has(uni)}
                          onCheckedChange={() => handleFilterChange(selectedUniversities, uni, setSelectedUniversities)}
                        />
                        <Label htmlFor={`uni-${uni}`} className="font-normal">{uni}</Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-semibold">Search Results ({filteredAlumni.length})</h2>
          {filteredAlumni.length === 0 ? (
            <Card className="text-center py-12 shadow-md">
                <CardHeader>
                    <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <CardTitle className="text-2xl">No Alumni Found</CardTitle>
                    <CardDescription>
                    Try adjusting your search or filter criteria.
                    </CardDescription>
                </CardHeader>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAlumni.map(alumni => (
                <Card key={alumni.id} className="shadow-md hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={alumni.profilePictureUrl} alt={alumni.name} data-ai-hint="person portrait" />
                        <AvatarFallback>{alumni.name.substring(0,1).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{alumni.name}</h3>
                        <p className="text-sm text-primary">{alumni.currentJobTitle}</p>
                        <p className="text-sm text-muted-foreground">{alumni.company}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1 line-clamp-2">{alumni.shortBio}</p>
                    <p className="text-xs text-muted-foreground mb-3"><GraduationCap className="inline h-3 w-3 mr-1"/>{alumni.university}</p>
                    <div className="mb-3">
                      <h4 className="text-xs font-semibold mb-1">Skills:</h4>
                      <div className="flex flex-wrap gap-1">
                        {alumni.skills.slice(0,3).map(skill => (
                          <span key={skill} className="px-2 py-0.5 text-xs bg-accent text-accent-foreground rounded-full">{skill}</span>
                        ))}
                        {alumni.skills.length > 3 && <span className="px-2 py-0.5 text-xs bg-accent text-accent-foreground rounded-full">+{alumni.skills.length - 3} more</span>}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedAlumnus(alumni)}>
                        <MapPin className="mr-1 h-4 w-4" /> Map
                      </Button>
                       <Button variant="outline" size="sm" onClick={() => toast({ title: "View Profile (Mock)", description: `Viewing profile of ${alumni.name}. This feature is for demonstration.`})}>
                        <Eye className="mr-1 h-4 w-4" /> View Profile
                      </Button>
                       <Button variant="default" size="sm" onClick={() => handleSendMessage(alumni.name)}>
                        <MessageSquare className="mr-1 h-4 w-4" /> Message
                      </Button>
                    </div>
                    <Button 
                        variant="default" 
                        size="sm" 
                        className="w-full mt-3 bg-primary hover:bg-primary/90"
                        onClick={() => handleBookAppointment(alumni.name)}
                      >
                        <CalendarPlus className="mr-1 h-4 w-4" /> Book Appointment <Coins className="ml-1 mr-0.5 h-3 w-3" /> (10 Coins)
                      </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        <Card className="lg:col-span-1 shadow-lg h-[400px] md:h-[500px] lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MapPin className="h-6 w-6 text-primary"/>Alumni Locations</CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-4rem)] p-0">
            {GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY_HERE" ? (
              <div className="flex items-center justify-center h-full bg-muted rounded-b-lg">
                <p className="text-center text-muted-foreground p-4">
                  Google Maps API Key not configured. <br/>Please set <code className="bg-secondary p-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in your <code className="bg-secondary p-1 rounded">.env.local</code> file.
                </p>
              </div>
            ) : (
              <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                <Map
                  defaultCenter={{ lat: 39.8283, lng: -98.5795 }} // Centered on US
                  defaultZoom={4}
                  gestureHandling={'greedy'}
                  disableDefaultUI={true}
                  mapId="resumematch_alumni_map"
                  className="rounded-b-lg"
                >
                  {filteredAlumni.map((alumni) => (
                    <AdvancedMarker
                      key={alumni.id}
                      position={alumni.location}
                      onClick={() => setSelectedAlumnus(alumni)}
                    >
                      <Pin borderColor={'hsl(var(--primary))'} glyphColor={'hsl(var(--primary))'} />
                    </AdvancedMarker>
                  ))}
                  {selectedAlumnus && (
                    <InfoWindow
                      position={selectedAlumnus.location}
                      onCloseClick={() => setSelectedAlumnus(null)}
                      minWidth={200}
                    >
                      <div className="p-1">
                        <div className="flex items-center gap-2 mb-1">
                           <Avatar className="h-8 w-8">
                            <AvatarImage src={selectedAlumnus.profilePictureUrl} alt={selectedAlumnus.name} data-ai-hint="person face" />
                            <AvatarFallback>{selectedAlumnus.name.substring(0,1).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-sm">{selectedAlumnus.name}</h4>
                            <p className="text-xs text-primary">{selectedAlumnus.currentJobTitle}</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{selectedAlumnus.company}</p>
                      </div>
                    </InfoWindow>
                  )}
                </Map>
              </APIProvider>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
