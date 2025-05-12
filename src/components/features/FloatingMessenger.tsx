
"use client";

import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, X, Send } from 'lucide-react';
import type { SurveyStep, SurveyOption } from '@/types';
import { cn } from '@/lib/utils';
import { DegreePrograms, Industries, AreasOfSupport, TimeCommitments, EngagementModes, SupportTypesSought, Genders } from '@/types';
import { graduationYears } from '@/lib/sample-data';


const initialFeedbackSurvey: SurveyStep[] = [
  { id: 'start', type: 'botMessage', text: 'Hi there! 👋 Welcome to ResumeMatch AI. We\'d love to hear your thoughts.', nextStepId: 'q_experience' },
  { id: 'q_experience', type: 'botMessage', text: 'How has your experience been using our platform so far?', nextStepId: 'ans_experience' },
  { id: 'ans_experience', type: 'userOptions', options: [
    { text: '🚀 Amazing!', value: 'amazing', nextStepId: 'feedback_positive' },
    { text: '😐 It\'s okay', value: 'okay', nextStepId: 'feedback_neutral' },
    { text: '😕 Needs improvement', value: 'needs_improvement', nextStepId: 'feedback_negative' },
  ]},
  { id: 'feedback_positive', type: 'botMessage', text: 'That\'s great to hear! What feature do you find most helpful?', nextStepId: 'input_positive_feature' },
  { id: 'input_positive_feature', type: 'userInput', placeholder: 'Type your favorite feature...', variableName: 'loved_feature', nextStepId: 'q_referral' },
  { id: 'feedback_neutral', type: 'botMessage', text: 'Thanks for the honesty. What\'s one thing we could improve to make it better for you?', nextStepId: 'input_neutral_feedback'},
  { id: 'input_neutral_feedback', type: 'userInput', placeholder: 'Tell us what to improve...', variableName: 'improvement_suggestion', nextStepId: 'q_referral' },
  { id: 'feedback_negative', type: 'botMessage', text: 'We\'re sorry to hear that. Could you please tell us more about what wasn\'t working or what you found frustrating?', nextStepId: 'input_negative_feedback'},
  { id: 'input_negative_feedback', type: 'userInput', placeholder: 'Describe your concerns...', variableName: 'frustration_details', nextStepId: 'q_referral' },
  { id: 'q_referral', type: 'botMessage', text: 'Thank you for sharing! One last thing: how likely are you to recommend ResumeMatch AI to a friend or colleague?', nextStepId: 'ans_referral_dropdown' },
  { id: 'ans_referral_dropdown', type: 'userDropdown', dropdownOptions: [
      { label: 'Very Likely', value: 'very_likely' },
      { label: 'Likely', value: 'likely' },
      { label: 'Neutral', value: 'neutral' },
      { label: 'Unlikely', value: 'unlikely' },
      { label: 'Very Unlikely', value: 'very_unlikely' },
    ], variableName: 'referral_likelihood', nextStepId: 'thank_you'
  },
  { id: 'thank_you', type: 'botMessage', text: 'Thank you for your valuable feedback! We appreciate you taking the time. Have a great day! 😊', isLastStep: true },
];

