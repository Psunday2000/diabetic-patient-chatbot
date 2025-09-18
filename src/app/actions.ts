'use server';

import { analyzeSymptoms } from '@/ai/flows/symptom-analysis';
import { medicalInformationRetrieval } from '@/ai/flows/medical-information-retrieval';
import type { QuickReply, ChatSession, Message } from '@/lib/types';
import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/app/auth/actions';

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
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  const stmt = db.prepare('SELECT * FROM chat_sessions WHERE userId = ? ORDER BY lastActivity DESC');
  const sessionsData = stmt.all(user.uid) as { id: string; userId: string; name: string; startTime: string; lastActivity: string }[];

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
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const insertSession = db.prepare('INSERT INTO chat_sessions (id, userId, name, startTime, lastActivity) VALUES (?, ?, ?, ?, ?)');
  insertSession.run(session.id, user.uid, session.name, session.startTime.toISOString(), session.lastActivity.toISOString());

  const insertMessage = db.prepare('INSERT INTO messages (id, sessionId, text, sender, timestamp, avatar) VALUES (?, ?, ?, ?, ?, ?)');
  for (const message of session.messages) {
    insertMessage.run(message.id, session.id, message.text, message.sender, message.timestamp.toISOString(), message.avatar ? 1 : 0);
  }
  revalidatePath('/chat');
}

export async function addMessageToSession(sessionId: string, message: Message): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  // Verify session belongs to the user before adding a message
  const sessionCheck = db.prepare('SELECT userId FROM chat_sessions WHERE id = ?').get(sessionId) as { userId: string } | undefined;
  if (sessionCheck?.userId !== user.uid) {
    throw new Error('Unauthorized to add message to this session');
  }

  const insertMessage = db.prepare('INSERT INTO messages (id, sessionId, text, sender, timestamp, avatar) VALUES (?, ?, ?, ?, ?, ?)');
  insertMessage.run(message.id, sessionId, message.text, message.sender, message.timestamp.toISOString(), message.avatar ? 1 : 0);

  const updateSession = db.prepare('UPDATE chat_sessions SET lastActivity = ? WHERE id = ?');
  updateSession.run(new Date().toISOString(), sessionId);
  revalidatePath('/chat');
}

export async function updateSessionName(sessionId: string, name: string): Promise<void> {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('User not authenticated');
    }

    const sessionCheck = db.prepare('SELECT userId FROM chat_sessions WHERE id = ?').get(sessionId) as { userId: string } | undefined;
    if (sessionCheck?.userId !== user.uid) {
      throw new Error('Unauthorized to update this session');
    }

    const update = db.prepare('UPDATE chat_sessions SET name = ? WHERE id = ?');
    update.run(name, sessionId);
    revalidatePath('/chat');
}

export async function getProfile() {
  const user = await getCurrentUser();
  if (!user) {
      return null;
  }
  const dbUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.uid) as { id: string; name: string, email: string } | undefined;
  return dbUser;
}

export async function updateProfile(name: string) {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('User not authenticated');
    }
    
    // This would also update firebase auth profile if needed
    // await updateProfile(auth.currentUser, { displayName: name });
    
    const stmt = db.prepare('UPDATE users SET name = ? WHERE id = ?');
    stmt.run(name, user.uid);
    revalidatePath('/profile');
}