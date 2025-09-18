'use server';

import { analyzeSymptoms } from '@/ai/flows/symptom-analysis';
import { medicalInformationRetrieval } from '@/ai/flows/medical-information-retrieval';
import type { QuickReply } from '@/lib/types';

export async function getBotResponse(userInput: string, context: QuickReply['context']): Promise<string> {
  try {
    if (context === 'symptoms') {
      const response = await analyzeSymptoms({ symptomsDescription: userInput });
      return response.riskAssessment;
    } else {
      const response = await medicalInformationRetrieval({ query: userInput });
      return response.answer;
    }
  } catch (error) {
    console.error("Error getting bot response:", error);
    // Check if error is an object and has a message property
    const errorMessage = (typeof error === 'object' && error !== null && 'message' in error) 
      ? (error as {message: string}).message 
      : 'Unknown error occurred';
    return `I'm sorry, I encountered an error processing your request: ${errorMessage}. Please try again.`;
  }
}
