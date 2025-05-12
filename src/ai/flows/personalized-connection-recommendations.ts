
'use server';

/**
 * @fileOverview Provides AI-driven suggestions for alumni connections.
 *
 * - personalizedConnectionRecommendations - A function that suggests alumni connections.
 * - PersonalizedConnectionRecommendationsInput - The input type for the personalizedConnectionRecommendations function.
 * - PersonalizedConnectionRecommendationsOutput - The return type for the personalizedConnectionRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedConnectionRecommendationsInputSchema = z.object({
  userProfile: z
    .string()
    .describe('The user profile including skills, experience, and interests.'),
  careerInterests: z.string().describe('The career interests of the user.'),
});
export type PersonalizedConnectionRecommendationsInput = z.infer<
  typeof PersonalizedConnectionRecommendationsInputSchema
>;

const PersonalizedConnectionRecommendationsOutputSchema = z.object({
  suggestedConnections: z
    .array(z.string())
    .describe('A list of suggested alumni connection names.'),
  reasoning: z
    .string()
    .describe('The AI reasoning behind these connection suggestions.'),
});
export type PersonalizedConnectionRecommendationsOutput = z.infer<
  typeof PersonalizedConnectionRecommendationsOutputSchema
>;

export async function personalizedConnectionRecommendations(
  input: PersonalizedConnectionRecommendationsInput
): Promise<PersonalizedConnectionRecommendationsOutput> {
  return personalizedConnectionRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedConnectionRecommendationsPrompt',
  input: {schema: PersonalizedConnectionRecommendationsInputSchema},
  output: {schema: PersonalizedConnectionRecommendationsOutputSchema},
  prompt: `You are an AI assistant designed to provide personalized connection recommendations to users based on their profile and career interests.

  Given the following user profile and career interests, suggest a list of alumni connections that would be relevant for networking and mentorship opportunities. Explain the reasoning behind each suggestion.

  User Profile: {{{userProfile}}}
  Career Interests: {{{careerInterests}}}

  Format the output as a JSON object with 'suggestedConnections' (an array of alumni names) and 'reasoning' (explanation for each suggestion).
  `,
});

const personalizedConnectionRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedConnectionRecommendationsFlow',
    inputSchema: PersonalizedConnectionRecommendationsInputSchema,
    outputSchema: PersonalizedConnectionRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
