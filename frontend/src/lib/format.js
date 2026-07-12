export function truncate(text, max = 120) {
  if (!text || text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
