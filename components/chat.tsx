"use client";

import { useEffect, useState } from "react";
import ChatWindow from "@/components/chat-window";
import UserList from "@/components/user-list";
import type { ChatMessage, ChatUser } from "@/lib/types";

const POLL_INTERVAL = 3000;

export default function Chat() {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      try {
        const res = await fetch("/api/users");
        if (!res.ok) return;
        const data: ChatUser[] = await res.json();
        if (!cancelled) setUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoadingUsers(false);
      }
    }

    loadUsers();
    const timer = setInterval(() => {
      if (!document.hidden) loadUsers();
    }, POLL_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;

    async function loadMessages() {
      try {
        const res = await fetch(`/api/users/${selectedId}/messages`);
        if (!res.ok) return;
        const data: ChatMessage[] = await res.json();
        if (!cancelled) setMessages(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadMessages();
    const timer = setInterval(() => {
      if (!document.hidden) loadMessages();
    }, POLL_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [selectedId]);

  function selectUser(id: string) {
    if (id === selectedId) return;
    setMessages([]);
    setSelectedId(id);
  }

  async function sendMessage(text: string) {
    if (!selectedId) return;

    const res = await fetch(`/api/users/${selectedId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error ?? "Failed to send message");
    }

    const message: ChatMessage = await res.json();
    setMessages((prev) => [...prev, message]);
    setUsers((prev) =>
      prev
        .map((user) =>
          user.id === message.lineUserId
            ? {
                ...user,
                lastMessage: message,
                lastMessageAt: message.createdAt,
              }
            : user,
        )
        .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt)),
    );
  }

  const selectedUser = users.find((user) => user.id === selectedId) ?? null;

  return (
    <div className="flex h-dvh">
      <aside
        className={`w-full flex-col border-r border-gray-200 md:flex md:w-80 ${
          selectedUser ? "hidden" : "flex"
        }`}
      >
        <header className="border-b border-gray-200 px-4 py-4">
          <h1 className="text-lg font-semibold">LINE OA Webchat</h1>
        </header>
        <div className="flex-1 overflow-y-auto">
          <UserList
            users={users}
            selectedId={selectedId}
            loading={loadingUsers}
            onSelect={selectUser}
          />
        </div>
      </aside>

      <main className={`flex-1 ${selectedUser ? "block" : "hidden md:block"}`}>
        {selectedUser ? (
          <ChatWindow
            user={selectedUser}
            messages={messages}
            onSend={sendMessage}
            onBack={() => setSelectedId(null)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            Select a conversation
          </div>
        )}
      </main>
    </div>
  );
}
