//DiabetesInformationRetrieval flow
'use server';

/**
 * @fileOverview A flow to retrieve information about diabetes based on user queries.
 *
 * - diabetesInformationRetrieval - A function that retrieves information about diabetes.
 * - DiabetesInformationRetrievalInput - The input type for the diabetesInformationRetrieval function.
 * - DiabetesInformationRetrievalOutput - The return type for the diabetesInformationRetrieval function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiabetesInformationRetrievalInputSchema = z.object({
  query: z.string().describe('The user query about diabetes.'),
});

export type DiabetesInformationRetrievalInput = z.infer<
  typeof DiabetesInformationRetrievalInputSchema
>;

const DiabetesInformationRetrievalOutputSchema = z.object({
  answer: z.string().describe('The answer to the user query about diabetes.'),
});

export type DiabetesInformationRetrievalOutput = z.infer<
  typeof DiabetesInformationRetrievalOutputSchema
>;

export async function diabetesInformationRetrieval(
  input: DiabetesInformationRetrievalInput
): Promise<DiabetesInformationRetrievalOutput> {
  return diabetesInformationRetrievalFlow(input);
}

const diabetesInformationRetrievalPrompt = ai.definePrompt({
  name: 'diabetesInformationRetrievalPrompt',
  input: {schema: DiabetesInformationRetrievalInputSchema},
  output: {schema: DiabetesInformationRetrievalOutputSchema},
  prompt: `You are a helpful chatbot assistant that provides information about diabetes. Answer the following question about diabetes to the best of your ability.\n\nQuestion: {{{query}}}`,
});

const diabetesInformationRetrievalFlow = ai.defineFlow(
  {
    name: 'diabetesInformationRetrievalFlow',
    inputSchema: DiabetesInformationRetrievalInputSchema,
    outputSchema: DiabetesInformationRetrievalOutputSchema,
  },
  async input => {
    const {output} = await diabetesInformationRetrievalPrompt(input);
    return output!;
  }
);
