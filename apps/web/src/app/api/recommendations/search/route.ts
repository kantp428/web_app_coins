import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { hasTrustedOrigin } from "@/lib/request-origin";
import {
  storeSearchReplySchema,
  storeSearchRequestSchema,
} from "@/lib/store-search-contract";

export const runtime = "nodejs";
function failure(message: string, status: number) {
  return NextResponse.json(
    { message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}
export async function POST(request: NextRequest) {
  if (!hasTrustedOrigin(request))
    return failure("ไม่อนุญาตคำขอจากเว็บไซต์นี้", 403);
  const token = (await cookies()).get("session")?.value;
  if (!token) return failure("กรุณาเข้าสู่ระบบอีกครั้ง", 401);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return failure("รูปแบบคำค้นหาไม่ถูกต้อง", 400);
  }
  const parsed = storeSearchRequestSchema.safeParse(body);
  if (!parsed.success)
    return failure("กรุณาตรวจสอบคำค้นหา พิกัด และรัศมี", 400);
  const deadline = AbortSignal.timeout(180_000);
  try {
    const url = new URL(process.env.AI_SERVICE_URL ?? "http://127.0.0.1:8000");
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    )
      return failure("ระบบค้นหา AI ยังไม่พร้อมใช้งาน", 503);
    const response = await fetch(
      `${url.toString().replace(/\/$/, "")}/stores/search`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.any([request.signal, deadline]),
      },
    );
    if (!response.ok) {
      if (response.status === 401)
        return failure("เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง", 401);
      if (response.status === 403)
        return failure("ค้นหาร้านได้เฉพาะบัญชีลูกค้า", 403);
      if (response.status === 504)
        return failure("AI ค้นหานานเกินไป กรุณาลองใหม่", 504);
      if ([404, 503].includes(response.status))
        return failure("ระบบค้นหา AI ยังไม่พร้อม กรุณาลองใหม่ภายหลัง", 503);
      return failure("AI ค้นหาร้านไม่สำเร็จ กรุณาลองใหม่", 502);
    }
    let json: unknown;
    try {
      json = await response.json();
    } catch {
      return failure("ข้อมูลร้านจาก AI ไม่ถูกต้อง กรุณาลองใหม่", 502);
    }
    const result = storeSearchReplySchema.safeParse(json);
    if (!result.success || result.data.meta.page !== parsed.data.page)
      return failure("ข้อมูลร้านจาก AI ไม่ถูกต้อง กรุณาลองใหม่", 502);
    return NextResponse.json(result.data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return failure(
      deadline.aborted
        ? "AI ค้นหานานเกินไป กรุณาลองใหม่"
        : "เชื่อมต่อระบบค้นหา AI ไม่สำเร็จ",
      deadline.aborted ? 504 : 503,
    );
  }
}
