import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-alternative-routes.ts';
import '@/ai/flows/detect-train-conflicts.ts';
import '@/ai/flows/generate-re-scheduling-proposals.ts';