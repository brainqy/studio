'use server';

/**
 * @fileOverview Analyzes a resume and job description to identify matching skills and experience.
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

const AnalyzeResumeAndJobDescriptionOutputSchema = z.object({
  matchingSkills: z.array(z.string()).describe('Skills that appear in both the resume and the job description.'),
  missingSkills: z.array(z.string()).describe('Skills that appear in the job description but not in the resume.'),
  resumeHighlights: z.string().describe('Key strengths and experiences highlighted from the resume.'),
  jobDescriptionHighlights: z.string().describe('Key requirements and expectations extracted from the job description.'),
  matchScore: z.number().describe('A numerical score (0-100) indicating the alignment between the resume and the job description.'),
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
  prompt: `You are a resume analysis expert. Analyze the following resume and job description to identify matching skills, missing skills, and overall alignment.  Provide a match score between 0 and 100.

Resume:
{{{resumeText}}}

Job Description:
{{{jobDescriptionText}}}

Output in JSON format:
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
    return output!;
  }
);
