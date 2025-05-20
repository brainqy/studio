
"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { User, Mail, Briefcase, Sparkles, Upload, Save, CalendarDays, Users, HelpCircle, CheckSquare, Settings as SettingsIcon, Phone, MapPin, GraduationCap, Building, LinkIcon, Brain, Handshake, Clock, MessageCircle, Info, CheckCircle as CheckCircleIcon, XCircle, Edit3, Loader2, ThumbsUp, PlusCircle as PlusCircleIcon } from "lucide-react";
import { sampleUserProfile, graduationYears, sampleTenants } from "@/lib/sample-data";
import type { UserProfile, Gender, DegreeProgram, Industry, SupportArea, TimeCommitment, EngagementMode, SupportTypeSought } from "@/types";
import { DegreePrograms, Industries, AreasOfSupport as AreasOfSupportOptions, TimeCommitments, EngagementModes, SupportTypesSought as SupportTypesSoughtOptions } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as DialogUIDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { suggestDynamicSkills, type SuggestDynamicSkillsInput, type SuggestDynamicSkillsOutput } from '@/ai/flows/suggest-dynamic-skills';
import { useTranslations, useLocale } from 'next-intl';

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  dateOfBirth: z.date().optional(),
  gender: z.enum(['Male', 'Female', 'Prefer not to say']).optional(),
  mobileNumber: z.string().optional(),
  currentAddress: z.string().optional(),
  
  graduationYear: z.string().optional(),
  degreeProgram: z.string().optional(), 
  department: z.string().optional(),
  
  currentJobTitle: z.string().optional(),
  currentOrganization: z.string().optional(),
  industry: z.string().optional(), 
  workLocation: z.string().optional(),
  linkedInProfile: z.string().url("Invalid URL").optional().or(z.literal('')),
  yearsOfExperience: z.string().optional(),
  
  skills: z.string().optional(), 
  
  areasOfSupport: z.array(z.string()).optional(), 
  timeCommitment: z.string().optional(), 
  preferredEngagementMode: z.string().optional(), 
  otherComments: z.string().optional(),
  
  lookingForSupportType: z.string().optional(), 
  helpNeededDescription: z.string().optional(),
  
  shareProfileConsent: z.boolean().optional(),
  featureInSpotlightConsent: z.boolean().optional(),

  profilePictureUrl: z.string().url("Invalid URL").optional().or(z.literal('')),
  resumeText: z.string().optional(),
  careerInterests: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type SuggestedSkill = SuggestDynamicSkillsOutput['suggestedSkills'][0];

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile>(sampleUserProfile);
  const [isEditing, setIsEditing] = useState(false); 
  const [suggestedSkills, setSuggestedSkills] = useState<SuggestedSkill[] | null>(null);
  const [isSkillsLoading, setIsSkillsLoading] = useState(false);
  const [isProfileSavedDialogOpen, setIsProfileSavedDialogOpen] = useState(false);
  const { toast } = useToast();
  const t = useTranslations('ProfilePage');
  const locale = useLocale();

  const { control, handleSubmit, watch, reset, setValue, formState: { errors, isDirty } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: userProfile.name,
      email: userProfile.email,
      dateOfBirth: userProfile.dateOfBirth ? new Date(userProfile.dateOfBirth) : undefined,
      gender: userProfile.gender,
      mobileNumber: userProfile.mobileNumber || '',
      currentAddress: userProfile.currentAddress || '',
      graduationYear: userProfile.graduationYear || '',
      degreeProgram: userProfile.degreeProgram || '',
      department: userProfile.department || '',
      currentJobTitle: userProfile.currentJobTitle || '',
      currentOrganization: userProfile.currentOrganization || '',
      industry: userProfile.industry || '',
      workLocation: userProfile.workLocation || '',
      linkedInProfile: userProfile.linkedInProfile || '',
      yearsOfExperience: userProfile.yearsOfExperience || '',
      skills: userProfile.skills?.join(', ') || '',
      areasOfSupport: userProfile.areasOfSupport || [],
      timeCommitment: userProfile.timeCommitment,
      preferredEngagementMode: userProfile.preferredEngagementMode,
      otherComments: userProfile.otherComments || '',
      lookingForSupportType: userProfile.lookingForSupportType,
      helpNeededDescription: userProfile.helpNeededDescription || '',
      shareProfileConsent: userProfile.shareProfileConsent ?? true,
      featureInSpotlightConsent: userProfile.featureInSpotlightConsent ?? false,
      profilePictureUrl: userProfile.profilePictureUrl || '',
      resumeText: userProfile.resumeText || '',
      careerInterests: userProfile.careerInterests || '',
      bio: userProfile.bio || '',
    }
  });
  
  useEffect(() => {
    reset({
      ...sampleUserProfile,
      dateOfBirth: sampleUserProfile.dateOfBirth ? new Date(sampleUserProfile.dateOfBirth) : undefined,
      skills: sampleUserProfile.skills?.join(', ') || '',
      areasOfSupport: sampleUserProfile.areasOfSupport || [],
      shareProfileConsent: sampleUserProfile.shareProfileConsent ?? true,
      featureInSpotlightConsent: sampleUserProfile.featureInSpotlightConsent ?? false,
    });
  }, [sampleUserProfile, reset]);


  const watchedFields = watch();

  const calculateProfileCompletion = () => {
    const fieldsToCheck = [
      watchedFields.name, watchedFields.email, watchedFields.dateOfBirth, watchedFields.gender,
      watchedFields.mobileNumber, watchedFields.currentAddress, watchedFields.graduationYear,
      watchedFields.degreeProgram, watchedFields.department, watchedFields.currentJobTitle,
      watchedFields.currentOrganization, watchedFields.industry, watchedFields.workLocation,
      watchedFields.linkedInProfile, watchedFields.yearsOfExperience, watchedFields.skills,
      watchedFields.profilePictureUrl, watchedFields.resumeText, watchedFields.careerInterests, watchedFields.bio,
      watchedFields.areasOfSupport && watchedFields.areasOfSupport.length > 0, 
      watchedFields.timeCommitment, watchedFields.preferredEngagementMode
    ];
    const filledFields = fieldsToCheck.filter(field => {
      if (typeof field === 'boolean') return true; 
      if (field instanceof Date) return true;
      return field && String(field).trim() !== '';
    }).length;
    return Math.round((filledFields / fieldsToCheck.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  const onSubmit = (data: ProfileFormData) => {
    const updatedProfileData: UserProfile = {
      ...userProfile, 
      ...data,
      dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toISOString().split('T')[0] : undefined,
      skills: data.skills ? data.skills.split(',').map(s => s.trim()).filter(s => s) : [],
      areasOfSupport: data.areasOfSupport || [],
    };
    setUserProfile(updatedProfileData);

    if (sampleUserProfile.id === updatedProfileData.id) {
        Object.assign(sampleUserProfile, updatedProfileData);
    }
    setIsEditing(false); 
    console.log("Updated Profile Data (mock):", updatedProfileData);
    setIsProfileSavedDialogOpen(true); // Open success dialog
    // toast({ title: t('profileUpdatedTitle'), description: t('profileUpdatedDesc') }); // Toast can be secondary or removed
  };
  
  const renderSectionHeader = (titleKey: string, icon: React.ElementType, tooltipTextKey?: string) => {
    const IconComponent = icon;
    const title = t(titleKey as any); // Use type assertion for now
    const tooltipText = tooltipTextKey ? t(tooltipTextKey as any) : undefined;

    return (
      <>
        <Separator className="my-6" />
        <div className="flex items-center gap-2 mb-4">
          <IconComponent className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">{title}</h2>
          {tooltipText && (
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{tooltipText}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </>
    );
  }

  const handleGetSkillSuggestions = async () => {
    setIsSkillsLoading(true);
    setSuggestedSkills(null);
    try {
      const currentSkills = watchedFields.skills?.split(',').map(s => s.trim()).filter(s => s) || [];
      const contextText = `${watchedFields.bio || ''} ${watchedFields.careerInterests || ''} ${watchedFields.currentJobTitle || ''} ${watchedFields.industry || ''}`.trim();
      if (!contextText) {
        toast({ title: t('skillSuggestError.noInfoTitle'), description: t('skillSuggestError.noInfoDesc'), variant: "destructive" });
        setIsSkillsLoading(false);
        return;
      }
      const input: SuggestDynamicSkillsInput = {
        currentSkills,
        contextText,
      };
      const result = await suggestDynamicSkills(input);
      setSuggestedSkills(result.suggestedSkills);
      toast({ title: t('skillSuggestSuccess.title'), description: t('skillSuggestSuccess.desc') });
    } catch (error) {
      console.error("Skill suggestion error:", error);
      toast({ title: t('skillSuggestError.fetchFailTitle'), description: t('skillSuggestError.fetchFailDesc'), variant: "destructive" });
    } finally {
      setIsSkillsLoading(false);
    }
  };

  const handleAddSuggestedSkill = (skill: string) => {
    const currentSkillsValue = watchedFields.skills || "";
    const skillsArray = currentSkillsValue.split(',').map(s => s.trim()).filter(s => s);
    if (!skillsArray.includes(skill)) {
        const newSkillsString = [...skillsArray, skill].join(', ');
        setValue('skills', newSkillsString, { shouldDirty: true });
        toast({title: t('skillAddSuccess.title'), description: t('skillAddSuccess.desc', { skillName: skill })});
    } else {
        toast({title: t('skillAddError.existsTitle'), description: t('skillAddError.existsDesc', { skillName: skill }), variant: "default"});
    }
  };


  return (
    <div className="space-y-8">
    <TooltipProvider>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('title')}</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline">
            <Edit3 className="mr-2 h-4 w-4" /> {t('editButton')}
          </Button>
        )}
      </div>


      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary"/>{t('completionCard.title')}
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('completionCard.tooltip')}</p>
              </TooltipContent>
            </Tooltip>
            </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={profileCompletion} className="w-full h-3 [&>div]:bg-primary" />
          <p className="text-sm text-muted-foreground mt-2 text-center">{t('completionCard.progressText', { percentage: profileCompletion })}</p>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={!isEditing} className="space-y-6"> 
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-2 border-primary">
                    <AvatarImage src={watchedFields.profilePictureUrl || "https://picsum.photos/seed/defaultavatar/200/200"} alt={userProfile.name} data-ai-hint="person portrait"/>
                    <AvatarFallback className="text-3xl">{userProfile.name?.substring(0,1).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <>
                    <label htmlFor="avatarUpload" className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                      <Upload className="h-8 w-8" />
                    </label>
                    <input type="file" id="avatarUpload" className="hidden" accept="image/*" onChange={() => toast({title: t('avatarUpload.title'), description: t('avatarUpload.desc')})}/>
                    </>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <CardTitle className="text-2xl">{watchedFields.name || "User Name"}</CardTitle>
                  <CardDescription>{watchedFields.email || "user@example.com"}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderSectionHeader("sections.personal.title", User)}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <Label htmlFor="name">{t('sections.personal.fullNameLabel')}</Label>
                  <Controller name="name" control={control} render={({ field }) => <Input id="name" {...field} />} />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">{t('sections.personal.emailLabel')}</Label>
                  <Controller name="email" control={control} render={({ field }) => <Input id="email" type="email" {...field} />} />
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dateOfBirth">{t('sections.personal.dobLabel')}</Label>
                  <Controller name="dateOfBirth" control={control} render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />} />
                  {errors.dateOfBirth && <p className="text-sm text-destructive mt-1">{errors.dateOfBirth.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="gender">{t('sections.personal.genderLabel')}</Label>
                  <Controller name="gender" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="gender"><SelectValue placeholder={t('sections.personal.genderPlaceholder')} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">{t('genderOptions.male')}</SelectItem>
                        <SelectItem value="Female">{t('genderOptions.female')}</SelectItem>
                        <SelectItem value="Prefer not to say">{t('genderOptions.preferNotToSay')}</SelectItem>
                      </SelectContent>
                    </Select>
                  )} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="mobileNumber" className="flex items-center gap-1"><Phone className="h-4 w-4 text-muted-foreground"/>{t('sections.personal.mobileLabel')}</Label>
                  <Controller name="mobileNumber" control={control} render={({ field }) => <Input id="mobileNumber" placeholder={t('sections.personal.mobilePlaceholder')} {...field} />} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="currentAddress" className="flex items-center gap-1"><MapPin className="h-4 w-4 text-muted-foreground"/>{t('sections.personal.addressLabel')}</Label>
                  <Controller name="currentAddress" control={control} render={({ field }) => <Textarea id="currentAddress" placeholder={t('sections.personal.addressPlaceholder')} {...field} />} />
                </div>
              </div>
                
              {renderSectionHeader("sections.academic.title", GraduationCap)}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <Label htmlFor="graduationYear">{t('sections.academic.gradYearLabel')}</Label>
                  <Controller name="graduationYear" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="graduationYear"><SelectValue placeholder={t('sections.academic.gradYearPlaceholder')} /></SelectTrigger>
                      <SelectContent>
                        {graduationYears.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="degreeProgram">{t('sections.academic.degreeLabel')}</Label>
                  <Controller name="degreeProgram" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="degreeProgram"><SelectValue placeholder={t('sections.academic.degreePlaceholder')} /></SelectTrigger>
                      <SelectContent>
                        {DegreePrograms.map(deg => <SelectItem key={deg} value={deg}>{deg}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="department">{t('sections.academic.departmentLabel')}</Label>
                  <Controller name="department" control={control} render={({ field }) => <Input id="department" placeholder={t('sections.academic.departmentPlaceholder')} {...field} />} />
                </div>
              </div>
              
              {renderSectionHeader("sections.professional.title", Briefcase)}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <Label htmlFor="currentJobTitle">{t('sections.professional.jobTitleLabel')}</Label>
                  <Controller name="currentJobTitle" control={control} render={({ field }) => <Input id="currentJobTitle" {...field} />} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="currentOrganization" className="flex items-center gap-1"><Building className="h-4 w-4 text-muted-foreground"/>{t('sections.professional.organizationLabel')}</Label>
                  <Controller name="currentOrganization" control={control} render={({ field }) => <Input id="currentOrganization" {...field} />} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="industry">{t('sections.professional.industryLabel')}</Label>
                  <Controller name="industry" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="industry"><SelectValue placeholder={t('sections.professional.industryPlaceholder')} /></SelectTrigger>
                      <SelectContent>
                        {Industries.map(ind => <SelectItem key={ind} value={ind}>{ind}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="workLocation">{t('sections.professional.workLocationLabel')}</Label>
                  <Controller name="workLocation" control={control} render={({ field }) => <Input id="workLocation" {...field} />} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="linkedInProfile" className="flex items-center gap-1"><LinkIcon className="h-4 w-4 text-muted-foreground"/>{t('sections.professional.linkedinLabel')}</Label>
                  <Controller name="linkedInProfile" control={control} render={({ field }) => <Input id="linkedInProfile" type="url" {...field} />} />
                  {errors.linkedInProfile && <p className="text-sm text-destructive mt-1">{errors.linkedInProfile.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="yearsOfExperience">{t('sections.professional.experienceLabel')}</Label>
                  <Controller name="yearsOfExperience" control={control} render={({ field }) => <Input id="yearsOfExperience" type="text" placeholder={t('sections.professional.experiencePlaceholder')} {...field} />} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="skills" className="flex items-center gap-1"><Brain className="h-4 w-4 text-muted-foreground"/>{t('sections.professional.skillsLabel')}</Label>
                  <Controller name="skills" control={control} render={({ field }) => <Textarea id="skills" placeholder={t('sections.professional.skillsPlaceholder')} {...field} />} />
                </div>
              </div>

              {renderSectionHeader("sections.engagement.title", Handshake, "sections.engagement.tooltip")}
              <div className="space-y-4">
                <Label className="flex items-center gap-1 text-md"><Users className="h-4 w-4 text-muted-foreground"/>{t('sections.engagement.supportAreasLabel')}</Label>
                <Controller
                  name="areasOfSupport"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                      {AreasOfSupportOptions.map((area) => (
                        <div key={area} className="flex items-center space-x-2">
                          <Checkbox
                            id={`support-${area.replace(/\s+/g, '-')}`}
                            checked={field.value?.includes(area)}
                            onCheckedChange={(checked) => {
                              const currentAreas = field.value || [];
                              if (checked) {
                                field.onChange([...currentAreas, area]);
                              } else {
                                field.onChange(currentAreas.filter((value) => value !== area));
                              }
                            }}
                          />
                          <Label htmlFor={`support-${area.replace(/\s+/g, '-')}`} className="font-normal text-sm">{t(`areasOfSupportOptions.${area.replace(/\s+/g, '').replace('/', '')}` as any)}</Label>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <Label htmlFor="timeCommitment" className="flex items-center gap-1"><Clock className="h-4 w-4 text-muted-foreground"/>{t('sections.engagement.timeCommitmentLabel')}</Label>
                  <Controller name="timeCommitment" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="timeCommitment"><SelectValue placeholder={t('sections.engagement.timeCommitmentPlaceholder')} /></SelectTrigger>
                      <SelectContent>
                        {TimeCommitments.map(tc => <SelectItem key={tc} value={tc}>{t(`timeCommitmentOptions.${tc.replace(/\s+/g, '').replace('+', 'plus')}` as any)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="preferredEngagementMode" className="flex items-center gap-1"><MessageCircle className="h-4 w-4 text-muted-foreground"/>{t('sections.engagement.engagementModeLabel')}</Label>
                  <Controller name="preferredEngagementMode" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="preferredEngagementMode"><SelectValue placeholder={t('sections.engagement.engagementModePlaceholder')} /></SelectTrigger>
                      <SelectContent>
                        {EngagementModes.map(mode => <SelectItem key={mode} value={mode}>{t(`engagementModeOptions.${mode.toLowerCase()}` as any)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )} />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="otherComments" className="flex items-center gap-1"><Info className="h-4 w-4 text-muted-foreground"/>{t('sections.engagement.otherCommentsLabel')}</Label>
                <Controller name="otherComments" control={control} render={({ field }) => <Textarea id="otherComments" {...field} />} />
              </div>

              {renderSectionHeader("sections.helpSought.title", HelpCircle, "sections.helpSought.tooltip")}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <Label htmlFor="lookingForSupportType">{t('sections.helpSought.supportTypeLabel')}</Label>
                  <Controller name="lookingForSupportType" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="lookingForSupportType"><SelectValue placeholder={t('sections.helpSought.supportTypePlaceholder')} /></SelectTrigger>
                      <SelectContent>
                        {SupportTypesSoughtOptions.map(st => <SelectItem key={st} value={st}>{t(`supportTypesSoughtOptions.${st.replace(/\s+/g, '')}` as any)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )} />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="helpNeededDescription">{t('sections.helpSought.helpNeededDescriptionLabel')}</Label>
                <Controller name="helpNeededDescription" control={control} render={({ field }) => <Textarea id="helpNeededDescription" {...field} />} />
              </div>

              {renderSectionHeader("sections.consent.title", CheckSquare, "sections.consent.tooltip")}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>{t('sections.consent.shareProfileLabel')}</Label>
                  <Controller name="shareProfileConsent" control={control} render={({ field }) => (
                    <RadioGroup onValueChange={(val) => field.onChange(val === "true")} defaultValue={String(field.value)} className="flex space-x-4">
                      <div className="flex items-center space-x-2"><RadioGroupItem value="true" id="share-yes" /><Label htmlFor="share-yes" className="font-normal">{t('yes')}</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="false" id="share-no" /><Label htmlFor="share-no" className="font-normal">{t('no')}</Label></div>
                    </RadioGroup>
                  )} />
                </div>
                <div className="space-y-2">
                  <Label>{t('sections.consent.featureSpotlightLabel')}</Label>
                  <Controller name="featureInSpotlightConsent" control={control} render={({ field }) => (
                    <RadioGroup onValueChange={(val) => field.onChange(val === "true")} defaultValue={String(field.value)} className="flex space-x-4">
                      <div className="flex items-center space-x-2"><RadioGroupItem value="true" id="feature-yes" /><Label htmlFor="feature-yes" className="font-normal">{t('yes')}</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="false" id="feature-no" /><Label htmlFor="feature-no" className="font-normal">{t('no')}</Label></div>
                    </RadioGroup>
                  )} />
                </div>
              </div>
              
              {renderSectionHeader("sections.additionalInfo.title", SettingsIcon)}
              <div className="space-y-1">
                  <Label htmlFor="profilePictureUrl" className="flex items-center gap-1"><User className="h-4 w-4 text-muted-foreground"/>{t('sections.additionalInfo.profilePictureUrlLabel')}</Label>
                  <Controller name="profilePictureUrl" control={control} render={({ field }) => <Input id="profilePictureUrl" placeholder={t('sections.additionalInfo.profilePictureUrlPlaceholder')} {...field} />} />
                  {errors.profilePictureUrl && <p className="text-sm text-destructive mt-1">{errors.profilePictureUrl.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="bio" className="flex items-center gap-1"><Briefcase className="h-4 w-4 text-muted-foreground"/>{t('sections.additionalInfo.bioLabel')}</Label>
                <Controller name="bio" control={control} render={({ field }) => <Textarea id="bio" rows={4} placeholder={t('sections.additionalInfo.bioPlaceholder')} {...field} />} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="careerInterests" className="flex items-center gap-1"><Sparkles className="h-4 w-4 text-muted-foreground"/>{t('sections.additionalInfo.careerInterestsLabel')}</Label>
                <Controller name="careerInterests" control={control} render={({ field }) => <Input id="careerInterests" placeholder={t('sections.additionalInfo.careerInterestsPlaceholder')} {...field} />} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="resumeText" className="flex items-center gap-1">
                  <User className="h-4 w-4 text-muted-foreground"/>{t('sections.additionalInfo.resumeTextLabel')}
                  <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{t('sections.additionalInfo.resumeTextTooltip')}</p>
                      </TooltipContent>
                    </Tooltip>
                </Label>
                <Controller name="resumeText" control={control} render={({ field }) => <Textarea id="resumeText" rows={8} placeholder={t('sections.additionalInfo.resumeTextPlaceholder')} {...field} />} />
              </div>
            </CardContent>
            <CardFooter>
              {isEditing && (
                <div className="flex gap-2">
                   <Button type="submit" disabled={!isDirty} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Save className="mr-2 h-4 w-4" /> {t('saveChangesButton')}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setIsEditing(false); reset(); }}>
                    {t('cancelButton')}
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </fieldset>
      </form>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" /> {t('skillSuggestCard.title')}
          </CardTitle>
          <CardDescription>{t('skillSuggestCard.desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isSkillsLoading && (
            <div className="text-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="mt-2 text-muted-foreground">{t('skillSuggestCard.loadingText')}</p>
            </div>
          )}
          {!isSkillsLoading && suggestedSkills && suggestedSkills.length === 0 && (
            <p className="text-muted-foreground text-center py-4">{t('skillSuggestCard.noSuggestionsText')}</p>
          )}
          {!isSkillsLoading && suggestedSkills && suggestedSkills.length > 0 && (
            <div className="space-y-3">
              {suggestedSkills.map(skillRec => (
                <Card key={skillRec.skill} className="bg-secondary/50 p-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{skillRec.skill}</h4>
                      <p className="text-xs text-muted-foreground">{t('skillSuggestCard.relevanceLabel')}: <span className="text-primary font-bold">{skillRec.relevanceScore}%</span></p>
                    </div>
                    {isEditing && (
                       <Button size="sm" variant="outline" onClick={() => handleAddSuggestedSkill(skillRec.skill)}>
                        <PlusCircleIcon className="mr-1 h-4 w-4" /> {t('skillSuggestCard.addSkillButton')}
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 italic">{t('skillSuggestCard.reasoningLabel')}: {skillRec.reasoning}</p>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleGetSkillSuggestions} disabled={isSkillsLoading} className="w-full md:w-auto">
            {isSkillsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ThumbsUp className="mr-2 h-4 w-4" />}
            {t('skillSuggestCard.getSuggestionsButton')}
          </Button>
        </CardFooter>
      </Card>

    </TooltipProvider>

    <Dialog open={isProfileSavedDialogOpen} onOpenChange={setIsProfileSavedDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircleIcon className="h-6 w-6 text-green-500" />
            {t('profileSavedDialog.title')}
          </DialogTitle>
          <DialogUIDescription>
            {t('profileSavedDialog.desc')}
          </DialogUIDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={() => setIsProfileSavedDialogOpen(false)}>{t('profileSavedDialog.okButton')}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  );
}
