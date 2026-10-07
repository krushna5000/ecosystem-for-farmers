/** multipart text fields may arrive as a single string or an array */
export const toArray = (value) => (value ? (Array.isArray(value) ? value : [value]) : []);

export const isNonEmptyArray = (value) => Array.isArray(value) && value.length > 0;

export const toBool = (value) => value === "true" || value === true;
