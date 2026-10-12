import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiUrl } from "@/lib/auth";
async function proxy(request: NextRequest) {
  if (
    request.method === "POST" &&
    request.headers.get("origin") !== request.nextUrl.origin
  )
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const token = (await cookies()).get("session")?.value;
  if (!token)
    return NextResponse.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  let body: unknown;
  if (request.method === "POST") {
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "ข้อมูลไม่ถูกต้อง" },
        { status: 400 },
      );
    }
  }
  try {
    const result = await fetch(`${apiUrl}/government/coin-rules`, {
      method: request.method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const data = await result.json();
    return NextResponse.json(data, {
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
export const GET = proxy;
export const POST = proxy;
