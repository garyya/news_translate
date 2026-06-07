const tagPattern = /<[^>]*>/g;
const entityMap = new Map([
  ["amp", "&"],
  ["lt", "<"],
  ["gt", ">"],
  ["quot", "\""],
  ["apos", "'"],
  ["nbsp", " "]
]);

export function decodeEntities(value = "") {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_, entity) => {
    if (entity[0] === "#") {
      const code = entity[1]?.toLowerCase() === "x"
        ? Number.parseInt(entity.slice(2), 16)
        : Number.parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : "";
    }

    return entityMap.get(entity.toLowerCase()) || "";
  });
}

export function cleanText(value = "", maxLength = 800) {
  return decodeEntities(String(value))
    .replace(tagPattern, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function slugify(value) {
  return cleanText(value, 120)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    || crypto.randomUUID();
}
