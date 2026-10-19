export type Direction = "INCOMING" | "OUTGOING";

export type ChatMessage = {
  id: string;
  lineUserId: string;
  direction: Direction;
  type: string;
  text: string;
  createdAt: string;
};

export type ChatUser = {
  id: string;
  displayName: string;
  pictureUrl: string | null;
  lastMessageAt: string;
  lastMessage: ChatMessage | null;
};
