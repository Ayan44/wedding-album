export interface UploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  created_at: string;
}

export interface UploadOptions {
  guestName: string;
  message?: string;
  onProgress?: (progress: number) => void;
}

/**
 * Upload an image to Cloudinary using fetch API (more reliable than XHR on mobile)
 */
export async function uploadImageToCloudinary(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const folder = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || "toy-2026";

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary konfiqurasiyası tamamlanmayıb. Zəhmət olmasa administrator ilə əlaqə saxlayın."
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  // Attach guest name and message as Cloudinary context metadata
  const nameMeta = options.guestName.replace(/[|=]/g, " ");
  const msgMeta = options.message
    ? options.message.replace(/[|=]/g, " ")
    : "";
  formData.append("context", `name=${nameMeta}|message=${msgMeta}`);

  // Simulate progress (fetch doesn't natively support upload progress)
  let progressInterval: ReturnType<typeof setInterval> | null = null;
  if (options.onProgress) {
    let fakeProgress = 0;
    options.onProgress(5);
    progressInterval = setInterval(() => {
      fakeProgress = Math.min(fakeProgress + 8, 85);
      options.onProgress?.(fakeProgress);
    }, 300);
  }

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (progressInterval) {
      clearInterval(progressInterval);
    }

    if (!response.ok) {
      let errMessage = `Yükləmə xətası (${response.status}).`;
      try {
        const errData = await response.json();
        if (errData?.error?.message) {
          errMessage = `Cloudinary xətası: ${errData.error.message}`;
        }
      } catch {
        // ignore parse error
      }
      throw new Error(errMessage);
    }

    const data = await response.json();
    options.onProgress?.(100);

    return {
      public_id: data.public_id,
      secure_url: data.secure_url,
      format: data.format,
      created_at: data.created_at,
    };
  } catch (err) {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    throw err;
  }
}

/**
 * Batch upload multiple image files sequentially with overall progress
 */
export async function uploadMultipleImagesToCloudinary(
  files: File[],
  options: UploadOptions
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  const totalFiles = files.length;

  for (let i = 0; i < totalFiles; i++) {
    const fileResult = await uploadImageToCloudinary(files[i], {
      ...options,
      onProgress: (fileProgress) => {
        const overallProgress =
          ((i + fileProgress / 100) / totalFiles) * 100;
        options.onProgress?.(overallProgress);
      },
    });
    results.push(fileResult);
  }

  options.onProgress?.(100);
  return results;
}
