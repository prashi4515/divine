/**
 * Turn scraped commentary walls into readable paragraphs.
 * Prefers explicit breaks; subdivides long blocks into ~2–3 sentence stanzas.
 */
export function splitReadingParagraphs(text: string): string[] {
  const normalized = text
    .replace(/\r\n/g, "\n")
    .replace(/\.\s*\t+\s*/g, ".\n\n")
    .replace(/\.\s{3,}/g, ".\n\n")
    .replace(/\u0964\s*\t+\s*/g, "।\n\n");

  const chunks = normalized
    .split(/\n{2,}/)
    .map((para) => para.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (chunks.length === 0) {
    const blob = text.replace(/\s+/g, " ").trim();
    return blob ? groupSentences(blob) : [];
  }

  return chunks.flatMap((chunk) =>
    chunk.length > 420 ? groupSentences(chunk) : [chunk],
  );
}

function groupSentences(blob: string): string[] {
  const sentences = blob
    .split(/(?<=[।.?!…])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length <= 2) return [blob];

  const paragraphs: string[] = [];
  let bucket: string[] = [];
  let chars = 0;
  const target = 260;

  for (const sentence of sentences) {
    bucket.push(sentence);
    chars += sentence.length;
    const fullEnough = bucket.length >= 2 && chars >= target;
    const longEnough = bucket.length >= 3;
    if (fullEnough || longEnough) {
      paragraphs.push(bucket.join(" "));
      bucket = [];
      chars = 0;
    }
  }
  if (bucket.length) paragraphs.push(bucket.join(" "));
  return paragraphs;
}
