import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiUrl } from "@/lib/auth";
export async function GET(request: NextRequest) {
  const token = (await cookies()).get("session")?.value;
  if (!token)
    return NextResponse.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  const query = new URLSearchParams();
  for (const key of [
    "latitude",
    "longitude",
    "radiusKm",
    "categoryIds",
    "page",
    "pageSize",
  ]) {
    const value = request.nextUrl.searchParams.get(key);
    if (value !== null) query.set(key, value);
  }
  try {
    const response = await fetch(`${apiUrl}/stores?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    return NextResponse.json(await response.json(), {
      status: response.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { message: "โหลดร้านไม่ได้ กรุณาลองใหม่" },
      { status: 503 },
    );
  }
}
