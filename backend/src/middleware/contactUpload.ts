import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

// Ensure destination directory exists
const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads/contact-attachments');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_MIMETYPES = new Set([
    // Images
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
]);

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const unique = `${randomUUID()}${ext}`;
        cb(null, unique);
    },
});

const fileFilter = (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    if (ALLOWED_MIMETYPES.has(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type "${file.mimetype}" is not allowed.`));
    }
};

export const contactUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB per file
        files: 5,                    // max 5 attachments
    },
});
