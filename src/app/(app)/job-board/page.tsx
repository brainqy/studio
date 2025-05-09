tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Aperture, Briefcase, Users, MapPin, Building, CalendarDays, Search, Filter as FilterIcon } from "lucide-react";
import { sampleJobOpenings, sampleAlumni } from "@/lib/sample-data";
import type { JobOpening } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const jobOpeningSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.enum(['Full-time', 'Part-time', 'Internship', 'Contract', 'Mentorship']),
});

type JobOpeningFormData = z.infer<typeof jobOpeningSchema>;

const JOB_TYPES: JobOpening['type'][] = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Mentorship'];

export default function JobBoardPage() {
  const [openings, setOpenings] = useState<JobOpening[]>(sampleJobOpenings);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobTypes, setSelectedJobTypes] = useState<Set<JobOpening['type']>>(new Set());
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(new Set());
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());
  
  const { toast } = useToast();
  const { control, handleSubmit, reset, formState: { errors } } = useForm<JobOpeningFormData>({
    resolver: zodResolver(jobOpeningSchema),
    defaultValues: { type: 'Full-time' }
  });

  const currentAlumniUser = sampleAlumni[0]; 

  const uniqueLocations = useMemo(() => {
    const locations = new Set(sampleJobOpenings.map(op => op.location));
    return Array.from(locations).sort();
  }, []);

  const uniqueCompanies = useMemo(() => {
    const companies = new Set(sampleJobOpenings.map(op => op.company));
    return Array.from(companies).sort();
  }, []);

  const filteredOpenings = useMemo(() => {
    return openings.filter(opening => {
      const matchesSearchTerm = searchTerm === '' || opening.title.toLowerCase().includes(searchTerm.toLowerCase()) || opening.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesJobType = selectedJobTypes.size === 0 || selectedJobTypes.has(opening.type);
      const matchesLocation = selectedLocations.size === 0 || selectedLocations.has(opening.location);
      const matchesCompany = selectedCompanies.size === 0 || selectedCompanies.has(opening.company);
      return matchesSearchTerm && matchesJobType && matchesLocation && matchesCompany;
    });
  }, [openings, searchTerm, selectedJobTypes, selectedLocations, selectedCompanies]);

  const handleFilterChange = (filterSet: Set<string>, item: string, setter: React.Dispatch<React.SetStateAction<Set<string>>>) => {
    const newSet = new Set(filterSet);
    if (newSet.has(item)) {
      newSet.delete(item);
    } else {
      newSet.add(item);
    }
    setter(newSet);
  };

  const onPostSubmit = (data: JobOpeningFormData) => {
    const newOpening: JobOpening = {
      ...data,
      id: String(Date.now()),
      datePosted: new Date().toISOString().split('T')[0],
      postedByAlumniId: currentAlumniUser.id,
      alumniName: currentAlumniUser.name,
    };
    setOpenings(prev => [newOpening, ...prev]);
    // Add new locations/companies to filter options if they don't exist
    toast({ title: "Opportunity Posted", description: `${data.title} at ${data.company} has been posted.` });
    setIsPostDialogOpen(false);
    reset();
  };
  
  const openNewPostDialog = () => {
    reset({ title: '', company: '', location: '', description: '', type: 'Full-time' });
    setIsPostDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Briefcase className="h-8 w-8" /> Job Board
          </h1>
          <CardDescription>Find job opportunities shared within the alumni network.</CardDescription>
        </div>
        <div className="relative w-full md:w-auto md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search jobs..." 
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={openNewPostDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full md:w-auto">
          <PlusCircle className="mr-2 h-5 w-5" /> Post Opportunity
        </Button>
      </div>

      <Accordion type="single" collapsible className="w-full bg-card shadow-lg rounded-lg">
        <AccordionItem value="filters">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <FilterIcon className="h-5 w-5" /> Filters
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div>
                <h4 className="font-medium mb-2">Job Type</h4>
                <ScrollArea className="h-40 pr-3">
                  <div className="space-y-2">
                    {JOB_TYPES.map(type => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`type-${type}`} 
                          checked={selectedJobTypes.has(type)}
                          onCheckedChange={() => handleFilterChange(selectedJobTypes, type, setSelectedJobTypes as React.Dispatch<React.SetStateAction<Set<string>>>)}
                        />
                        <Label htmlFor={`type-${type}`} className="font-normal">{type}</Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              <div>
                <h4 className="font-medium mb-2">Location</h4>
                <ScrollArea className="h-40 pr-3">
                  <div className="space-y-2">
                    {uniqueLocations.map(location => (
                      <div key={location} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`loc-${location}`} 
                          checked={selectedLocations.has(location)}
                          onCheckedChange={() => handleFilterChange(selectedLocations, location, setSelectedLocations)}
                        />
                        <Label htmlFor={`loc-${location}`} className="font-normal">{location}</Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
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
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Post New Opportunity</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onPostSubmit)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="post-title">Title</Label>
              <Controller name="title" control={control} render={({ field }) => <Input id="post-title" {...field} />} />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="post-company">Company / Organization</Label>
              <Controller name="company" control={control} render={({ field }) => <Input id="post-company" {...field} />} />
              {errors.company && <p className="text-sm text-destructive mt-1">{errors.company.message}</p>}
            </div>
            <div>
              <Label htmlFor="post-location">Location</Label>
              <Controller name="location" control={control} render={({ field }) => <Input id="post-location" {...field} />} />
              {errors.location && <p className="text-sm text-destructive mt-1">{errors.location.message}</p>}
            </div>
            <div>
              <Label htmlFor="post-type">Type</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {JOB_TYPES.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && <p className="text-sm text-destructive mt-1">{errors.type.message}</p>}
            </div>
            <div>
              <Label htmlFor="post-description">Description</Label>
              <Controller name="description" control={control} render={({ field }) => <Textarea id="post-description" rows={5} {...field} />} />
              {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Post Opportunity</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {filteredOpenings.length === 0 ? (
        <Card className="text-center py-12 shadow-lg">
          <CardHeader>
            <Aperture className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="text-2xl">No Opportunities Found</CardTitle>
            <CardDescription>Try adjusting your search or filters, or be the first to post an opportunity!</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredOpenings.map((opening) => {
            const postingAlumni = sampleAlumni.find(a => a.id === opening.postedByAlumniId);
            return (
            <Card key={opening.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                   <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      opening.type === 'Mentorship' ? 'bg-purple-100 text-purple-700' :
                      opening.type === 'Internship' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {opening.type}
                    </span>
                    {postingAlumni && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Avatar className="h-5 w-5">
                                <AvatarImage src={postingAlumni.profilePictureUrl} alt={postingAlumni.name} data-ai-hint="person face"/>
                                <AvatarFallback>{postingAlumni.name.substring(0,1)}</AvatarFallback>
                            </Avatar>
                            <span>{postingAlumni.name}</span>
                        </div>
                    )}
                </div>
                <CardTitle className="text-xl">{opening.title}</CardTitle>
                <div className="text-sm text-muted-foreground flex flex-col gap-1">
                    <span className="flex items-center gap-1"><Building className="h-4 w-4"/> {opening.company}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4"/> {opening.location}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-4">
                  {opening.description}
                </p>
              </CardContent>
              <CardFooter className="border-t pt-4 mt-auto flex justify-between items-center">
                 <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" /> Posted: {new Date(opening.datePosted).toLocaleDateString()}
                </p>
                <Button size="sm" variant="default" onClick={() => toast({title: "Apply (Mocked)", description: `You showed interest in ${opening.title}.`})}>
                  {opening.type === 'Mentorship' ? 'Express Interest' : 'Apply Now'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
        </div>
      )}
    </div>
  );
}
