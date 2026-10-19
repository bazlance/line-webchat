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
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate font-medium">
                    {user.displayName}
                  </span>
                  <span className="shrink-0 text-xs text-gray-400">
                    {formatListTime(user.lastMessageAt)}
                  </span>
                </div>
                <p className="truncate text-sm text-gray-500">{preview}</p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