const profileCompletionSurveyDefinition: SurveyStep[] = [
  // Intro
  { id: 'pc_intro', type: 'botMessage', text: "Let's complete your profile! This will help us personalize your experience and connect you with better opportunities.", nextStepId: 'pc_s1_start' },

  // Section 1: Personal & Contact Information
  { id: 'pc_s1_start', type: 'botMessage', text: "First, some personal details.", nextStepId: 'pc_s1_fullName' },
  { id: 'pc_s1_fullName', type: 'userInput', text: "What's your full name? (Required)", placeholder: "e.g., John Doe", variableName: 'fullName', nextStepId: 'pc_s1_dob' },
  { id: 'pc_s1_dob', type: 'userInput', text: "What's your date of birth? (YYYY-MM-DD)", placeholder: "YYYY-MM-DD", variableName: 'dateOfBirth', nextStepId: 'pc_s1_gender' },
  { id: 'pc_s1_gender', type: 'userDropdown', text: "What's your gender?", dropdownOptions: Genders.map(g => ({label: g, value: g})), variableName: 'gender', nextStepId: 'pc_s1_email' },
  { id: 'pc_s1_email', type: 'userInput', text: "What's your email ID? (Required)", placeholder: "you@example.com", variableName: 'email', nextStepId: 'pc_s1_mobile' },
  { id: 'pc_s1_mobile', type: 'userInput', text: "What's your mobile number (with country code)?", placeholder: "+1 123 456 7890", variableName: 'mobileNumber', nextStepId: 'pc_s1_address' },
  { id: 'pc_s1_address', type: 'userInput', text: "What's your current address (City, State, Country)?", placeholder: "San Francisco, CA, USA", inputType: 'textarea', variableName: 'currentAddress', nextStepId: 'pc_s2_start' },

  // Section 2: Academic Information
  { id: 'pc_s2_start', type: 'botMessage', text: "Great! Now, let's cover your academic background.", nextStepId: 'pc_s2_gradYear' },
  { id: 'pc_s2_gradYear', type: 'userDropdown', text: "What's your year of graduation/batch?", dropdownOptions: graduationYears.map(y => ({label: y, value: y})), variableName: 'graduationYear', nextStepId: 'pc_s2_degree' },
  { id: 'pc_s2_degree', type: 'userDropdown', text: "What's your degree/program?", dropdownOptions: DegreePrograms.map(d => ({label: d, value: d})), variableName: 'degreeProgram', nextStepId: 'pc_s2_department' },
  { id: 'pc_s2_department', type: 'userInput', text: "What's your department?", placeholder: "e.g., Computer Science", variableName: 'department', nextStepId: 'pc_s3_start' },

  // Section 3: Professional Information
  { id: 'pc_s3_start', type: 'botMessage', text: "Excellent. Let's move on to your professional information.", nextStepId: 'pc_s3_jobTitle' },
  { id: 'pc_s3_jobTitle', type: 'userInput', text: "What's your current job title?", placeholder: "e.g., Software Engineer", variableName: 'currentJobTitle', nextStepId: 'pc_s3_organization' },
  { id: 'pc_s3_organization', type: 'userInput', text: "What's your current organization?", placeholder: "e.g., Tech Corp", variableName: 'currentOrganization', nextStepId: 'pc_s3_industry' },
  { id: 'pc_s3_industry', type: 'userDropdown', text: "What's your industry/sector?", dropdownOptions: Industries.map(i => ({label: i, value: i})), variableName: 'industry', nextStepId: 'pc_s3_workLocation' },
  { id: 'pc_s3_workLocation', type: 'userInput', text: "What's your work location (City, Country)?", placeholder: "e.g., London, UK", variableName: 'workLocation', nextStepId: 'pc_s3_linkedin' },
  { id: 'pc_s3_linkedin', type: 'userInput', text: "What's your LinkedIn profile URL? (Optional)", placeholder: "https://linkedin.com/in/yourprofile", variableName: 'linkedInProfile', nextStepId: 'pc_s3_experience' },
  { id: 'pc_s3_experience', type: 'userInput', text: "How many years of experience do you have?", placeholder: "e.g., 5 or 5+", variableName: 'yearsOfExperience', nextStepId: 'pc_s3_skills_prompt' },
  { id: 'pc_s3_skills_prompt', type: 'botMessage', text: "What are your key skills or areas of expertise? (Please list them, separated by commas)", nextStepId: 'pc_s3_skills_input' },
  { id: 'pc_s3_skills_input', type: 'userInput', placeholder: "e.g., React, Python, Data Analysis", inputType: 'textarea', variableName: 'skills', nextStepId: 'pc_s4_start' },
  
  // Section 4: Alumni Engagement & Support Interests
  { id: 'pc_s4_start', type: 'botMessage', text: "Let's talk about alumni engagement.", nextStepId: 'pc_s4_supportAreas_prompt' },
  { id: 'pc_s4_supportAreas_prompt', type: 'botMessage', text: `Which areas can you support? (Comma-separated from: ${AreasOfSupport.join(', ')})`, nextStepId: 'pc_s4_supportAreas_input' },
  { id: 'pc_s4_supportAreas_input', type: 'userInput', text: "Your areas of support:", placeholder: "e.g., Mentoring Students, Job Referrals", inputType: 'textarea', variableName: 'areasOfSupport', nextStepId: 'pc_s4_timeCommitment' },
  { id: 'pc_s4_timeCommitment', type: 'userDropdown', text: "How much time are you willing to commit per month?", dropdownOptions: TimeCommitments.map(tc => ({label: tc, value: tc})), variableName: 'timeCommitment', nextStepId: 'pc_s4_engagementMode' },
  { id: 'pc_s4_engagementMode', type: 'userDropdown', text: "What's your preferred mode of engagement?", dropdownOptions: EngagementModes.map(em => ({label: em, value: em})), variableName: 'preferredEngagementMode', nextStepId: 'pc_s4_otherComments' },
  { id: 'pc_s4_otherComments', type: 'userInput', text: "Any other comments or notes regarding engagement? (Optional)", inputType: 'textarea', variableName: 'otherComments', nextStepId: 'pc_s5_start' },

  // Section 5: Help You’re Looking For (Optional)
  { id: 'pc_s5_start', type: 'botMessage', text: "Now, optionally, tell us if you're looking for any specific support.", nextStepId: 'pc_s5_supportType' },
  { id: 'pc_s5_supportType', type: 'userDropdown', text: "What type of support are you looking for? (Optional)", dropdownOptions: [{label: "Not looking for support now", value: "none"}, ...SupportTypesSought.map(st => ({label: st, value: st}))], variableName: 'lookingForSupportType', nextStepId: 'pc_s5_helpNeeded' },
  { id: 'pc_s5_helpNeeded', type: 'userInput', text: "Briefly describe the help you need. (Optional, if you selected a support type)", inputType: 'textarea', variableName: 'helpNeededDescription', nextStepId: 'pc_s6_start' },

  // Section 6: Visibility & Consent
  { id: 'pc_s6_start', type: 'botMessage', text: "Almost done! Just a couple of consent questions.", nextStepId: 'pc_s6_shareProfile' },
  { id: 'pc_s6_shareProfile', type: 'userOptions', text: "Can we share your profile with other alumni for relevant collaboration?", options: [{text: 'Yes', value: 'true'}, {text: 'No', value: 'false'}], variableName: 'shareProfileConsent', nextStepId: 'pc_s6_featureSpotlight' },
  { id: 'pc_s6_featureSpotlight', type: 'userOptions', text: "Can we feature you on the alumni dashboard or spotlight?", options: [{text: 'Yes', value: 'true'}, {text: 'No', value: 'false'}], variableName: 'featureInSpotlightConsent', nextStepId: 'pc_end' },

  // End
  { id: 'pc_end', type: 'botMessage', text: "Thank you for completing your profile information! Your profile is now more discoverable. 🎉", isLastStep: true },
];

