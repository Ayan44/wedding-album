import { NextResponse } from "next/server";
import { verifyAdminPassword, ADMIN_COOKIE_NAME, ADMIN_COOKIE_VALUE } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "Parol daxil edilməyib." },
        { status: 400 }
      );
    }

    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: "Yanlış parol! Qaydaları gözləyərək yenidən yoxlayın." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: ADMIN_COOKIE_VALUE,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Server xətası baş verdi." },
      { status: 500 }
    );
  }
}
