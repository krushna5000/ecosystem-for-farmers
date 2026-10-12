// Pure helpers that read the JSON-ish form fields of a product request.
// Multipart forms send arrays / objects as JSON strings; JSON bodies send them as-is.
export const parseMaybeJson = (value) =>
  typeof value === "string" ? JSON.parse(value) : value;

export const parseCropIds = (value) => {
  const parsed = parseMaybeJson(value);
  return Array.isArray(parsed) ? parsed.map(Number) : [Number(parsed)];
};

export const parseDiseaseNames = (value) => {
  const parsed = parseMaybeJson(value);
  return Array.isArray(parsed) ? parsed : [parsed];
};
