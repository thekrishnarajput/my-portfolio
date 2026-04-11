import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure public/uploads directory exists
const uploadDir = path.join(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        // Keep the original filename; if a file with the same name exists it will be overwritten
        cb(null, file.originalname);
    },
});

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
