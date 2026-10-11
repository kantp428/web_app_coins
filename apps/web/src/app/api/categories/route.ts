import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/auth";
export async function GET() {
  try {
    const response = await fetch(`${apiUrl}/categories`, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error("categories unavailable");
    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json(
      { message: "โหลดหมวดหมู่ร้านไม่ได้ กรุณาลองใหม่" },
      { status: 503 },
    );
  }
}
