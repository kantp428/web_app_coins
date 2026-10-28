import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiUrl } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const token = (await cookies()).get("session")?.value;
  if (!token)
    return NextResponse.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  try {
    const response = await fetch(`${apiUrl}/recommendations/search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(await request.json()),
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    });
    return NextResponse.json(await response.json(), {
      status: response.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { message: "ค้นหาร้านด้วย AI ไม่สำเร็จ" },
      { status: 503 },
    );
  }
}
