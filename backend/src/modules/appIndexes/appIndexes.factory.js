// Pure DB I/O (MongoDB) for field index snapshots. No business rules, no req/res.
import { FieldIndex } from "./appIndexes.schema.js";

/** Create the snapshot for a field or replace it; resolves to the stored document. */
export function upsertFieldIndexInDB(fieldId, { date, indices }) {
  return FieldIndex.findOneAndUpdate(
    { fieldId },
    {
      fieldId,
      date,
      indices,
    },
    { upsert: true, new: true },
  );
}
