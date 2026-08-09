import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary server-side SDK
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
  secure: true,
});

export interface CloudinaryPhoto {
  public_id: string;
  secure_url: string;
  created_at: string;
  format: string;
  width: number;
  height: number;
  context?: {
    custom?: {
      name?: string;
      message?: string;
    };
  };
}

/**
 * Fetch all photos from the designated wedding folder sorted by creation date (newest first)
 */
export async function getWeddingPhotos(): Promise<CloudinaryPhoto[]> {
  const folder = process.env.CLOUDINARY_FOLDER || "toy-2026";

  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: `${folder}/`,
      max_results: 500,
      context: true,
      direction: "desc",
    });

    return result.resources as CloudinaryPhoto[];
  } catch (error) {
    console.error("Error fetching photos from Cloudinary:", error);
    return [];
  }
}

/**
 * Generate a ZIP archive URL containing all photos in the wedding folder
 */
export function generateWeddingZipUrl(): string {
  const folder = process.env.CLOUDINARY_FOLDER || "toy-2026";
  
  return cloudinary.utils.download_zip_url({
    prefixes: [`${folder}/`],
    target_public_id: `toy_sekillari_${Date.now()}`,
    resource_type: "image",
  });
}

/**
 * Delete a photo from Cloudinary by its public_id
 */
export async function deleteWeddingPhoto(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("Error deleting photo from Cloudinary:", error);
    return false;
  }
}

export default cloudinary;
