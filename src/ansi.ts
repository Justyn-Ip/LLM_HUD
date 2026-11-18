import stringWidth from "string-width";
import stripAnsi from "strip-ansi";
import emojiRegex from "emoji-regex";

const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" });
const emoji = emojiRegex();

export function strip(input: string): string {
  return stripAnsi(input);
}

export function visibleLen(input: string): number {
  // Keep the CJS/Node 18 width implementation, but use current emoji data and zero-width marks.
  const text = strip(input).replace(emoji, "  ").replace(/[\p{Mark}\p{Default_Ignorable_Code_Point}]/gu, "");
  return stringWidth(text);
}

export function truncateColumns(input: string, width: number): string {
  if (width <= 0) return "";
  let result = "";
  let columns = 0;
  for (const { segment } of graphemes.segment(strip(input))) {
    const next = visibleLen(segment);
    if (columns + next > width) break;
    result += segment;
    columns += next;
  }
  return result;
}

/**
 * Strip ANSI/OSC escape sequences, C0/C1 control characters, and non-shaping
 * format characters (like bidi overrides), then enforce a max terminal column width.
 */
export function sanitizePlainText(raw: unknown, maxCols: number): string {
  if (typeof raw !== "string") return "";
  const stripped = stripAnsi(raw)
    .replace(/\p{Cc}/gu, " ")
    .replace(/(?![\u200C\u200D\u{E0020}-\u{E007F}])\p{Cf}/gu, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .join(" ");
  if (stripped === "" || maxCols <= 0) return "";
  if (visibleLen(stripped) <= maxCols) return stripped;
  if (maxCols === 1) return truncateColumns(stripped, 1);
  return `${truncateColumns(stripped, maxCols - 1)}…`;
}
