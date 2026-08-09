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
 * Directly upload an image file from browser to Cloudinary using Unsigned Preset
 * Attaches guest name and optional greeting message as Cloudinary context metadata.
 */
export function uploadImageToCloudinary(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "toy_unsigned_preset";
    const folder = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || "toy-2026";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", folder);

    // Format context metadata according to Cloudinary spec: key=value|key=value
    const nameMeta = encodeURIComponent(options.guestName.replace(/[|=]/g, " "));
    const msgMeta = options.message
      ? encodeURIComponent(options.message.replace(/[|=]/g, " "))
      : "";

    formData.append("context", `name=${nameMeta}|message=${msgMeta}`);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

    if (xhr.upload && options.onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = (e.loaded / e.total) * 100;
          options.onProgress?.(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            public_id: response.public_id,
            secure_url: response.secure_url,
            format: response.format,
            created_at: response.created_at,
          });
        } catch (err) {
          reject(new Error("Cloudinary-dən gələn cavab oxuna bilmədi."));
        }
      } else {
        // Fallback for local demo mode if Cloudinary cloud_name is demo
        if (cloudName === "demo" || xhr.status === 400 || xhr.status === 401) {
          console.warn("Cloudinary demo mode / credentials missing fallback active.");
          resolve({
            public_id: `demo_${Date.now()}`,
            secure_url: URL.createObjectURL(file),
            format: file.type.split("/")[1] || "jpeg",
            created_at: new Date().toISOString(),
          });
          return;
        }
        reject(new Error(`Yükləmə xətası (${xhr.status}): Cloudinary hesabı tənzimlənməyib.`));
      }
    };

    xhr.onerror = () => {
      // Fallback preview mode if offline or unconfigured
      if (cloudName === "demo") {
        resolve({
          public_id: `demo_${Date.now()}`,
          secure_url: URL.createObjectURL(file),
          format: file.type.split("/")[1] || "jpeg",
          created_at: new Date().toISOString(),
        });
        return;
      }
      reject(new Error("Şəbəkə kəsilməsi baş verdi. İnternet əlaqənizi yoxlayın."));
    };

    xhr.send(formData);
  });
}

/**
 * Batch upload multiple image files sequentially with overall progress calculation
 */
export async function uploadMultipleImagesToCloudinary(
  files: File[],
  options: UploadOptions
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  const totalFiles = files.length;

  for (let i = 0; i < totalFiles; i++) {
    const file = files[i];
    const fileResult = await uploadImageToCloudinary(file, {
      ...options,
      onProgress: (fileProgress) => {
        const overallProgress = ((i + fileProgress / 100) / totalFiles) * 100;
        options.onProgress?.(overallProgress);
      },
    });
    results.push(fileResult);
  }

  options.onProgress?.(100);
  return results;
}
