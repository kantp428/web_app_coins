import { NextRequest, NextResponse } from "next/server";
import { apiUrl, destinations } from "@/lib/auth";
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }
  try {
    const upstream = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!upstream.ok)
      return NextResponse.json(
        {
          message:
            upstream.status === 401
              ? "ชื่อผู้ใช้ รหัสผ่าน หรือบทบาทไม่ถูกต้อง"
              : upstream.status === 400
                ? "กรุณาตรวจสอบข้อมูลเข้าสู่ระบบ"
                : "ระบบเข้าสู่ระบบไม่พร้อมใช้งาน",
        },
        {
          status: [400, 401].includes(upstream.status) ? upstream.status : 503,
        },
      );
    const result = await upstream.json();
    if (
      typeof result.accessToken !== "string" ||
      !destinations[result.user?.role]
    )
      throw new Error("Invalid response");
    const response = NextResponse.json(
      { destination: destinations[result.user.role] },
      { headers: { "Cache-Control": "no-store" } },
    );
    response.cookies.set("session", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 3600,
    });
    return response;
  } catch {
    return NextResponse.json(
      { message: "เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่" },
      { status: 503 },
    );
  }
}
