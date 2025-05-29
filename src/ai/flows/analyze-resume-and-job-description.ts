
'use server';

/**
 * @fileOverview Analyzes a resume and job description to identify matching skills, experience, and provide detailed feedback across various categories.
 *
 * - analyzeResumeAndJobDescription - A function that handles the analysis process.
 * - AnalyzeResumeAndJobDescriptionInput - The input type for the analyzeResumeAndJobDescription function.
 * - AnalyzeResumeAndJobDescriptionOutput - The return type for the analyzeResumeAndJobDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeResumeAndJobDescriptionInputSchema = z.object({
  resumeText: z.string().describe('The text content of the resume.'),
  jobDescriptionText: z.string().describe('The text content of the job description.'),
});
export type AnalyzeResumeAndJobDescriptionInput = z.infer<typeof AnalyzeResumeAndJobDescriptionInputSchema>;

const SearchabilityDetailsSchema = z.object({
  hasPhoneNumber: z.boolean().optional().describe("Resume contains a phone number."),
  hasEmail: z.boolean().optional().describe("Resume contains an email address."),
  hasAddress: z.boolean().optional().describe("Resume contains a physical address."),
  jobTitleMatchesJD: z.boolean().optional().describe("Job title in resume aligns with or is found in the job description."),
  hasWorkExperienceSection: z.boolean().optional().describe("A distinct work experience section was identified."),
  hasEducationSection: z.boolean().optional().describe("A distinct education section was identified."),
  hasProfessionalSummary: z.boolean().optional().describe("Resume contains a professional summary or objective statement."),
  keywordDensityFeedback: z.string().optional().describe("Feedback on keyword density and relevance to the job description."),
});

const RecruiterTipItemSchema = z.object({
    category: z.string().describe("Category of the tip (e.g., Word Count, Action Verbs, Measurable Results)."),
    finding: z.string().describe("The specific finding or observation related to this tip."),
    status: z.enum(['positive', 'neutral', 'negative']).describe("Assessment of the finding (positive, neutral, negative)."),
    suggestion: z.string().optional().describe("A brief suggestion for improvement if status is neutral or negative."),
});

const AtsFormattingIssueSchema = z.object({
    issue: z.string().describe("The specific formatting issue identified."),
    recommendation: z.string().describe("A recommendation to address the issue."),
});

const AtsParsingConfidenceSchema = z.object({
    overall: z.number().min(0).max(100).optional().describe("Overall confidence score (0-100) for ATS parsing."),
    // sections: z.record(z.number().min(0).max(100)).optional().describe("Confidence scores for parsing specific sections (e.g., contactInfo: 90, experience: 75)."), // Removed due to API schema error
    warnings: z.array(z.string()).optional().describe("Specific warnings or potential issues for ATS parsing."),
});

const QuantifiableAchievementDetailsSchema = z.object({
    score: z.number().min(0).max(100).optional().describe("Score for the use of quantifiable achievements."),
    examplesFound: z.array(z.string()).optional().describe("Examples of strong quantifiable statements found."),
    areasLackingQuantification: z.array(z.string()).optional().describe("Sections or bullet points where quantification could be added."),
});

const ActionVerbDetailsSchema = z.object({
    score: z.number().min(0).max(100).optional().describe("Score for the quality, variety, and impact of action verbs."),
    strongVerbsUsed: z.array(z.string()).optional().describe("Examples of strong action verbs found."),
    weakVerbsUsed: z.array(z.string()).optional().describe("Examples of weak or passive verbs found."),
    overusedVerbs: z.array(z.string()).optional().describe("Action verbs that might be overused."),
    suggestedStrongerVerbs: z.array(z.object({ original: z.string(), suggestion: z.string() })).optional().describe("Suggestions for stronger verb alternatives."),
});

const ImpactStatementDetailsSchema = z.object({
    clarityScore: z.number().min(0).max(100).optional().describe("Score for the clarity and impact of experience/achievement statements."),
    unclearImpactStatements: z.array(z.string()).optional().describe("Examples of statements that could be clearer or lack demonstrated impact."),
    exampleWellWrittenImpactStatements: z.array(z.string()).optional().describe("Examples of well-written impact statements found."),
});

const ReadabilityDetailsSchema = z.object({
    fleschKincaidGradeLevel: z.number().optional().describe("Estimated Flesch-Kincaid Grade Level."),
    fleschReadingEase: z.number().optional().describe("Estimated Flesch Reading Ease score."),
    readabilityFeedback: z.string().optional().describe("General feedback on the resume's readability, e.g., sentence structure, conciseness."),
});


const AnalyzeResumeAndJobDescriptionOutputSchema = z.object({
  hardSkillsScore: z.number().min(0).max(100).optional().describe("Score for hard skill alignment with the job description (0-100)."),
  matchingSkills: z.array(z.string()).optional().describe('Skills that appear in both the resume and the job description. These contribute to Hard Skills Score.'),
  missingSkills: z.array(z.string()).optional().describe('Skills crucial for the job description that are missing from the resume. These impact Hard Skills Score negatively.'),
  resumeKeyStrengths: z.string().optional().describe('Key strengths and experiences highlighted from the resume that align with the job. This feeds into Highlights Score.'),
  jobDescriptionKeyRequirements: z.string().optional().describe('Key requirements and critical expectations extracted from the job description for comparison.'),
  overallQualityScore: z.number().min(0).max(100).optional().describe('An overall quality score (0-100) for the resume against the job description, considering content, structure, and alignment beyond just keywords.'),
  recruiterTips: z.array(RecruiterTipItemSchema).optional().describe("Detailed breakdown of recruiter tips and assessments."),
  overallFeedback: z.string().optional().describe("General overall feedback and summary of the resume's effectiveness for this job."),

  searchabilityScore: z.number().min(0).max(100).optional().describe("Overall searchability score (0-100). Based on presence of contact info, section headings, and job title match."),
  recruiterTipsScore: z.number().min(0).max(100).optional().describe("Overall score based on recruiter tips (0-100), such as word count, action verbs, and measurable results."),
  formattingScore: z.number().min(0).max(100).optional().describe("Overall formatting score (0-100), considering clarity, consistency, and length."),
  highlightsScore: z.number().min(0).max(100).optional().describe("Score for the quality and relevance of resume highlights (0-100) against the job description."),
  softSkillsScore: z.number().min(0).max(100).optional().describe("Score for identified soft skills relevant to the job (0-100)."),
  identifiedSoftSkills: z.array(z.string()).optional().describe('Soft skills identified in the resume that are relevant to the job description. These contribute to Soft Skills Score.'),
  
  searchabilityDetails: SearchabilityDetailsSchema.optional().describe("Detailed breakdown of searchability aspects."),
  formattingDetails: z.array(AtsFormattingIssueSchema).optional().describe("Detailed breakdown of formatting aspects and feedback, renamed from formattingItems to match type."),
  
  atsParsingConfidence: AtsParsingConfidenceSchema.optional().describe("Confidence scores for ATS parsing."),
  atsStandardFormattingComplianceScore: z.number().min(0).max(100).optional().describe("Score for compliance with standard ATS-friendly formatting."),
  standardFormattingIssues: z.array(AtsFormattingIssueSchema).optional().describe("Specific standard formatting issues identified."),
  undefinedAcronyms: z.array(z.string()).optional().describe("Acronyms used without prior definition."),

  quantifiableAchievementDetails: QuantifiableAchievementDetailsSchema.optional().describe("Details on quantifiable achievements."),
  actionVerbDetails: ActionVerbDetailsSchema.optional().describe("Details on action verb usage."),
  impactStatementDetails: ImpactStatementDetailsSchema.optional().describe("Analysis of impact statement clarity and effectiveness."),
  readabilityDetails: ReadabilityDetailsSchema.optional().describe("Assessment of the resume's readability."),
});

export type AnalyzeResumeAndJobDescriptionOutput = z.infer<typeof AnalyzeResumeAndJobDescriptionOutputSchema>;

function getDefaultOutput(errorMessage?: string): AnalyzeResumeAndJobDescriptionOutput {
  const errorMsg = errorMessage || "AI analysis could not be completed or some parts are missing.";
  return {
    hardSkillsScore: 0,
    matchingSkills: [],
    missingSkills: [],
    resumeKeyStrengths: "N/A due to error.",
    jobDescriptionKeyRequirements: "N/A due to error.",
    overallQualityScore: 0,
    recruiterTips: [{ category: "General", finding: errorMsg, status: 'negative', suggestion: "Please ensure resume and job description are sufficiently detailed, or try again." }],
    overallFeedback: errorMsg,
    searchabilityScore: 0,
    recruiterTipsScore: 0,
    formattingScore: 0,
    highlightsScore: 0,
    softSkillsScore: 0,
    identifiedSoftSkills: [],
    searchabilityDetails: {
      hasPhoneNumber: false,
      hasEmail: false,
      hasAddress: false,
      jobTitleMatchesJD: false,
      hasWorkExperienceSection: false,
      hasEducationSection: false,
      hasProfessionalSummary: false,
      keywordDensityFeedback: "N/A",
    },
    formattingDetails: [{issue: "General Formatting", recommendation: "Could not assess due to an error or missing data."}],
    atsParsingConfidence: { overall: 0, warnings: ["Could not assess ATS parsing confidence."] },
    atsStandardFormattingComplianceScore: 0,
    standardFormattingIssues: [{ issue: "Standard Formatting", recommendation: "Could not assess standard formatting compliance." }],
    undefinedAcronyms: [],
    quantifiableAchievementDetails: {
      score: 0,
      examplesFound: [],
      areasLackingQuantification: ["Could not assess quantifiable achievements."]
    },
    actionVerbDetails: {
      score: 0,
      strongVerbsUsed: [],
      weakVerbsUsed: ["Could not assess action verbs."],
      overusedVerbs: [],
      suggestedStrongerVerbs: []
    },
    impactStatementDetails: {
      clarityScore: 0,
      unclearImpactStatements: ["Could not assess impact statements."],
      exampleWellWrittenImpactStatements: []
    },
    readabilityDetails: {
      readabilityFeedback: "Could not assess readability."
    }
  };
}


export async function analyzeResumeAndJobDescription(
  input: AnalyzeResumeAndJobDescriptionInput
): Promise<AnalyzeResumeAndJobDescriptionOutput> {
  console.log("[AI FLOW] DIAGNOSTIC: Starting analyzeResumeAndJobDescription with input:", { resumeLength: input.resumeText.length, jdLength: input.jobDescriptionText.length });
  
  // DIAGNOSTIC: Bypassing AI call entirely and returning default error output
  // console.log("[AI FLOW] DIAGNOSTIC: Bypassing AI call and returning default error data.");
  // return getDefaultOutput("Diagnostic mode: AI call bypassed.");

  if (!input.resumeText.trim() || !input.jobDescriptionText.trim()) {
    console.error("[AI FLOW] Error: Resume text or Job Description text is empty.");
    return getDefaultOutput("Resume text or Job Description text cannot be empty.");
  }
  
  let aiResponse;
  try {
    aiResponse = await analyzeResumeAndJobDescriptionPrompt(input);
  } catch (error) {
    console.error("[AI FLOW] Error during AI prompt execution:", error);
    return getDefaultOutput(`An error occurred during AI analysis: ${error instanceof Error ? error.message : String(error)}`);
  }

  console.log("[AI FLOW] Raw AI model output:", JSON.stringify(aiResponse?.output, null, 2));

  if (!aiResponse?.output) {
    console.error("[AI FLOW] AI prompt did not return any parsable output for input:", { resumeLength: input.resumeText.length, jdLength: input.jobDescriptionText.length });
    return getDefaultOutput("AI analysis did not return any parsable output.");
  }

  const output = aiResponse.output;

  return {
    hardSkillsScore: output.hardSkillsScore ?? 0,
    matchingSkills: output.matchingSkills ?? [],
    missingSkills: output.missingSkills ?? [],
    resumeKeyStrengths: output.resumeKeyStrengths ?? "N/A",
    jobDescriptionKeyRequirements: output.jobDescriptionKeyRequirements ?? "N/A",
    overallQualityScore: output.overallQualityScore ?? 0,
    recruiterTips: output.recruiterTips ?? [],
    overallFeedback: output.overallFeedback ?? "Analysis incomplete.",
    
    searchabilityScore: output.searchabilityScore ?? 0,
    recruiterTipsScore: output.recruiterTipsScore ?? 0,
    formattingScore: output.formattingScore ?? 0,
    highlightsScore: output.highlightsScore ?? 0,
    softSkillsScore: output.softSkillsScore ?? 0,
    identifiedSoftSkills: output.identifiedSoftSkills ?? [],
    
    searchabilityDetails: output.searchabilityDetails ?? getDefaultOutput().searchabilityDetails,
    formattingDetails: output.formattingDetails ?? getDefaultOutput().formattingDetails,
    
    atsParsingConfidence: output.atsParsingConfidence ?? getDefaultOutput().atsParsingConfidence,
    atsStandardFormattingComplianceScore: output.atsStandardFormattingComplianceScore ?? 0,
    standardFormattingIssues: output.standardFormattingIssues ?? getDefaultOutput().standardFormattingIssues,
    undefinedAcronyms: output.undefinedAcronyms ?? [],

    quantifiableAchievementDetails: output.quantifiableAchievementDetails ?? getDefaultOutput().quantifiableAchievementDetails,
    actionVerbDetails: output.actionVerbDetails ?? getDefaultOutput().actionVerbDetails,
    impactStatementDetails: output.impactStatementDetails ?? getDefaultOutput().impactStatementDetails,
    readabilityDetails: output.readabilityDetails ?? getDefaultOutput().readabilityDetails,
  };
}

const analyzeResumeAndJobDescriptionPrompt = ai.definePrompt({
  name: 'analyzeResumeAndJobDescriptionPrompt',
  input: {schema: AnalyzeResumeAndJobDescriptionInputSchema},
  output: {schema: AnalyzeResumeAndJobDescriptionOutputSchema},
  config: {
    safetySettings: [ // Relaxed safety settings
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  },
  prompt: `You are an expert resume and job description analyst. Your task is to provide a comprehensive analysis of the given resume against the provided job description.
Evaluate the resume based on the following categories and provide detailed feedback and scores as per the output schema. If some information is insufficient to make a detailed assessment for a specific sub-section, provide default values like 0 for scores, empty arrays for lists, "N/A" for strings, or a default empty object structure for optional nested objects to ensure a valid JSON output according to the schema.

Resume Text:
{{{resumeText}}}

Job Description Text:
{{{jobDescriptionText}}}

Analysis Categories and Instructions for JSON Output Fields:

1.  **Core Skill Match & Quality:**
    *   hardSkillsScore: Number (0-100) for hard skill alignment.
    *   matchingSkills: Array of strings listing skills in both resume and JD.
    *   missingSkills: Array of strings listing crucial skills from JD missing in resume.
    *   resumeKeyStrengths: String summarizing resume's key strengths aligned with JD.
    *   jobDescriptionKeyRequirements: String summarizing key requirements from JD.
    *   overallQualityScore: Optional number (0-100) for overall resume quality against JD.
    *   overallFeedback: String with general overall feedback and summary.

2.  **Category Scores (0-100 for each, optional if not assessable):**
    *   searchabilityScore: For contact info, section headings, job title match, professional summary presence, and keyword density.
    *   recruiterTipsScore: For word count, action verbs, measurable results, tailoring, etc.
    *   formattingScore: For clarity, consistency, length, ATS-friendliness of general formatting.
    *   highlightsScore: For quality and relevance of resume highlights against JD.
    *   softSkillsScore: For identified soft skills relevant to the job.
    *   identifiedSoftSkills: Array of strings listing relevant soft skills found.
    *   atsStandardFormattingComplianceScore: Score for compliance with standard ATS-friendly formatting.

3.  **Detailed Breakdowns (optional if not assessable, ensure valid empty structures if AI cannot populate fully):**
    *   searchabilityDetails (SearchabilityDetailsSchema): Object with booleans (hasPhoneNumber, hasEmail, hasAddress, jobTitleMatchesJD, hasWorkExperienceSection, hasEducationSection, hasProfessionalSummary) and a string for keywordDensityFeedback. If a boolean cannot be determined, default to false. If feedback string cannot be determined, use "N/A".
    *   recruiterTips (Array of RecruiterTipItemSchema): If no specific tips, return an empty array or a single generic tip.
    *   formattingDetails (Array of AtsFormattingIssueSchema): General formatting issues. If none, return empty array.
    *   standardFormattingIssues (Array of AtsFormattingIssueSchema): Specific ATS formatting issues. If none, return empty array.
    *   atsParsingConfidence (AtsParsingConfidenceSchema): Object with optional overall score (0-100) and optional warnings array. If not assessable, provide overall: 0 and empty warnings. Do NOT include a 'sections' sub-object.
    *   undefinedAcronyms: Array of strings. If none, return empty array.

4.  **Content Quality Details (optional if not assessable, ensure valid empty structures if AI cannot populate fully):**
    *   quantifiableAchievementDetails (QuantifiableAchievementDetailsSchema): Object with optional score (0-100), optional examplesFound (array), optional areasLackingQuantification (array). If not assessable, score 0, empty arrays.
    *   actionVerbDetails (ActionVerbDetailsSchema): Object with optional score (0-100), optional strongVerbsUsed (array), optional weakVerbsUsed (array), optional overusedVerbs (array), optional suggestedStrongerVerbs (array of {original, suggestion}). If not assessable, score 0, empty arrays.
    *   impactStatementDetails (ImpactStatementDetailsSchema): Object with optional clarityScore (0-100), optional unclearImpactStatements (array), optional exampleWellWrittenImpactStatements (array). If not assessable, score 0, empty arrays.
    *   readabilityDetails (ReadabilityDetailsSchema): Object with optional fleschKincaidGradeLevel, optional fleschReadingEase, optional readabilityFeedback string. If not assessable, omit numbers or provide "N/A" for feedback.

**IMPORTANT FINAL INSTRUCTION:** Your entire response MUST be a single, valid JSON object that strictly adheres to the AnalyzeResumeAndJobDescriptionOutputSchema. It is CRITICAL that all fields expected by the schema are present, even if their value must be a default like 0, null, an empty array [], an empty object {}, or "N/A" (for optional strings) when specific details cannot be derived from the input. Do NOT omit optional fields; provide their default empty/null/0 state if data is insufficient. Ensure all nested objects also adhere to this, providing their full structure with default/empty values if necessary.
`,
});

const analyzeResumeAndJobDescriptionFlow = ai.defineFlow(
  {
    name: 'analyzeResumeAndJobDescriptionFlow',
    inputSchema: AnalyzeResumeAndJobDescriptionInputSchema,
    outputSchema: AnalyzeResumeAndJobDescriptionOutputSchema,
  },
  analyzeResumeAndJobDescription
);
