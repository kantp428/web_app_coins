import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { chatReplySchema, chatRequestSchema } from "@/lib/chat-contract";
import { hasTrustedOrigin } from "@/lib/request-origin";

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
    return failure("รูปแบบข้อความไม่ถูกต้อง", 400);
  }
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success)
    return failure(
      "กรุณาตรวจสอบข้อความและจุดค้นหา (ข้อความไม่เกิน 2,000 ตัวอักษร)",
      400,
    );
  const deadline = AbortSignal.timeout(180_000);
  try {
    const url = new URL(process.env.AI_SERVICE_URL ?? "http://127.0.0.1:8000");
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      return failure("ระบบผู้ช่วย AI ยังไม่พร้อมใช้งาน", 503);
    }
    const response = await fetch(`${url.toString().replace(/\/$/, "")}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.any([request.signal, deadline]),
    });
    if (!response.ok) {
      if (response.status === 401)
        return failure("เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง", 401);
      if (response.status === 403)
        return failure("ผู้ช่วย AI ใช้ได้เฉพาะบัญชีลูกค้า", 403);
      if (response.status === 504)
        return failure(
          "AI ใช้เวลาตอบนานเกินไป กรุณาลองส่งข้อความอีกครั้ง",
          504,
        );
      if ([404, 503].includes(response.status))
        return failure("ผู้ช่วย AI ยังไม่พร้อม กรุณาลองใหม่ภายหลัง", 503);
      return failure("ผู้ช่วย AI ประมวลผลไม่สำเร็จ กรุณาลองใหม่", 502);
    }
    let json: unknown;
    try {
      json = await response.json();
    } catch {
      return failure("ข้อมูลตอบกลับจากผู้ช่วย AI ไม่ถูกต้อง กรุณาลองใหม่", 502);
    }
    const result = chatReplySchema.safeParse(json);
    if (
      !result.success ||
      (result.data.storeIds.length > 0 && !parsed.data.location)
    ) {
      return failure("ข้อมูลตอบกลับจากผู้ช่วย AI ไม่ถูกต้อง กรุณาลองใหม่", 502);
    }
    return NextResponse.json(result.data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return failure(
      deadline.aborted
        ? "AI ใช้เวลาตอบนานเกินไป กรุณาลองใหม่"
        : "เชื่อมต่อผู้ช่วย AI ไม่ได้ กรุณาลองใหม่ภายหลัง",
      deadline.aborted ? 504 : 503,
    );
  }
}