// A map of available survey definitions
const surveyDefinitions: Record<string, SurveyStep[]> = {
  initialFeedbackSurvey: initialFeedbackSurvey,
  profileCompletionSurvey: profileCompletionSurveyDefinition,
};

// Default survey if no specific survey is chosen or found
const defaultSurveyId = 'initialFeedbackSurvey';


interface Message {
  id: string;
  type: 'bot' | 'user';
  content: React.ReactNode;
}

export default function FloatingMessenger() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSurveyId, setActiveSurveyId] = useState<string>(defaultSurveyId); // ID of the currently active survey
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [surveyData, setSurveyData] = useState<Record<string, string>>({});
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdCounter = useRef(0);

  const currentSurveyDefinition = surveyDefinitions[activeSurveyId] || surveyDefinitions[defaultSurveyId];
  const currentSurveyStep = currentSurveyDefinition.find(step => step.id === currentStepId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);
  
  // Effect to load and potentially start the survey when messenger opens or active survey changes
  useEffect(() => {
    if (isOpen) {
      const firstStep = currentSurveyDefinition[0];
      if (firstStep) {
        // Only reset and start if messages are empty (new session) or survey changed
        if (messages.length === 0 || currentStepId !== firstStep.id) {
          resetSurvey(activeSurveyId); // Pass active survey ID to reset
        }
      } else {
        setCurrentStepId(null); // No steps in current survey
      }
    }
  }, [isOpen, activeSurveyId, currentSurveyDefinition]); // Rerun if activeSurveyId changes


  const addMessage = (type: 'bot' | 'user', content: React.ReactNode) => {
    const newId = `${Date.now()}-${messageIdCounter.current++}`;
    setMessages(prev => [...prev, { id: newId, type, content }]);
  };
  
  const processStep = (step: SurveyStep | undefined) => {
    if (!step) {
      setCurrentStepId(null); 
      return;
    }

    if (step.type === 'botMessage') {
      if (step.text) addMessage('bot', step.text);
      if (step.isLastStep) {
        setCurrentStepId(null); 
        // TODO: Here you could submit `surveyData`
        console.log("Survey Completed. Data:", surveyData);
      } else if (step.nextStepId) {
        const nextStep = currentSurveyDefinition.find(s => s.id === step.nextStepId);
        if (nextStep && nextStep.type === 'botMessage') {
           processStep(nextStep); 
        } else {
           setCurrentStepId(step.nextStepId || null);
        }
      } else {
         setCurrentStepId(null); 
      }
    } else {
      if (step.text) { // Display question text for user input steps if provided
        addMessage('bot', step.text);
      }
      setCurrentStepId(step.id);
    }
  };


  const handleOptionSelect = (option: SurveyOption) => {
    addMessage('user', option.text);
    if (currentSurveyStep?.variableName) {
      setSurveyData(prev => ({ ...prev, [currentSurveyStep.variableName!]: option.value }));
    }
    const nextStep = currentSurveyDefinition.find(s => s.id === option.nextStepId);
    processStep(nextStep);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleDropdownChange = (value: string) => {
    if (!currentSurveyStep || (currentSurveyStep.type !== 'userDropdown' && currentSurveyStep.type !== 'userOptions' )) return; // Also handle userOptions if they were to use Select
    
    let selectedLabel = value; // Default to value if label not found
    if(currentSurveyStep.type === 'userDropdown' && currentSurveyStep.dropdownOptions) {
        selectedLabel = currentSurveyStep.dropdownOptions?.find(opt => opt.value === value)?.label || value;
    } else if (currentSurveyStep.type === 'userOptions' && currentSurveyStep.options) {
         selectedLabel = currentSurveyStep.options?.find(opt => opt.value === value)?.text || value;
    }

    addMessage('user', selectedLabel);
     if (currentSurveyStep.variableName) {
      setSurveyData(prev => ({ ...prev, [currentSurveyStep.variableName!]: value }));
    }
    const nextStep = currentSurveyDefinition.find(s => s.id === currentSurveyStep.nextStepId);
    processStep(nextStep);
  };

  const handleInputSubmit = () => {
    if (!inputValue.trim() || !currentSurveyStep) return;
    addMessage('user', inputValue);
    if (currentSurveyStep.variableName) {
      setSurveyData(prev => ({ ...prev, [currentSurveyStep.variableName!]: inputValue }));
    }
    setInputValue('');
    const nextStep = currentSurveyDefinition.find(s => s.id === currentSurveyStep.nextStepId);
    processStep(nextStep);
  };
  
  const resetSurvey = (surveyIdToLoad = defaultSurveyId) => {
    setMessages([]);
    setSurveyData({});
    setInputValue('');
    messageIdCounter.current = 0;
    setActiveSurveyId(surveyIdToLoad); // Set the survey to load

    const surveyToStart = surveyDefinitions[surveyIdToLoad] || surveyDefinitions[defaultSurveyId];
    const firstStep = surveyToStart[0];

    if (firstStep) {
       setCurrentStepId(firstStep.id);
       // If the first step is a bot message, process it to display it.
       // Otherwise, currentStepId is set, and UI will render the user interaction.
       if(firstStep.type === 'botMessage') {
         processStep(firstStep);
       } else if (firstStep.text) { // For non-botMessage steps that have introductory text
         addMessage('bot', firstStep.text);
       }
    } else {
       setCurrentStepId(null); // No steps in the survey
    }
  };

  // This effect is to potentially listen to an external trigger to change the active survey
  // For now, it's not used but good for future global state management of active survey.
  useEffect(() => {
    // const externallySetSurveyId = ...; // Get from global state / props / context
    // if (externallySetSurveyId && externallySetSurveyId !== activeSurveyId) {
    //   resetSurvey(externallySetSurveyId);
    // }
  }, [/* externallySetSurveyId */]);


  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-50 bg-primary hover:bg-primary/90"
        size="icon"
        onClick={() => {
            setIsOpen(true);
            // resetSurvey will be called by the useEffect hook based on isOpen and activeSurveyId
        }}
      >
        <Bot className="h-7 w-7 text-primary-foreground" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
       <Card className="w-80 h-[450px] shadow-xl flex flex-col bg-card text-card-foreground rounded-lg overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between p-3 bg-primary text-primary-foreground border-b border-primary/50">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <CardTitle className="text-md font-semibold">
              {activeSurveyId === 'profileCompletionSurvey' ? 'Profile Setup Assistant' : 'Feedback Assistant'}
            </CardTitle>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground hover:bg-primary/80" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="p-0 flex-grow overflow-hidden">
           <ScrollArea className="h-[calc(450px-60px-70px)] p-3"> {/* Adjusted height */}
            <div className="space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex", msg.type === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={cn(
                      "max-w-[85%] p-2.5 rounded-lg text-sm shadow",
                      msg.type === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary text-secondary-foreground rounded-bl-none'
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="p-2 border-t border-border min-h-[70px]">
          {currentSurveyStep && currentSurveyStep.type === 'userOptions' && currentSurveyStep.options && (
            <div className="flex flex-col space-y-1.5 w-full">
              {currentSurveyStep.options.map(option => (
                <Button key={option.value} variant="outline" size="sm" className="w-full justify-start text-sm" onClick={() => handleOptionSelect(option)}>
                  {option.text}
                </Button>
              ))}
            </div>
          )}
          {currentSurveyStep && currentSurveyStep.type === 'userInput' && (
            <div className="flex items-center w-full gap-1.5">
              <Textarea
                value={inputValue}
                onChange={handleInputChange}
                placeholder={currentSurveyStep.placeholder || "Type your response..."}
                rows={currentSurveyStep.inputType === 'textarea' ? 3 : 1}
                className={cn(
                    "flex-grow resize-none text-sm p-2 min-h-[40px]",
                    currentSurveyStep.inputType === 'textarea' ? 'max-h-[100px]' : 'max-h-[40px]'
                )}
                onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey && currentSurveyStep.inputType !== 'textarea') { e.preventDefault(); handleInputSubmit(); }}}
              />
              <Button size="icon" onClick={handleInputSubmit} disabled={!inputValue.trim()} className="h-9 w-9 shrink-0 self-end">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
          {currentSurveyStep && currentSurveyStep.type === 'userDropdown' && currentSurveyStep.dropdownOptions && (
              <Select onValueChange={handleDropdownChange}>
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {currentSurveyStep.dropdownOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="text-sm">{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
          )}
           {!currentSurveyStep && messages.length > 0 && ( 
             <div className="flex flex-col items-center w-full space-y-2">
                <Button variant="outline" size="sm" onClick={() => resetSurvey(activeSurveyId)} className="w-full">Restart Current Survey</Button>
                {/* Example to switch survey, can be tied to admin page later */}
                {/* <Button variant="outline" size="sm" onClick={() => resetSurvey(activeSurveyId === 'initialFeedbackSurvey' ? 'profileCompletionSurvey' : 'initialFeedbackSurvey')} className="w-full">
                    Switch to {activeSurveyId === 'initialFeedbackSurvey' ? 'Profile Survey' : 'Feedback Survey'}
                </Button> */}
                <Button size="sm" onClick={() => setIsOpen(false)} className="w-full bg-primary hover:bg-primary/90">Close</Button>
             </div>
           )}
        </CardFooter>
      </Card>
    </div>
  );
}
