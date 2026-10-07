// Drizzle wraps driver errors in DrizzleQueryError (the pg error is in `.cause`).
// These helpers keep the old `error.code === '23505'` / `error.message` behaviour.
const driverError = (err) => err?.cause ?? err;

export const isUniqueViolation = (err) => driverError(err)?.code === "23505";

export const errorMessage = (err) => driverError(err)?.message ?? err?.message;
