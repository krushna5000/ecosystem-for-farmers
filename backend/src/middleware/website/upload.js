import { createUploader } from "../../utils/upload.js";

// Same as the old website backend: memory storage, 50MB per file, no mime filter.
export const upload = createUploader({ maxSizeMB: 50 });
