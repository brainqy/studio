import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-resume-and-job-description.ts';
import '@/ai/flows/calculate-match-score.ts';
import '@/ai/flows/suggest-resume-improvements.ts';

import '@/ai/flows/generate-resume-variant.ts';
import '@/ai/flows/generate-cover-letter.ts';
import '@/ai/flows/personalized-job-recommendations.ts';
import '@/ai/flows/suggest-dynamic-skills.ts';
import '@/ai/flows/generate-ai-blog-post.ts';
import '@/ai/flows/generate-mock-interview-questions.ts';
import '@/ai/flows/evaluate-interview-answer.ts';
import '@/ai/flows/generate-overall-interview-feedback.ts';
