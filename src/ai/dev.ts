import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-resume-and-job-description.ts';
import '@/ai/flows/calculate-match-score.ts';
import '@/ai/flows/suggest-resume-improvements.ts';
import '@/ai/flows/personalized-connection-recommendations.ts';