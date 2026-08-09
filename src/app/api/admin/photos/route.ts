import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getWeddingPhotos, CloudinaryPhoto } from "@/lib/cloudinary";

export interface ParsedPhoto {
  public_id: string;
  secure_url: string;
  created_at: string;
  format: string;
  guestName: string;
  message: string;
}

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json(
      { error: "Səlahiyyətiniz çatmır. Lütfən daxil olun." },
      { status: 401 }
    );
  }

  try {
    const rawPhotos: CloudinaryPhoto[] = await getWeddingPhotos();

    const photos: ParsedPhoto[] = rawPhotos.map((photo) => {
      // Decode context metadata if available
      let guestName = "Qonaq";
      let message = "";

      if (photo.context?.custom) {
        if (photo.context.custom.name) {
          try {
            guestName = decodeURIComponent(photo.context.custom.name);
          } catch {
            guestName = photo.context.custom.name;
          }
        }
        if (photo.context.custom.message) {
          try {
            message = decodeURIComponent(photo.context.custom.message);
          } catch {
            message = photo.context.custom.message;
          }
        }
      }

      return {
        public_id: photo.public_id,
        secure_url: photo.secure_url,
        created_at: photo.created_at,
        format: photo.format,
        guestName,
        message,
      };
    });

    return NextResponse.json({ photos });
  } catch (error) {
    console.error("Photos API error:", error);
    return NextResponse.json(
      { error: "Şəkillər çəkilərkən xəta baş verdi." },
      { status: 500 }
    );
  }
}
