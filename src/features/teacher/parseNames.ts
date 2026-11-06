/** "Aarav, Riya\nSana" -> ["Aarav", "Riya", "Sana"] (trimmed, no repeats, max 60) */
export function parseNames(text: string): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const raw of text.split(/[\n,;]+/)) {
    const name = raw.trim().replace(/\s+/g, " ");
    const key = name.toLowerCase();
    if (name && !seen.has(key)) {
      seen.add(key);
      names.push(name);
    }
  }
  return names.slice(0, 60);
}