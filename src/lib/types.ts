export type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  avatar?: boolean; // Optional: true if this bot message should show an avatar
};

export type QuickReply = {
  text: string;
  context: 'symptoms' | 'general_info';
};
