import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiUrl } from "@/lib/auth";

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const token = (await cookies()).get("session")?.value;
  if (!token)
    return NextResponse.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }
  try {
    const result = await fetch(
      `${apiUrl}/government/coin-rules/generate-rates`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
        signal: AbortSignal.timeout(45000),
      },
    );
    return NextResponse.json(await result.json(), {
      status: result.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { message: "เชื่อมต่อระบบไม่ได้ กรุณาโหลดข้อมูลใหม่ก่อนลองซ้ำ" },
      { status: 503 },
    );
  }
}
