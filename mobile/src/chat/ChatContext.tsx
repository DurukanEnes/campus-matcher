import { createContext, useContext, useMemo, useRef, useState, type PropsWithChildren } from "react";
import type { ChatMessage } from "./chatRules";

// Mock message store for WBS-6.2a: the messages sent in the app, kept per join request
// while the app runs. WBS-6.2b replaces it with the WebSocket chat service (WBS-6.1).

type ChatContextValue = {
  sentMessages: (requestId: string) => ChatMessage[];
  addMessage: (requestId: string, text: string, time: string) => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

const noMessages: ChatMessage[] = [];

export function ChatProvider({ children }: PropsWithChildren) {
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const nextId = useRef(1);

  const value = useMemo<ChatContextValue>(
    () => ({
      sentMessages: (requestId) => messages[requestId] ?? noMessages,
      addMessage: (requestId, text, time) => {
        const message = { id: `message-${nextId.current++}`, text, mine: true, time };
        setMessages((current) => ({ ...current, [requestId]: [...(current[requestId] ?? []), message] }));
      },
    }),
    [messages],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextValue {
  const value = useContext(ChatContext);
  if (!value) throw new Error("useChat must be used inside a ChatProvider");
  return value;
}
