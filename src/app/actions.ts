'use server';

import { analyzeSymptoms } from '@/ai/flows/symptom-analysis';
import { medicalInformationRetrieval } from '@/ai/flows/medical-information-retrieval';
import type { QuickReply, ChatSession, Message } from '@/lib/types';
import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getBotResponse(userInput: string, context: QuickReply['context'], sessionId: string): Promise<string> {
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
    const errorMessage = (typeof error === 'object' && error !== null && 'message' in error) 
      ? (error as {message: string}).message 
      : 'Unknown error occurred';
    return `I'm sorry, I encountered an error processing your request: ${errorMessage}. Please try again.`;
  }
}


export async function getChatSessions(): Promise<ChatSession[]> {
  const stmt = db.prepare('SELECT * FROM chat_sessions ORDER BY lastActivity DESC');
  const sessionsData = stmt.all() as { id: string; name: string; startTime: string; lastActivity: string }[];

  const sessions = sessionsData.map(session => {
    const messagesStmt = db.prepare('SELECT * FROM messages WHERE sessionId = ? ORDER BY timestamp ASC');
    const messagesData = messagesStmt.all(session.id) as { id: string; text: string; sender: 'user' | 'bot'; timestamp: string; avatar: number }[];
    const messages: Message[] = messagesData.map(m => ({
      ...m,
      timestamp: new Date(m.timestamp),
      avatar: Boolean(m.avatar),
    }));
    return {
      ...session,
      startTime: new Date(session.startTime),
      lastActivity: new Date(session.lastActivity),
      messages,
    };
  });
  return sessions;
}


export async function createNewChatSession(session: ChatSession): Promise<void> {
  const insertSession = db.prepare('INSERT INTO chat_sessions (id, name, startTime, lastActivity) VALUES (?, ?, ?, ?)');
  insertSession.run(session.id, session.name, session.startTime.toISOString(), session.lastActivity.toISOString());

  const insertMessage = db.prepare('INSERT INTO messages (id, sessionId, text, sender, timestamp, avatar) VALUES (?, ?, ?, ?, ?, ?)');
  for (const message of session.messages) {
    insertMessage.run(message.id, session.id, message.text, message.sender, message.timestamp.toISOString(), message.avatar ? 1 : 0);
  }
  revalidatePath('/');
}


export async function addMessageToSession(sessionId: string, message: Message): Promise<void> {
  const insertMessage = db.prepare('INSERT INTO messages (id, sessionId, text, sender, timestamp, avatar) VALUES (?, ?, ?, ?, ?, ?)');
  insertMessage.run(message.id, sessionId, message.text, message.sender, message.timestamp.toISOString(), message.avatar ? 1 : 0);

  const updateSession = db.prepare('UPDATE chat_sessions SET lastActivity = ? WHERE id = ?');
  updateSession.run(new Date().toISOString(), sessionId);
  revalidatePath('/');
}

export async function updateSessionName(sessionId: string, name: string): Promise<void> {
    const update = db.prepare('UPDATE chat_sessions SET name = ? WHERE id = ?');
    update.run(name, sessionId);
    revalidatePath('/');
}
