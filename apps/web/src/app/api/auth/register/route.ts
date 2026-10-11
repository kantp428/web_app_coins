import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/auth";
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
    const response = await fetch(`${apiUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok)
      return NextResponse.json(
        {
          message:
            response.status === 409
              ? "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว"
              : response.status === 400
                ? "กรุณาตรวจสอบข้อมูลสมัครสมาชิก"
                : "ระบบสมัครสมาชิกไม่พร้อมใช้งาน",
        },
        {
          status: [400, 409].includes(response.status) ? response.status : 503,
        },
      );
    return NextResponse.json(
      { message: "สมัครสมาชิกสำเร็จ" },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { message: "เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่" },
      { status: 503 },
    );
  }
}
