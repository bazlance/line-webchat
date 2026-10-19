"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";

type Props = {
  onSend: (text: string) => Promise<void>;
};

export default function MessageInput({ onSend }: Props) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    const value = text.trim();
    if (!value || sending) return;

    setSending(true);
    setError(null);
    try {
      await onSend(value);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    send();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends, Shift+Enter adds a new line
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3">
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <div className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Type a message"
          className="max-h-32 flex-1 resize-none rounded-2xl border border-gray-300 px-4 py-2 text-sm outline-none focus:border-[#06C755]"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="rounded-full bg-[#06C755] px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </form>
  );
}
