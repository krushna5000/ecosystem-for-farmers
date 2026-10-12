import formidable from 'formidable';
import fs from 'fs/promises';

export const parseMultipart = async (req, res, next) => {
  const form = formidable({
    maxFileSize: 5 * 1024 * 1024, // 5MB
    keepExtensions: true,
    allowEmptyFiles: false,
    maxFieldsSize: 10 * 1024,
  });

  await new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        // Parse body JSON
        try {
          req.body = fields.body ? JSON.parse(fields.body[0]) : {};
        } catch {
          req.body = {};
        }

        // Single image validation
        if (!files.image || !Array.isArray(files.image) || files.image.length === 0 || !files.image[0].filepath) {
          reject(new Error('No valid image uploaded'));
          return;
        }

        const imageFile = files.image[0];
        const imageBuffer = await fs.readFile(imageFile.filepath);
        await fs.unlink(imageFile.filepath); // Cleanup temp file

        req.imageBuffer = imageBuffer;

        resolve();
        next();
      } catch (parseError) {
        reject(parseError);
      }
    });
  }).catch((error) => {
    console.error('Formidable parse error:', error);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ status: 'error', message: 'File too large (max 5MB)' });
    }
    if (error.message === 'No valid image uploaded') {
      return res.status(400).json({ status: 'error', message: 'No image uploaded' });
    }
    res.status(400).json({ status: 'error', message: 'Upload failed: ' + error.message });
  });
};
