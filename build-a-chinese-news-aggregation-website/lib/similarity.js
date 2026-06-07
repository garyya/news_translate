const stopWords = new Set([
  "the", "a", "an", "and", "or", "to", "of", "in", "on", "for", "with",
  "as", "by", "from", "at", "is", "are", "was", "were", "be", "this",
  "that", "after", "over", "new", "latest", "live", "updates"
]);

export function tokenize(value = "") {
  const words = value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));

  return new Set(words);
}

export function jaccardSimilarity(left, right) {
  const a = tokenize(left);
  const b = tokenize(right);
  if (!a.size || !b.size) {
    return 0;
  }

  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) {
      intersection += 1;
    }
  }

  return intersection / (a.size + b.size - intersection);
}
