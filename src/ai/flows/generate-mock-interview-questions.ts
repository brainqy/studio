'use server';
/**
 * @fileOverview Generates mock interview questions for a given topic or job description.
 *
 * - generateMockInterviewQuestions - A function that handles question generation.
 * - GenerateMockInterviewQuestionsInput - The input type.
 * - GenerateMockInterviewQuestionsOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { GenerateMockInterviewQuestionsInput, GenerateMockInterviewQuestionsOutput, MockInterviewQuestion } from '@/types';

const MockInterviewQuestionSchema = z.object({
  id: z.string().describe("Unique identifier for the question."),
  questionText: z.string().describe("The text of the interview question."),
  category: z.string().optional().describe("Category of the question (e.g., Behavioral, Technical, Situational).")
});

const GenerateMockInterviewQuestionsInputSchema = z.object({
  topic: z.string().describe('The main topic, role, or area for the interview (e.g., "Software Engineering", "Product Management", "Java Backend Developer").'),
  jobDescription: z.string().optional().describe('The full job description text to tailor questions to. If provided, questions will be more specific to the role.'),
  numQuestions: z.number().min(1).max(10).default(5).optional().describe('The desired number of questions to generate (default 5, max 10).'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium').optional().describe('The desired difficulty level of the questions (default medium).'),
});

const GenerateMockInterviewQuestionsOutputSchema = z.object({
  questions: z.array(MockInterviewQuestionSchema).describe("A list of generated mock interview questions."),
});

export async function generateMockInterviewQuestions(
  input: GenerateMockInterviewQuestionsInput
): Promise<GenerateMockInterviewQuestionsOutput> {
  return generateMockInterviewQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMockInterviewQuestionsPrompt',
  input: {schema: GenerateMockInterviewQuestionsInputSchema},
  output: {schema: GenerateMockInterviewQuestionsOutputSchema},
  prompt: `You are an expert Interview Question Generator. Your task is to create a set of diverse and relevant mock interview questions based on the provided criteria.

Topic/Role: {{{topic}}}
{{#if jobDescription}}
Job Description:
{{{jobDescription}}}
{{else}}
No specific job description provided. Generate general questions for the topic/role.
{{/if}}
Number of Questions to Generate: {{{numQuestions}}}
Difficulty Level: {{{difficulty}}}

Instructions:
1.  Generate exactly {{{numQuestions}}} questions.
2.  Ensure questions are appropriate for the specified difficulty level ({{{difficulty}}}).
3.  If a job description is provided, tailor questions to the skills, responsibilities, and technologies mentioned in it.
4.  If no job description, create general questions relevant to the {{{topic}}}.
5.  Include a mix of question types (e.g., behavioral, technical, situational, problem-solving) if appropriate for the topic. Assign a category to each.
6.  Each question should have a unique 'id' (e.g., "q1", "q2").
7.  Ensure 'questionText' is clear and concise.

Output strictly in the JSON format defined by the schema. Ensure each question has an 'id' and 'questionText'.
`,
});

const generateMockInterviewQuestionsFlow = ai.defineFlow(
  {
    name: 'generateMockInterviewQuestionsFlow',
    inputSchema: GenerateMockInterviewQuestionsInputSchema,
    outputSchema: GenerateMockInterviewQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output || !output.questions) {
        throw new Error("AI failed to generate mock interview questions.");
    }
    // Ensure IDs are unique if AI doesn't handle it well
    output.questions = output.questions.map((q, index) => ({
        ...q,
        id: q.id || `gen_q_${index + 1}` 
    }));
    return output;
  }
);