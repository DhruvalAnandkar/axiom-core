/* Convert coach markdown into natural speech text: no "hashtag", no "dash",
   no asterisks — just clean sentences a TTS voice reads well. */

const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}✅❌✔✖]/gu;

export function markdownToSpeech(markdown) {
  if (!markdown) return "";
  let t = markdown;

  // Structure first: rules, headings, list markers, emphasis, code, links.
  t = t.replace(/^[ \t]*(-{3,}|\*{3,}|_{3,})[ \t]*$/gm, " ");
  t = t.replace(/^#{1,6}\s+(.+)$/gm, "$1.");
  t = t.replace(/^[ \t]*[-*+]\s+/gm, "");
  t = t.replace(/^[ \t]*(\d+)[.)]\s+/gm, "$1: ");
  t = t.replace(/\*\*([^*]+)\*\*/g, "$1");
  t = t.replace(/\*([^*]+)\*/g, "$1");
  t = t.replace(/__([^_]+)__/g, "$1");
  t = t.replace(/_([^_]+)_/g, "$1");
  t = t.replace(/`{1,3}([^`]*)`{1,3}/g, "$1");
  t = t.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
  t = t.replace(/^>\s?/gm, "");

  // Symbols the voice mangles.
  t = t.replace(EMOJI_RE, "");
  t = t.replace(/(\d+(?:\.\d+)?)\s*°/g, "$1 degrees");
  t = t.replace(/°/g, " degrees");
  t = t.replace(/÷/g, " divided by ");
  t = t.replace(/×/g, " times ");
  t = t.replace(/~\s*/g, "about ");
  t = t.replace(/[·•]/g, ", ");
  t = t.replace(/\s*[—–]\s*/g, ", ");

  // Long decimals read as digit soup — round to one decimal place.
  t = t.replace(/(\d+\.\d{2,})/g, (_, n) => String(Math.round(parseFloat(n) * 10) / 10));
  // Coordinate pairs become "x 16, y 9.4".
  t = t.replace(/\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)\)/g, "x $1, y $2");

  // Whitespace + sentence flow: blank lines become pauses (periods).
  t = t.replace(/[ \t]+/g, " ");
  t = t.replace(/\s*\n+\s*/g, ". ");
  t = t.replace(/\.\s*\.+/g, ".");
  t = t.replace(/,\s*\./g, ".");
  t = t.replace(/\s+([.,])/g, "$1");

  return t.trim();
}
