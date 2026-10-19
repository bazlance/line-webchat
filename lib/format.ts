export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatListTime(iso: string) {
  const date = new Date(iso);
  const isToday = date.toDateString() === new Date().toDateString();

  return isToday
    ? formatTime(iso)
    : date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
