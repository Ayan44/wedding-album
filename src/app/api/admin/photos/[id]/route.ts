import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { deleteWeddingPhoto } from "@/lib/cloudinary";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json(
      { error: "Səlahiyyətiniz çatmır. Lütfən daxil olun." },
      { status: 401 }
    );
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Şəkil ID-si göstərilməyib." },
      { status: 400 }
    );
  }

  // public_id is URL-encoded (e.g. "toy-2026/abc123") → decode it
  const publicId = decodeURIComponent(id);

  const success = await deleteWeddingPhoto(publicId);

  if (!success) {
    return NextResponse.json(
      { error: "Şəkil silinərkən xəta baş verdi." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
