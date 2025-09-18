'use server';

/**
 * @fileOverview A flow to retrieve information about medical topics based on user queries.
 *
 * - medicalInformationRetrieval - A function that retrieves information about medical topics.
 * - MedicalInformationRetrievalInput - The input type for the medicalInformationRetrieval function.
 * - MedicalInformationRetrievalOutput - The return type for the medicalInformationRetrieval function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MedicalInformationRetrievalInputSchema = z.object({
  query: z.string().describe('The user query about a medical topic.'),
});

export type MedicalInformationRetrievalInput = z.infer<
  typeof MedicalInformationRetrievalInputSchema
>;

const MedicalInformationRetrievalOutputSchema = z.object({
  answer: z.string().describe('The answer to the user query about the medical topic.'),
});

export type MedicalInformationRetrievalOutput = z.infer<
  typeof MedicalInformationRetrievalOutputSchema
>;

export async function medicalInformationRetrieval(
  input: MedicalInformationRetrievalInput
): Promise<MedicalInformationRetrievalOutput> {
  return medicalInformationRetrievalFlow(input);
}

const medicalInformationRetrievalPrompt = ai.definePrompt({
  name: 'medicalInformationRetrievalPrompt',
  input: {schema: MedicalInformationRetrievalInputSchema},
  output: {schema: MedicalInformationRetrievalOutputSchema},
  prompt: `You are a helpful chatbot assistant that provides information about general medical topics. Answer the following question to the best of your ability. Do not provide medical advice, only general information.\n\nQuestion: {{{query}}}`,
});

const medicalInformationRetrievalFlow = ai.defineFlow(
  {
    name: 'medicalInformationRetrievalFlow',
    inputSchema: MedicalInformationRetrievalInputSchema,
    outputSchema: MedicalInformationRetrievalOutputSchema,
  },
  async input => {
    const {output} = await medicalInformationRetrievalPrompt(input);
    return output!;
  }
);
