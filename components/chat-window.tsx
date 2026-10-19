"use client";

import { useEffect, useRef } from "react";
import Avatar from "@/components/avatar";
import MessageInput from "@/components/message-input";
import { formatTime } from "@/lib/format";
import type { ChatMessage, ChatUser } from "@/lib/types";

type Props = {
  user: ChatUser;
  messages: ChatMessage[];
  onSend: (text: string) => Promise<void>;
  onBack: () => void;
};

export default function ChatWindow({ user, messages, onSend, onBack }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, user.id]);

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-gray-500 md:hidden"
        >
          ← Back
        </button>
        <Avatar
          name={user.displayName}
          pictureUrl={user.pictureUrl}
          size={36}
        />
        <h2 className="truncate font-medium">{user.displayName}</h2>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto bg-[#8cabd9]/20 p-4">
        {messages.map((message) => {
          const outgoing = message.direction === "OUTGOING";

          return (
            <div
              key={message.id}
              className={`flex items-end gap-2 ${outgoing ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`max-w-[75%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2 text-sm ${
                  outgoing
                    ? "bg-[#06C755] text-white"
                    : "bg-white text-gray-900"
                } ${message.type !== "text" ? "italic opacity-80" : ""}`}
              >
                {message.text}
              </div>
              <span className="shrink-0 text-[10px] text-gray-500">
                {formatTime(message.createdAt)}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <MessageInput onSend={onSend} />
    </div>
  );
}
