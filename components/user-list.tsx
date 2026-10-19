import Avatar from "@/components/avatar";
import { formatListTime } from "@/lib/format";
import type { ChatUser } from "@/lib/types";

type Props = {
  users: ChatUser[];
  selectedId: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
};

export default function UserList({
  users,
  selectedId,
  loading,
  onSelect,
}: Props) {
  if (loading) {
    return <p className="p-4 text-sm text-gray-500">Loading...</p>;
  }

  if (users.length === 0) {
    return (
      <p className="p-4 text-sm text-gray-500">
        No conversations yet. Send a message to the LINE OA to start one.
      </p>
    );
  }

  return (
    <ul>
      {users.map((user) => {
        const last = user.lastMessage;
        const preview = last
          ? `${last.direction === "OUTGOING" ? "You: " : ""}${last.text}`
          : "";
        // the open conversation is being read, so don't show a badge for it
        const unread = user.id === selectedId ? 0 : user.unreadCount;

        return (
          <li key={user.id}>
            <button
              type="button"
              onClick={() => onSelect(user.id)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 ${
                user.id === selectedId ? "bg-gray-100" : ""
              }`}
            >
              <Avatar name={user.displayName} pictureUrl={user.pictureUrl} />
              <div className="min-w-0 flex-1">
                <span className="block truncate font-medium">
                  {user.displayName}
                </span>
                <p
                  className={`truncate text-sm ${
                    unread > 0 ? "font-medium text-gray-900" : "text-gray-500"
                  }`}
                >
                  {preview}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-xs text-gray-400">
                  {formatListTime(user.lastMessageAt)}
                </span>
                {unread > 0 && (
                  <span className="min-w-5 rounded-full bg-[#06C755] px-1.5 text-center text-xs leading-5 font-semibold text-white">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
