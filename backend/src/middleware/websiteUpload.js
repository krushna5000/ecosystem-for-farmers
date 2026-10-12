import { createUploader } from "../utils/upload.js";

// Same as the old website backend: memory storage, 50MB per file, no mime filter.
const upload = createUploader({ maxSizeMB: 50 });

const blogMediaFields = [
  { name: "images", maxCount: 10 },
  { name: "video", maxCount: 1 },
];

export const uploadBlogMedia = upload.fields(blogMediaFields);
// The update route also declares `tags[]`, as it always has.
export const uploadBlogMediaWithTags = upload.fields([...blogMediaFields, { name: "tags[]" }]);
export const uploadTeamImage = upload.single("image");
