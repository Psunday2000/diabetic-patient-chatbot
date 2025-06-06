'use server';
/**
 * @fileOverview Analyzes user-described symptoms to assess potential diabetes risk.
 *
 * - analyzeSymptoms - Analyzes symptoms to determine diabetes risk.
 * - AnalyzeSymptomsInput - Input for the analyzeSymptoms function.
 * - AnalyzeSymptomsOutput - Output for the analyzeSymptoms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSymptomsInputSchema = z.object({
  symptomsDescription: z
    .string()
    .describe('A detailed description of the symptoms experienced by the user.'),
});

export type AnalyzeSymptomsInput = z.infer<typeof AnalyzeSymptomsInputSchema>;

const AnalyzeSymptomsOutputSchema = z.object({
  diabetesRiskAssessment: z
    .string()
    .describe(
      'An assessment of whether the described symptoms indicate a potential risk of diabetes, along with recommendations.'
    ),
});

export type AnalyzeSymptomsOutput = z.infer<typeof AnalyzeSymptomsOutputSchema>;

export async function analyzeSymptoms(
  input: AnalyzeSymptomsInput
): Promise<AnalyzeSymptomsOutput> {
  return analyzeSymptomsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diabetesSymptomAnalysisPrompt',
  input: {schema: AnalyzeSymptomsInputSchema},
  output: {schema: AnalyzeSymptomsOutputSchema},
  prompt: `You are a medical assistant specializing in diabetes. A patient will describe their symptoms to you, and you will use that information to provide a preliminary assessment of whether their symptoms could be related to diabetes. You will make a determination as to the likelihood of the symptoms being related to diabetes, and provide recommendations for next steps, such as consulting a healthcare professional.  Do not provide a diagnosis, only provide a risk assessment based on the symptoms provided.

Symptoms: {{{symptomsDescription}}}`,
});

const analyzeSymptomsFlow = ai.defineFlow(
  {
    name: 'analyzeSymptomsFlow',
    inputSchema: AnalyzeSymptomsInputSchema,
    outputSchema: AnalyzeSymptomsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
