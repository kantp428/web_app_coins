import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiUrl } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = (await cookies()).get("session")?.value;
  if (!token)
    return NextResponse.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  try {
    const result = await fetch(
      `${apiUrl}/government/stores${request.nextUrl.search}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      },
    );
    return NextResponse.json(await result.json(), {
      status: result.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { message: "เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่" },
      { status: 503 },
    );
  }
}
