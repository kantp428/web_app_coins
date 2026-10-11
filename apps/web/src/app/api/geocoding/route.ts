import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/auth";
export async function GET(request: NextRequest) {
  const params = new URLSearchParams({
    latitude: request.nextUrl.searchParams.get("latitude") ?? "",
    longitude: request.nextUrl.searchParams.get("longitude") ?? "",
  });
  try {
    const response = await fetch(`${apiUrl}/geocoding/reverse?${params}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(14000),
    });
    return NextResponse.json(await response.json(), {
      status: response.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { message: "ค้นหาที่อยู่ไม่ได้ กรุณากรอกเอง" },
      { status: 503 },
    );
  }
}
