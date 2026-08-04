/**
 * Reusable Cloudinary upload service.
 *
 * All uploaded files are stored directly in Cloudinary (under the
 * `mukeshkarn.com/...` folder) and referenced by their secure HTTPS URL.
 * No files are written to the local filesystem.
 *
 * Credentials are read from environment variables:
 *   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */
import { v2 as cloudinary } from 'cloudinary';
import env from '../config/env';

// Logical subfolders mirror the previous local layout:
//   public/uploads                  → mukeshkarn.com (project images, skill icons, logo/favicon)
//   public/uploads/contact-attachments → mukeshkarn.com/contact-attachments
export const UPLOAD_FOLDER_ROOT = 'mukeshkarn.com';
export const UPLOAD_FOLDER_CONTACT_ATTACHMENTS = 'mukeshkarn.com/contact-attachments';

let configured = false;

const getCloudinary = (): typeof cloudinary => {
  if (!configured) {
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
      throw new Error(
        'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET environment variables.'
      );
    }
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });
    configured = true;
  }
  return cloudinary;
};

export interface CloudinaryUploadResult {
  url: string; // secure HTTPS URL to the uploaded asset
  publicId: string; // Cloudinary public_id (used as the stored name)
}

/**
 * Upload a file buffer (e.g. from multer memory storage) to Cloudinary.
 *
 * When `filename` is provided the asset keeps the original file name as its
 * Cloudinary public_id (Cloudinary strips the extension — the original format
 * is preserved, so the URL still ends in e.g. `my-image.png`). `overwrite`
 * lets a re-uploaded file with the same name replace the previous asset.
 * Pass `unique: true` where name collisions must never overwrite an existing
 * asset (e.g. contact attachments) — Cloudinary then appends a random suffix.
 *
 * @param buffer      Raw file bytes from multer's memory storage.
 * @param options.folder        Cloudinary folder, e.g. `mukeshkarn.com/contact-attachments`.
 * @param options.resourceType  'image' for images, 'auto' for mixed documents/images.
 * @param options.filename      Original file name; used as the public_id when given.
 * @param options.unique        When true, append a random suffix instead of overwriting.
 */
export const uploadBuffer = (
  buffer: Buffer,
  options: {
    folder: string;
    resourceType?: 'image' | 'raw' | 'auto';
    filename?: string;
    unique?: boolean;
  }
): Promise<CloudinaryUploadResult> =>
  new Promise((resolve, reject) => {
    const uploadOptions: Record<string, unknown> = {
      folder: options.folder,
      resource_type: options.resourceType ?? 'auto',
      overwrite: true,
    };
    if (options.filename) {
      uploadOptions.use_filename = true;
      uploadOptions.unique_filename = !!options.unique;
      // Required for stream (buffer) uploads — without it Cloudinary has no
      // original filename to derive the public_id from and defaults to "file".
      uploadOptions.filename = options.filename;
    }

    const uploadStream = getCloudinary().uploader.upload_stream(uploadOptions, (error, result) => {
      if (error || !result) {
        reject(error ?? new Error('Cloudinary upload failed'));
        return;
      }
      resolve({ url: result.secure_url, publicId: result.public_id });
    });
    uploadStream.end(buffer);
  });

// Matches plain asset URLs served by this app, e.g.
//   https://res.cloudinary.com/<cloud>/image/upload/v123/mukeshkarn.com/my-image.png
//   https://res.cloudinary.com/<cloud>/raw/upload/v123/mukeshkarn.com/contact-attachments/resume.pdf
const CLOUDINARY_URL_REGEX =
  /res\.cloudinary\.com\/[^/]+\/(?:image|video|raw|auto)\/upload\/(?:v\d+\/)?(.+)$/;

/**
 * True when the URL points at an asset we manage on Cloudinary (i.e. it lives
 * under our `mukeshkarn.com` folder). External URLs and legacy local paths
 * (`/uploads/...`) are never treated as deletable.
 */
export const isManagedCloudinaryUrl = (url: unknown): url is string =>
  typeof url === 'string' &&
  CLOUDINARY_URL_REGEX.test(url) &&
  url.includes(`${UPLOAD_FOLDER_ROOT}/`);

/**
 * Extract the Cloudinary public_id (including any folder prefix and, possibly,
 * the file extension) from one of our asset URLs.
 */
export const getPublicIdFromUrl = (url: string): string | null => {
  const match = url.match(CLOUDINARY_URL_REGEX);
  return match ? match[1] : null;
};

/**
 * Delete a single Cloudinary asset by its public_id. `destroy` is idempotent —
 * deleting an asset that does not exist resolves with `result: 'not found'`.
 * Some older uploads kept the file extension inside the public_id, so we retry
 * without the trailing extension when the first attempt comes up empty.
 */
export const deleteAsset = async (publicId: string): Promise<boolean> => {
  const tryDestroy = async (pid: string): Promise<boolean> => {
    const result = await getCloudinary().uploader.destroy(pid);
    return result?.result === 'ok' || result?.result === 'not found';
  };

  if (await tryDestroy(publicId)) return true;

  const withoutExtension = publicId.replace(/\.[^./]+$/, '');
  if (withoutExtension !== publicId) {
    return tryDestroy(withoutExtension);
  }
  return false;
};

/**
 * Best-effort deletion of the given Cloudinary public_ids (the exact ids, so
 * no URL parsing is involved). Failures are logged and never throw, so callers'
 * DB operations are never blocked by a Cloudinary hiccup.
 */
export const deleteAssets = async (publicIds: Array<string | null | undefined>): Promise<void> => {
  const unique = [
    ...new Set(publicIds.filter((id): id is string => typeof id === 'string' && id.length > 0)),
  ];

  await Promise.allSettled(
    unique.map(async (publicId) => {
      try {
        await deleteAsset(publicId);
      } catch (error) {
        console.warn(
          `[Cloudinary] Failed to delete asset "${publicId}":`,
          (error as Error)?.message ?? error
        );
      }
    })
  );
};

/**
 * Best-effort deletion of every managed Cloudinary asset referenced by the
 * given URLs. Only assets under our own folder are touched; external URLs are
 * ignored. Failures are logged and never throw, so callers' DB operations are
 * never blocked by a Cloudinary hiccup.
 */
export const deleteAssetsByUrls = async (urls: Array<string | null | undefined>): Promise<void> => {
  const publicIds = urls
    .filter(isManagedCloudinaryUrl)
    .map((url) => getPublicIdFromUrl(url))
    .filter((id): id is string => id !== null);
  await deleteAssets(publicIds);
};
