import "server-only";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/auth";

export async function proxyGovernmentReport(
  request: NextRequest,
  endpoint: "dashboard" | "reports",
) {
  const token = (await cookies()).get("session")?.value;
  if (!token)
    return NextResponse.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  const target = new URL(`${apiUrl}/government/${endpoint}`);
  request.nextUrl.searchParams.forEach((value, key) =>
    target.searchParams.append(key, value),
  );
  try {
    const result = await fetch(target, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    const data = await result.json();
    return NextResponse.json(data, {
      status: result.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { message: "เชื่อมต่อระบบรายงานไม่ได้ กรุณาลองใหม่" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
