"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Users, Search, Briefcase, GraduationCap, MessageSquare } from "lucide-react";
import { sampleAlumni } from "@/lib/sample-data";
import type { AlumniProfile } from "@/types";
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

// IMPORTANT: Replace with your actual Google Maps API Key
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY_HERE"; 
// For this to work with process.env, you'd need to expose it as NEXT_PUBLIC_ variable in .env.local
// For now, it will use the hardcoded placeholder if not set.

export default function AlumniConnectPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCompany, setSearchCompany] = useState('');
  const [searchSkills, setSearchSkills] = useState('');
  const [filteredAlumni, setFilteredAlumni] = useState<AlumniProfile[]>(sampleAlumni);
  const [selectedAlumnus, setSelectedAlumnus] = useState<AlumniProfile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let results = sampleAlumni;
    if (searchTerm) {
      results = results.filter(alumni => 
        alumni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alumni.currentJobTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (searchCompany) {
      results = results.filter(alumni => alumni.company.toLowerCase().includes(searchCompany.toLowerCase()));
    }
    if (searchSkills) {
      const skillsArray = searchSkills.toLowerCase().split(',').map(skill => skill.trim());
      results = results.filter(alumni => 
        skillsArray.some(skill => alumni.skills.join(', ').toLowerCase().includes(skill))
      );
    }
    setFilteredAlumni(results);
  }, [searchTerm, searchCompany, searchSkills]);

  const handleSendMessage = (alumniName: string) => {
    toast({
      title: "Message Sent (Mock)",
      description: `Your message to ${alumniName} has been sent. This is a mocked feature.`,
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Alumni Connect</h1>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Search className="h-6 w-6 text-primary"/>Search Alumni</CardTitle>
          <CardDescription>Find alumni by name, company, job title, skills, or university.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label htmlFor="search-term">Name or Job Title</Label>
            <Input id="search-term" placeholder="e.g., Alice Wonderland or Product Manager" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="search-company">Company</Label>
            <Input id="search-company" placeholder="e.g., Google" value={searchCompany} onChange={(e) => setSearchCompany(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="search-skills">Skills (comma-separated)</Label>
            <Input id="search-skills" placeholder="e.g., Python, Machine Learning" value={searchSkills} onChange={(e) => setSearchSkills(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-semibold">Search Results ({filteredAlumni.length})</h2>
          {filteredAlumni.length === 0 ? (
            <p className="text-muted-foreground">No alumni found matching your criteria.</p>
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
                    <div className="flex justify-end space-x-2">
                       <Button variant="outline" size="sm" onClick={() => setSelectedAlumnus(alumni)}>
                        <MapPin className="mr-1 h-4 w-4" /> View on Map
                      </Button>
                      <Button variant="default" size="sm" onClick={() => handleSendMessage(alumni.name)}>
                        <MessageSquare className="mr-1 h-4 w-4" /> Message
                      </Button>
                    </div>
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
                      <Pin // background={'#FF0000'}
                       borderColor={'hsl(var(--primary))'} glyphColor={'hsl(var(--primary))'} />
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
