'use server';

/**
 * @fileOverview Analyzes a resume and job description to identify matching skills, experience, and provide detailed feedback across various categories like searchability, recruiter tips, and formatting.
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
  jobTitleMatchesJD: z.boolean().describe("Job title in resume aligns with or is found in the job description."),
  hasWorkExperienceSection: z.boolean().describe("A distinct work experience section was identified."),
  hasEducationSection: z.boolean().describe("A distinct education section was identified."),
});

const RecruiterTipItemSchema = z.object({
    category: z.string().describe("Category of the tip (e.g., Word Count, Action Verbs, Measurable Results)."),
    finding: z.string().describe("The specific finding or observation related to this tip."),
    status: z.enum(['positive', 'neutral', 'negative']).describe("Assessment of the finding (positive, neutral, negative)."),
    suggestion: z.string().optional().describe("A brief suggestion for improvement if status is neutral or negative."),
});

const FormattingItemSchema = z.object({
    aspect: z.string().describe("Formatting aspect (e.g., Clarity, Consistency, Length, Bullet Points)."),
    feedback: z.string().describe("Feedback on this aspect."),
    status: z.enum(['positive', 'neutral', 'negative']).describe("Status of this formatting aspect."),
});


const AnalyzeResumeAndJobDescriptionOutputSchema = z.object({
  // Scores for the progress bars on the left
  searchabilityScore: z.number().min(0).max(100).describe("Overall searchability score (0-100). Based on presence of contact info, section headings, and job title match."),
  recruiterTipsScore: z.number().min(0).max(100).describe("Overall score based on recruiter tips (0-100), such as word count, action verbs, and measurable results."),
  formattingScore: z.number().min(0).max(100).describe("Overall formatting score (0-100), considering clarity, consistency, and length."),
  highlightsScore: z.number().min(0).max(100).describe("Score for the quality and relevance of resume highlights (0-100) against the job description."),
  hardSkillsScore: z.number().min(0).max(100).describe("Score for hard skill alignment with the job description (0-100)."),
  softSkillsScore: z.number().min(0).max(100).describe("Score for identified soft skills relevant to the job (0-100)."),

  // Detailed breakdown for the right panel
  searchabilityDetails: SearchabilityDetailsSchema.describe("Detailed breakdown of searchability aspects."),
  recruiterTips: z.array(RecruiterTipItemSchema).describe("Detailed breakdown of recruiter tips and assessments."),
  formattingDetails: z.array(FormattingItemSchema).describe("Detailed breakdown of formatting aspects and feedback."),
  
  // Existing fields (can be part of highlights or skill scores logic)
  matchingSkills: z.array(z.string()).describe('Skills that appear in both the resume and the job description. These contribute to Hard Skills Score.'),
  missingSkills: z.array(z.string()).describe('Skills crucial for the job description that are missing from the resume. These impact Hard Skills Score negatively.'),
  identifiedSoftSkills: z.array(z.string()).optional().describe('Soft skills identified in the resume that are relevant to the job description. These contribute to Soft Skills Score.'),
  resumeKeyStrengths: z.string().describe('Key strengths and experiences highlighted from the resume that align with the job. This feeds into Highlights Score.'),
  jobDescriptionKeyRequirements: z.string().describe('Key requirements and critical expectations extracted from the job description for comparison.'),
  
  overallQualityScore: z.number().min(0).max(100).optional().describe('An overall quality score (0-100) for the resume against the job description, considering content, structure, and alignment beyond just keywords.')
});

export type AnalyzeResumeAndJobDescriptionOutput = z.infer<typeof AnalyzeResumeAndJobDescriptionOutputSchema>;

export async function analyzeResumeAndJobDescription(
  input: AnalyzeResumeAndJobDescriptionInput
): Promise<AnalyzeResumeAndJobDescriptionOutput> {
  return analyzeResumeAndJobDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeResumeAndJobDescriptionPrompt',
  input: {schema: AnalyzeResumeAndJobDescriptionInputSchema},
  output: {schema: AnalyzeResumeAndJobDescriptionOutputSchema},
  prompt: `You are an expert resume and job description analyst. Your task is to provide a comprehensive analysis of the given resume against the provided job description.
Evaluate the resume based on the following categories and provide detailed feedback and scores as per the output schema.

Resume Text:
{{{resumeText}}}

Job Description Text:
{{{jobDescriptionText}}}

Analysis Categories:

1.  **Searchability (searchabilityScore, searchabilityDetails):**
    *   Does the resume contain a phone number? (hasPhoneNumber: boolean)
    *   Does the resume contain an email address? (hasEmail: boolean)
    *   Does the resume's mentioned job title (or a summary of experience) align with the job title in the job description? (jobTitleMatchesJD: boolean)
    *   Is there a clear work experience section? (hasWorkExperienceSection: boolean)
    *   Is there a clear education section? (hasEducationSection: boolean)
    *   Calculate a searchabilityScore (0-100) based on the presence and clarity of these elements.

2.  **Recruiter Tips (recruiterTipsScore, recruiterTips):**
    *   Word Count: Provide the total word count (wordCount: number) and feedback (wordCountFeedback: string - e.g., "Good", "Too short - aim for X words", "Too long - aim for Y words").
    *   Action Verbs: Assess the use of action verbs.
    *   Measurable Results: Check for quantifiable achievements.
    *   Clarity and Conciseness: General assessment.
    *   Tailoring: How well is the resume tailored to the JD?
    *   Provide a list of specific recruiterTipItems, each with a category (e.g., Word Count, Action Verbs), the finding, its status (positive, neutral, negative), and a suggestion if applicable.
    *   Calculate a recruiterTipsScore (0-100) based on these factors.

3.  **Formatting (formattingScore, formattingDetails):**
    *   Assess clarity, readability, consistency (fonts, dates, bullet points), and overall layout.
    *   Check for appropriate length and conciseness.
    *   Provide a list of formattingItems, each with the aspect (e.g., Clarity, Consistency, Length), feedback, and status (positive, neutral, negative).
    *   Calculate a formattingScore (0-100).

4.  **Highlights (highlightsScore, resumeKeyStrengths, jobDescriptionKeyRequirements):**
    *   Extract key strengths and experiences from the resume that align with the job description (resumeKeyStrengths: string).
    *   Extract key requirements from the job description (jobDescriptionKeyRequirements: string).
    *   Calculate a highlightsScore (0-100) based on the alignment and impact of these highlights.

5.  **Hard Skills (hardSkillsScore, matchingSkills, missingSkills):**
    *   Identify skills present in both the resume and job description (matchingSkills: string[]).
    *   Identify crucial skills from the job description missing in the resume (missingSkills: string[]).
    *   Calculate a hardSkillsScore (0-100) based on this skill alignment.

6.  **Soft Skills (softSkillsScore, identifiedSoftSkills):**
    *   Identify relevant soft skills mentioned or implied in the resume (identifiedSoftSkills: string[]).
    *   Calculate a softSkillsScore (0-100) based on the presence and relevance of these soft skills.

7.  **Overall Quality Score (overallQualityScore):**
    *   Provide an optional overallQualityScore (0-100) reflecting the resume's general quality and alignment for this specific job, considering all factors.

Ensure all boolean fields in searchabilityDetails are set.
Ensure all score fields (searchabilityScore, recruiterTipsScore, etc.) are numbers between 0 and 100.
Provide specific items for recruiterTips and formattingDetails arrays.
Extract matchingSkills, missingSkills, identifiedSoftSkills, resumeKeyStrengths, and jobDescriptionKeyRequirements.
Output strictly in the JSON format defined by the schema.
`,
});

const analyzeResumeAndJobDescriptionFlow = ai.defineFlow(
  {
    name: 'analyzeResumeAndJobDescriptionFlow',
    inputSchema: AnalyzeResumeAndJobDescriptionInputSchema,
    outputSchema: AnalyzeResumeAndJobDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("AI failed to generate resume analysis.");
    }
    // Basic validation or default setting for optional array fields if AI omits them when empty
    return {
        ...output,
        recruiterTips: output.recruiterTips || [],
        formattingDetails: output.formattingDetails || [],
        matchingSkills: output.matchingSkills || [],
        missingSkills: output.missingSkills || [],
        identifiedSoftSkills: output.identifiedSoftSkills || [],
    };
  }
);

