import multer from 'multer';

// Files are stored in Cloudinary (see services/cloudinaryService), so multer only
// keeps each file in memory for the duration of the request — nothing touches disk.
const storage = multer.memoryStorage();

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'image/svg+xml') {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB size limit
  },
});
