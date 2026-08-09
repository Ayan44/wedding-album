import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { generateWeddingZipUrl } from "@/lib/cloudinary";

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json(
      { error: "Səlahiyyətiniz çatmır. Lütfən daxil olun." },
      { status: 401 }
    );
  }

  try {
    const zipUrl = generateWeddingZipUrl();
    return NextResponse.json({ zipUrl });
  } catch (error) {
    console.error("ZIP URL generation error:", error);
    return NextResponse.json(
      { error: "ZIP arxivi yaradılarkən xəta baş verdi." },
      { status: 500 }
    );
  }
}
