import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/auth";
import { hasTrustedOrigin } from "@/lib/request-origin";
import { chatStoreRequestSchema, chatStoresSchema } from "@/lib/chat-contract";
const fail = (message: string, status: number) =>
  NextResponse.json(
    { message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request))
    return fail("ไม่อนุญาตคำขอจากเว็บไซต์นี้", 403);
  const token = (await cookies()).get("session")?.value;
  if (!token) return fail("กรุณาเข้าสู่ระบบ", 401);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("ข้อมูลไม่ถูกต้อง", 400);
  }
  const input = chatStoreRequestSchema.safeParse(body);
  if (!input.success) return fail("รหัสร้านแนะนำไม่ถูกต้อง", 400);
  try {
    const response = await fetch(`${apiUrl}/recommendations/stores`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input.data),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(10000)]),
    });
    if (!response.ok)
      return fail(
        "โหลดข้อมูลร้านแนะนำไม่สำเร็จ",
        [400, 401, 403].includes(response.status) ? response.status : 502,
      );
    const result = chatStoresSchema.safeParse(await response.json());
    if (
      !result.success ||
      new Set(result.data.stores.map((s) => s.id)).size !==
        result.data.stores.length ||
      result.data.stores.some((s) => !input.data.shopIds.includes(s.id))
    )
      return fail("ข้อมูลร้านแนะนำไม่ถูกต้อง", 502);
    return NextResponse.json(result.data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return fail("เชื่อมต่อระบบร้านค้าไม่ได้", 503);
  }
}
