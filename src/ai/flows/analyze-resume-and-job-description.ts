
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
  hasPhoneNumber: z.boolean().describe("Resume contains a phone number."),
  hasEmail: z.boolean().describe("Resume contains an email address."),
  hasAddress: z.boolean().optional().describe("Resume contains a physical address."),
  jobTitleMatchesJD: z.boolean().describe("Job title in resume aligns with or is found in the job description."),
  hasWorkExperienceSection: z.boolean().describe("A distinct work experience section was identified."),
  hasEducationSection: z.boolean().describe("A distinct education section was identified."),
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
  // Core Scores (were present in simplified version)
  hardSkillsScore: z.number().min(0).max(100).describe("Score for hard skill alignment with the job description (0-100)."),
  matchingSkills: z.array(z.string()).describe('Skills that appear in both the resume and the job description. These contribute to Hard Skills Score.'),
  missingSkills: z.array(z.string()).describe('Skills crucial for the job description that are missing from the resume. These impact Hard Skills Score negatively.'),
  resumeKeyStrengths: z.string().describe('Key strengths and experiences highlighted from the resume that align with the job. This feeds into Highlights Score.'),
  jobDescriptionKeyRequirements: z.string().describe('Key requirements and critical expectations extracted from the job description for comparison.'),
  overallQualityScore: z.number().min(0).max(100).optional().describe('An overall quality score (0-100) for the resume against the job description, considering content, structure, and alignment beyond just keywords.'),
  recruiterTips: z.array(RecruiterTipItemSchema).describe("Detailed breakdown of recruiter tips and assessments."),
  overallFeedback: z.string().optional().describe("General overall feedback and summary of the resume's effectiveness for this job."),

  // Scores for the progress bars on the left (many were present before, ensuring they are here)
  searchabilityScore: z.number().min(0).max(100).optional().describe("Overall searchability score (0-100). Based on presence of contact info, section headings, and job title match."),
  recruiterTipsScore: z.number().min(0).max(100).optional().describe("Overall score based on recruiter tips (0-100), such as word count, action verbs, and measurable results."),
  formattingScore: z.number().min(0).max(100).optional().describe("Overall formatting score (0-100), considering clarity, consistency, and length."),
  highlightsScore: z.number().min(0).max(100).optional().describe("Score for the quality and relevance of resume highlights (0-100) against the job description."),
  softSkillsScore: z.number().min(0).max(100).optional().describe("Score for identified soft skills relevant to the job (0-100)."),
  identifiedSoftSkills: z.array(z.string()).optional().describe('Soft skills identified in the resume that are relevant to the job description. These contribute to Soft Skills Score.'),
  
  // Detailed breakdown for the right panel
  searchabilityDetails: SearchabilityDetailsSchema.optional().describe("Detailed breakdown of searchability aspects."),
  formattingDetails: z.array(AtsFormattingIssueSchema).optional().describe("Detailed breakdown of formatting aspects and feedback, renamed from formattingItems to match type."), // Reused AtsFormattingIssueSchema for consistency
  
  // ATS Friendliness
  atsParsingConfidence: AtsParsingConfidenceSchema.optional().describe("Confidence scores for ATS parsing."),
  atsStandardFormattingComplianceScore: z.number().min(0).max(100).optional().describe("Score for compliance with standard ATS-friendly formatting."),
  standardFormattingIssues: z.array(AtsFormattingIssueSchema).optional().describe("Specific standard formatting issues identified."),
  undefinedAcronyms: z.array(z.string()).optional().describe("Acronyms used without prior definition."),

  // Content Quality Details
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
    resumeKeyStrengths: "N/A",
    jobDescriptionKeyRequirements: "N/A",
    overallQualityScore: 0,
    recruiterTips: [{ category: "General", finding: errorMsg, status: 'negative', suggestion: "Please ensure resume and job description are sufficiently detailed." }],
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
    formattingDetails: [{issue: "Overall Formatting", recommendation: "Could not assess due to an error or missing data."}],
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
  console.log("[AI FLOW] Starting analyzeResumeAndJobDescription with input:", { resumeLength: input.resumeText.length, jdLength: input.jobDescriptionText.length });

  if (!input.resumeText.trim() || !input.jobDescriptionText.trim()) {
    console.error("[AI FLOW] Error: Resume text or Job Description text is empty.");
    return getDefaultOutput("Resume text or Job Description text cannot be empty.");
  }
  
  let aiResponse;
  try {
    // The direct call to analyzeResumeAndJobDescriptionPrompt is made here as analyzeResumeAndJobDescriptionFlow
    // was a wrapper. This is fine.
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

  // Construct the full object, providing defaults for any missing optional fields
  // This ensures the returned object always matches the schema.
  return {
    hardSkillsScore: output.hardSkillsScore ?? 0,
    matchingSkills: output.matchingSkills ?? [],
    missingSkills: output.missingSkills ?? [],
    resumeKeyStrengths: output.resumeKeyStrengths ?? "N/A",
    jobDescriptionKeyRequirements: output.jobDescriptionKeyRequirements ?? "N/A",
    overallQualityScore: output.overallQualityScore ?? 0,
    recruiterTips: output.recruiterTips ?? [],
    overallFeedback: output.overallFeedback ?? "N/A",
    
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
    safetySettings: [ 
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  },
  prompt: `You are an expert resume and job description analyst. Your task is to provide a comprehensive analysis of the given resume against the provided job description.
Evaluate the resume based on the following categories and provide detailed feedback and scores as per the output schema. If some information is insufficient to make a detailed assessment for a specific sub-section, indicate "Insufficient information to assess" in string fields or use default values like 0 for scores or empty arrays for lists in that sub-section.

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

2.  **Category Scores (0-100 for each):**
    *   searchabilityScore: For contact info, section headings, job title match, professional summary presence, and keyword density.
    *   recruiterTipsScore: For word count, action verbs, measurable results, tailoring, etc.
    *   formattingScore: For clarity, consistency, length, ATS-friendliness of general formatting.
    *   highlightsScore: For quality and relevance of resume highlights against JD.
    *   softSkillsScore: For identified soft skills relevant to the job.
    *   identifiedSoftSkills: Array of strings listing relevant soft skills found.
    *   atsStandardFormattingComplianceScore: Score for compliance with standard ATS-friendly formatting (fonts, no tables for layout, etc.).

3.  **Detailed Breakdowns:**
    *   searchabilityDetails: Object with booleans for hasPhoneNumber, hasEmail, hasAddress, jobTitleMatchesJD, hasWorkExperienceSection, hasEducationSection, hasProfessionalSummary, and a string for keywordDensityFeedback.
    *   recruiterTips: Array of RecruiterTipItemSchema objects.
    *   formattingDetails: Array of AtsFormattingIssueSchema objects (feedback on clarity, consistency, length etc. from a general perspective).
    *   standardFormattingIssues: Array of AtsFormattingIssueSchema objects (specific ATS formatting issues like font choice, use of tables for layout, special characters).
    *   atsParsingConfidence: Object with optional overall score (0-100) and optional warnings array. Do NOT include a 'sections' sub-object here.
    *   undefinedAcronyms: Array of strings listing acronyms used without prior definition.

4.  **Content Quality Details:**
    *   quantifiableAchievementDetails: Object with optional score (0-100), optional examplesFound (array of strings), and optional areasLackingQuantification (array of strings).
    *   actionVerbDetails: Object with optional score (0-100), optional strongVerbsUsed (array of strings), optional weakVerbsUsed (array of strings), optional overusedVerbs (array of strings), and optional suggestedStrongerVerbs (array of {original: string, suggestion: string}).
    *   impactStatementDetails: Object with optional clarityScore (0-100), optional unclearImpactStatements (array of strings for statements that could be clearer), and optional exampleWellWrittenImpactStatements (array of strings for good statements found).
    *   readabilityDetails: Object with optional fleschKincaidGradeLevel (number), optional fleschReadingEase (number), and optional readabilityFeedback (string).

**IMPORTANT FINAL INSTRUCTION:** Your entire response MUST be a single, valid JSON object that strictly adheres to the AnalyzeResumeAndJobDescriptionOutputSchema. If you cannot determine a value for an optional field or a sub-field within an optional object due to insufficient information in the resume or job description, either omit the optional field/sub-field, or use a sensible default (e.g., 0 for scores, empty array [] for lists of strings/objects, "N/A" or "Insufficient information to assess" for string fields, or a default empty object for optional object fields as defined in the schema's defaults). Do NOT invent information. Ensure all required fields in the schema are present in your JSON output.
`,
});

// The flow definition remains for Genkit's system, but the exported function now calls the prompt directly.
const analyzeResumeAndJobDescriptionFlow = ai.defineFlow(
  {
    name: 'analyzeResumeAndJobDescriptionFlow',
    inputSchema: AnalyzeResumeAndJobDescriptionInputSchema,
    outputSchema: AnalyzeResumeAndJobDescriptionOutputSchema,
  },
  analyzeResumeAndJobDescription // Use the refactored function which now calls the prompt and handles output
);
